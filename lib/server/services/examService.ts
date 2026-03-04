import { ApiError } from "@/lib/server/http";
import { inMemoryStore } from "@/lib/server/repository/inMemoryStore";
import {
  DEFAULT_GUARD_POLICY,
  type CreateExamInput,
  type Exam,
  type ExamQuestion,
  type ExamStatus,
  type QuestionDraftInput,
  type UpdateExamInput,
} from "@/lib/server/models";

function nowIso() {
  return new Date().toISOString();
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

class ExamService {
  list(status?: ExamStatus): Exam[] {
    const all = [...inMemoryStore.exams.values()];
    const filtered = status ? all.filter((exam) => exam.status === status) : all;

    return filtered
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((exam) => cloneExam(exam));
  }

  getById(examId: string): Exam {
    const exam = inMemoryStore.exams.get(examId);
    if (!exam) {
      throw new ApiError(404, "EXAM_NOT_FOUND", "Exam was not found.");
    }

    return cloneExam(exam);
  }

  create(input: CreateExamInput): Exam {
    const now = nowIso();
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

  update(examId: string, patch: UpdateExamInput): Exam {
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
      updatedAt: nowIso(),
    };

    inMemoryStore.exams.set(examId, next);
    return cloneExam(next);
  }

  delete(examId: string): void {
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
  }
}

export const examService = new ExamService();
