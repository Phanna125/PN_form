import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/server/http";
import { getPersistenceDriver } from "@/lib/server/persistence";
import { inMemoryStore } from "@/lib/server/repository/inMemoryStore";
import { prisma } from "@/lib/server/repository/prismaClient";
import { ensurePrismaDemoData } from "@/lib/server/repository/prismaSeed";
import {
  type CreateSessionEventInput,
  type CreateSessionInput,
  type ExamSession,
  type SessionEvent,
} from "@/lib/server/models";
import { examService } from "@/lib/server/services/examService";

type PrismaSession = Prisma.ExamSessionGetPayload<Record<string, never>>;
type PrismaEvent = Prisma.SessionEventGetPayload<Record<string, never>>;

function nowDate() {
  return new Date();
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

function cloneSession(session: ExamSession): ExamSession {
  return { ...session };
}

function cloneEvent(event: SessionEvent): SessionEvent {
  return { ...event };
}

function mapPrismaSession(session: PrismaSession): ExamSession {
  return {
    id: session.id,
    examId: session.examId,
    studentName: session.studentName,
    studentId: session.studentId,
    status: session.status as ExamSession["status"],
    focusScore: session.focusScore,
    focusLossCount: session.focusLossCount,
    blockedClipboardActions: session.blockedClipboardActions,
    integrityFlags: session.integrityFlags,
    startedAt: session.startedAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function mapPrismaEvent(event: PrismaEvent): SessionEvent {
  return {
    id: event.id,
    examId: event.examId,
    sessionId: event.sessionId,
    type: event.type as SessionEvent["type"],
    detail: event.detail,
    severity: event.severity as SessionEvent["severity"],
    at: event.at.toISOString(),
  };
}

type SessionCounters = Pick<
  ExamSession,
  "focusLossCount" | "blockedClipboardActions" | "integrityFlags"
>;

function calculateFocusScore(session: SessionCounters) {
  const weightedPenalty =
    session.focusLossCount * 6 + session.blockedClipboardActions * 3 + session.integrityFlags * 4;
  return Math.max(35, 100 - weightedPenalty);
}

function applyEventImpact(session: SessionCounters, type: CreateSessionEventInput["type"]) {
  if (type === "focus-loss") {
    session.focusLossCount += 1;
    session.integrityFlags += 1;
  }

  if (type === "clipboard-block") {
    session.blockedClipboardActions += 1;
    session.integrityFlags += 1;
  }

  if (type === "screenshot-attempt") {
    session.integrityFlags += 2;
  }

  if (type === "face-verified" && session.integrityFlags > 0) {
    session.integrityFlags -= 1;
  }
}

class SessionService {
  private useMemory() {
    return getPersistenceDriver() === "memory";
  }

  private async requireSession(examId: string, sessionId: string): Promise<ExamSession> {
    if (this.useMemory()) {
      const session = inMemoryStore.sessions.get(sessionId);
      if (!session || session.examId !== examId) {
        throw new ApiError(404, "SESSION_NOT_FOUND", "Session was not found.");
      }

      return session;
    }

    const session = await prisma.examSession.findFirst({
      where: {
        id: sessionId,
        examId,
      },
    });

    if (!session) {
      throw new ApiError(404, "SESSION_NOT_FOUND", "Session was not found.");
    }

    return mapPrismaSession(session);
  }

  async listForExam(examId: string): Promise<ExamSession[]> {
    await examService.getById(examId);

    if (this.useMemory()) {
      return [...inMemoryStore.sessions.values()]
        .filter((session) => session.examId === examId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((session) => cloneSession(session));
    }

    await ensurePrismaDemoData();
    const sessions = await prisma.examSession.findMany({
      where: { examId },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return sessions.map((session) => mapPrismaSession(session));
  }

  async getById(examId: string, sessionId: string): Promise<ExamSession> {
    await examService.getById(examId);
    return cloneSession(await this.requireSession(examId, sessionId));
  }

  async create(examId: string, input: CreateSessionInput): Promise<ExamSession> {
    await examService.getById(examId);

    if (this.useMemory()) {
      const now = nowDate().toISOString();
      const sessionId = makeId("session");
      const session: ExamSession = {
        id: sessionId,
        examId,
        studentName: input.studentName,
        studentId: input.studentId,
        status: "active",
        focusScore: 100,
        focusLossCount: 0,
        blockedClipboardActions: 0,
        integrityFlags: 0,
        startedAt: now,
        updatedAt: now,
      };

      inMemoryStore.sessions.set(sessionId, session);

      const startEvent: SessionEvent = {
        id: makeId("event"),
        examId,
        sessionId,
        type: "session-started",
        detail: "Secure session initialized with active policy set.",
        severity: "info",
        at: now,
      };

      inMemoryStore.sessionEvents.set(sessionId, [startEvent]);

      return cloneSession(session);
    }

    const timestamp = nowDate();
    const sessionId = makeId("session");

    const createdSession = await prisma.$transaction(async (tx) => {
      const session = await tx.examSession.create({
        data: {
          id: sessionId,
          examId,
          studentName: input.studentName,
          studentId: input.studentId,
          status: "active",
          focusScore: 100,
          focusLossCount: 0,
          blockedClipboardActions: 0,
          integrityFlags: 0,
          startedAt: timestamp,
        },
      });

      await tx.sessionEvent.create({
        data: {
          id: makeId("event"),
          examId,
          sessionId,
          type: "session-started",
          detail: "Secure session initialized with active policy set.",
          severity: "info",
          at: timestamp,
        },
      });

      return session;
    });

    return mapPrismaSession(createdSession);
  }

  async listEvents(examId: string, sessionId: string): Promise<SessionEvent[]> {
    await this.getById(examId, sessionId);

    if (this.useMemory()) {
      return (inMemoryStore.sessionEvents.get(sessionId) ?? []).map((event) => cloneEvent(event));
    }

    const events = await prisma.sessionEvent.findMany({
      where: {
        examId,
        sessionId,
      },
      orderBy: {
        at: "desc",
      },
    });

    return events.map((event) => mapPrismaEvent(event));
  }

  async addEvent(examId: string, sessionId: string, input: CreateSessionEventInput) {
    if (this.useMemory()) {
      const currentSession = await this.requireSession(examId, sessionId);
      const nextSession: ExamSession = {
        ...currentSession,
      };

      applyEventImpact(nextSession, input.type);
      nextSession.focusScore = calculateFocusScore(nextSession);
      nextSession.updatedAt = nowDate().toISOString();

      inMemoryStore.sessions.set(nextSession.id, nextSession);

      const event: SessionEvent = {
        id: makeId("event"),
        examId,
        sessionId,
        type: input.type,
        detail: input.detail,
        severity: input.severity,
        at: nowDate().toISOString(),
      };

      const existingEvents = inMemoryStore.sessionEvents.get(sessionId) ?? [];
      inMemoryStore.sessionEvents.set(sessionId, [event, ...existingEvents].slice(0, 200));

      return {
        session: cloneSession(nextSession),
        event: cloneEvent(event),
      };
    }

    await ensurePrismaDemoData();
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.examSession.findFirst({
        where: { id: sessionId, examId },
      });

      if (!current) {
        throw new ApiError(404, "SESSION_NOT_FOUND", "Session was not found.");
      }

      const counters: SessionCounters = {
        focusLossCount: current.focusLossCount,
        blockedClipboardActions: current.blockedClipboardActions,
        integrityFlags: current.integrityFlags,
      };
      applyEventImpact(counters, input.type);

      const updatedSession = await tx.examSession.update({
        where: {
          id: sessionId,
        },
        data: {
          focusLossCount: counters.focusLossCount,
          blockedClipboardActions: counters.blockedClipboardActions,
          integrityFlags: counters.integrityFlags,
          focusScore: calculateFocusScore(counters),
        },
      });

      const event = await tx.sessionEvent.create({
        data: {
          id: makeId("event"),
          examId,
          sessionId,
          type: input.type,
          detail: input.detail,
          severity: input.severity,
          at: nowDate(),
        },
      });

      const overflow = await tx.sessionEvent.findMany({
        where: { examId, sessionId },
        orderBy: { at: "desc" },
        skip: 200,
        select: { id: true },
      });

      if (overflow.length > 0) {
        await tx.sessionEvent.deleteMany({
          where: {
            id: {
              in: overflow.map((entry) => entry.id),
            },
          },
        });
      }

      return {
        session: updatedSession,
        event,
      };
    });

    return {
      session: mapPrismaSession(result.session),
      event: mapPrismaEvent(result.event),
    };
  }
}

export const sessionService = new SessionService();
