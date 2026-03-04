import { ApiError } from "@/lib/server/http";
import { inMemoryStore } from "@/lib/server/repository/inMemoryStore";
import {
  type CreateSessionEventInput,
  type CreateSessionInput,
  type ExamSession,
  type SessionEvent,
} from "@/lib/server/models";
import { examService } from "@/lib/server/services/examService";

function nowIso() {
  return new Date().toISOString();
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

function calculateFocusScore(session: Pick<ExamSession, "focusLossCount" | "blockedClipboardActions" | "integrityFlags">) {
  const weightedPenalty =
    session.focusLossCount * 6 + session.blockedClipboardActions * 3 + session.integrityFlags * 4;
  return Math.max(35, 100 - weightedPenalty);
}

function applyEventImpact(session: ExamSession, type: CreateSessionEventInput["type"]) {
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
  private requireSession(examId: string, sessionId: string): ExamSession {
    const session = inMemoryStore.sessions.get(sessionId);
    if (!session || session.examId !== examId) {
      throw new ApiError(404, "SESSION_NOT_FOUND", "Session was not found.");
    }

    return session;
  }

  listForExam(examId: string): ExamSession[] {
    examService.getById(examId);

    return [...inMemoryStore.sessions.values()]
      .filter((session) => session.examId === examId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((session) => cloneSession(session));
  }

  getById(examId: string, sessionId: string): ExamSession {
    examService.getById(examId);
    return cloneSession(this.requireSession(examId, sessionId));
  }

  create(examId: string, input: CreateSessionInput): ExamSession {
    examService.getById(examId);

    const now = nowIso();
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

  listEvents(examId: string, sessionId: string): SessionEvent[] {
    this.getById(examId, sessionId);
    return (inMemoryStore.sessionEvents.get(sessionId) ?? []).map((event) => cloneEvent(event));
  }

  addEvent(examId: string, sessionId: string, input: CreateSessionEventInput) {
    const currentSession = this.requireSession(examId, sessionId);
    const nextSession: ExamSession = {
      ...currentSession,
    };

    applyEventImpact(nextSession, input.type);
    nextSession.focusScore = calculateFocusScore(nextSession);
    nextSession.updatedAt = nowIso();

    inMemoryStore.sessions.set(nextSession.id, nextSession);

    const event: SessionEvent = {
      id: makeId("event"),
      examId,
      sessionId,
      type: input.type,
      detail: input.detail,
      severity: input.severity,
      at: nowIso(),
    };

    const existingEvents = inMemoryStore.sessionEvents.get(sessionId) ?? [];
    inMemoryStore.sessionEvents.set(sessionId, [event, ...existingEvents].slice(0, 200));

    return {
      session: cloneSession(nextSession),
      event: cloneEvent(event),
    };
  }
}

export const sessionService = new SessionService();
