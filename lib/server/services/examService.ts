import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/server/http";
import { getPersistenceDriver } from "@/lib/server/persistence";
import { inMemoryStore } from "@/lib/server/repository/inMemoryStore";
import { prisma } from "@/lib/server/repository/prismaClient";
import { ensurePrismaDemoData } from "@/lib/server/repository/prismaSeed";
import {
  DEFAULT_GUARD_POLICY,
  type CreateExamInput,
  type Exam,
  type ExamQuestion,
  type ExamStatus,
  type QuestionDraftInput,
  type UpdateExamInput,
} from "@/lib/server/models";

type PrismaExamWithQuestions = Prisma.ExamGetPayload<{
  include: { questions: true };
}>;

function nowDate() {
  return new Date();
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

function cloneExam(exam: Exam): Exam {
  return {
    ...exam,
    guardPolicy: { ...exam.guardPolicy },
    questions: exam.questions.map((question) => ({
      ...question,
      options: [...question.options],
    })),
  };
}

function mapQuestion(input: QuestionDraftInput, index: number): ExamQuestion {
  return {
    id: `q-${index + 1}-${crypto.randomUUID().slice(0, 6)}`,
    type: input.type,
    prompt: input.prompt,
    points: input.points,
    options: input.options ?? [],
  };
}

function parseQuestionOptions(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function mapPrismaExam(exam: PrismaExamWithQuestions): Exam {
  return {
    id: exam.id,
    title: exam.title,
    course: exam.course,
    status: exam.status as ExamStatus,
    durationMinutes: exam.durationMinutes,
    guardPolicy: {
      lockdownBrowser: exam.lockdownBrowser,
      clipboardLock: exam.clipboardLock,
      blackoutMode: exam.blackoutMode,
      screenshotDetection: exam.screenshotDetection,
      aiFocusLogs: exam.aiFocusLogs,
    },
    questions: exam.questions
      .sort((a, b) => a.order - b.order)
      .map((question) => ({
        id: question.id,
        type: question.type as ExamQuestion["type"],
        prompt: question.prompt,
        points: question.points,
        options: parseQuestionOptions(question.options),
      })),
    createdAt: exam.createdAt.toISOString(),
    updatedAt: exam.updatedAt.toISOString(),
  };
}

function mapQuestionCreates(inputs: QuestionDraftInput[]): Prisma.ExamQuestionCreateWithoutExamInput[] {
  return inputs.map((input, index) => ({
    id: `q-${index + 1}-${crypto.randomUUID().slice(0, 6)}`,
    type: input.type,
    prompt: input.prompt,
    points: input.points,
    order: index,
    options: input.options ?? [],
  }));
}

class ExamService {
  private useMemory() {
    return getPersistenceDriver() === "memory";
  }

  async list(status?: ExamStatus): Promise<Exam[]> {
    if (this.useMemory()) {
      const all = [...inMemoryStore.exams.values()];
      const filtered = status ? all.filter((exam) => exam.status === status) : all;

      return filtered
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((exam) => cloneExam(exam));
    }

    await ensurePrismaDemoData();

    const exams = await prisma.exam.findMany({
      where: status ? { status } : undefined,
      include: {
        questions: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return exams.map((exam) => mapPrismaExam(exam));
  }

  async getById(examId: string): Promise<Exam> {
    if (this.useMemory()) {
      const exam = inMemoryStore.exams.get(examId);
      if (!exam) {
        throw new ApiError(404, "EXAM_NOT_FOUND", "Exam was not found.");
      }

      return cloneExam(exam);
    }

    await ensurePrismaDemoData();
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      throw new ApiError(404, "EXAM_NOT_FOUND", "Exam was not found.");
    }

    return mapPrismaExam(exam);
  }

  async create(input: CreateExamInput): Promise<Exam> {
    if (this.useMemory()) {
      const now = nowDate().toISOString();
      const examId = makeId("exam");

      const exam: Exam = {
        id: examId,
        title: input.title,
        course: input.course,
        status: input.status ?? "draft",
        durationMinutes: input.durationMinutes,
        guardPolicy: {
          ...DEFAULT_GUARD_POLICY,
          ...input.guardPolicy,
        },
        questions: (input.questions ?? []).map((question, index) => mapQuestion(question, index)),
        createdAt: now,
        updatedAt: now,
      };

      inMemoryStore.exams.set(examId, exam);
      return cloneExam(exam);
    }

    const guardPolicy = {
      ...DEFAULT_GUARD_POLICY,
      ...input.guardPolicy,
    };

    const created = await prisma.exam.create({
      data: {
        id: makeId("exam"),
        title: input.title,
        course: input.course,
        status: input.status ?? "draft",
        durationMinutes: input.durationMinutes,
        lockdownBrowser: guardPolicy.lockdownBrowser,
        clipboardLock: guardPolicy.clipboardLock,
        blackoutMode: guardPolicy.blackoutMode,
        screenshotDetection: guardPolicy.screenshotDetection,
        aiFocusLogs: guardPolicy.aiFocusLogs,
        questions: {
          create: mapQuestionCreates(input.questions ?? []),
        },
      },
      include: {
        questions: true,
      },
    });

    return mapPrismaExam(created);
  }

  async update(examId: string, patch: UpdateExamInput): Promise<Exam> {
    if (this.useMemory()) {
      const current = inMemoryStore.exams.get(examId);
      if (!current) {
        throw new ApiError(404, "EXAM_NOT_FOUND", "Exam was not found.");
      }

      const next: Exam = {
        ...current,
        title: patch.title ?? current.title,
        course: patch.course ?? current.course,
        durationMinutes: patch.durationMinutes ?? current.durationMinutes,
        status: patch.status ?? current.status,
        guardPolicy: patch.guardPolicy
          ? {
              ...current.guardPolicy,
              ...patch.guardPolicy,
            }
          : current.guardPolicy,
        questions: patch.questions
          ? patch.questions.map((question, index) => mapQuestion(question, index))
          : current.questions,
        updatedAt: nowDate().toISOString(),
      };

      inMemoryStore.exams.set(examId, next);
      return cloneExam(next);
    }

    const current = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!current) {
      throw new ApiError(404, "EXAM_NOT_FOUND", "Exam was not found.");
    }

    const updateData: Prisma.ExamUpdateInput = {
      title: patch.title,
      course: patch.course,
      durationMinutes: patch.durationMinutes,
      status: patch.status,
    };

    if (patch.guardPolicy) {
      updateData.lockdownBrowser = patch.guardPolicy.lockdownBrowser;
      updateData.clipboardLock = patch.guardPolicy.clipboardLock;
      updateData.blackoutMode = patch.guardPolicy.blackoutMode;
      updateData.screenshotDetection = patch.guardPolicy.screenshotDetection;
      updateData.aiFocusLogs = patch.guardPolicy.aiFocusLogs;
    }

    if (patch.questions) {
      updateData.questions = {
        deleteMany: {},
        create: mapQuestionCreates(patch.questions),
      };
    }

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: updateData,
      include: {
        questions: true,
      },
    });

    return mapPrismaExam(updated);
  }

  async delete(examId: string): Promise<void> {
    if (this.useMemory()) {
      if (!inMemoryStore.exams.has(examId)) {
        throw new ApiError(404, "EXAM_NOT_FOUND", "Exam was not found.");
      }

      inMemoryStore.exams.delete(examId);

      const sessionIdsToDelete: string[] = [];
      for (const session of inMemoryStore.sessions.values()) {
        if (session.examId === examId) {
          sessionIdsToDelete.push(session.id);
        }
      }

      for (const sessionId of sessionIdsToDelete) {
        inMemoryStore.sessions.delete(sessionId);
        inMemoryStore.sessionEvents.delete(sessionId);
      }
      return;
    }

    const existing = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true },
    });

    if (!existing) {
      throw new ApiError(404, "EXAM_NOT_FOUND", "Exam was not found.");
    }

    await prisma.exam.delete({
      where: { id: examId },
    });
  }
}

export const examService = new ExamService();
