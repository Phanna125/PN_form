import { DEMO_EXAM_ID, DEMO_SESSION_ID } from "@/lib/shared/demo";
import { DEFAULT_GUARD_POLICY, type Exam, type ExamSession, type SessionEvent } from "@/lib/server/models";

type InMemoryStore = {
  exams: Map<string, Exam>;
  sessions: Map<string, ExamSession>;
  sessionEvents: Map<string, SessionEvent[]>;
};

export const inMemoryStore: InMemoryStore = {
  exams: new Map<string, Exam>(),
  sessions: new Map<string, ExamSession>(),
  sessionEvents: new Map<string, SessionEvent[]>(),
};

export function seedInMemoryStore() {
  if (inMemoryStore.exams.size > 0) return;

  const now = new Date().toISOString();

  const demoExam: Exam = {
    id: DEMO_EXAM_ID,
    title: "Mid-Term Physics Exam",
    course: "Physics 101",
    status: "draft",
    durationMinutes: 90,
    guardPolicy: { ...DEFAULT_GUARD_POLICY },
    questions: [
      {
        id: "q-demo-1",
        type: "essay",
        prompt: "Explain Newton's Third Law in your own words.",
        points: 10,
        options: [],
      },
      {
        id: "q-demo-2",
        type: "mcq",
        prompt: "Calculate velocity after 5 seconds if g = 9.8m/s^2.",
        points: 5,
        options: ["49 m/s", "49 m/s^2", "9.8 m/s"],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const demoSession: ExamSession = {
    id: DEMO_SESSION_ID,
    examId: DEMO_EXAM_ID,
    studentName: "Alex Chen",
    studentId: "#8920194",
    status: "active",
    focusScore: 100,
    focusLossCount: 0,
    blockedClipboardActions: 0,
    integrityFlags: 0,
    startedAt: now,
    updatedAt: now,
  };

  const demoEvent: SessionEvent = {
    id: "event-demo-started",
    examId: DEMO_EXAM_ID,
    sessionId: DEMO_SESSION_ID,
    type: "session-started",
    detail: "Secure session initialized with active guard policies.",
    severity: "info",
    at: now,
  };

  inMemoryStore.exams.set(demoExam.id, demoExam);
  inMemoryStore.sessions.set(demoSession.id, demoSession);
  inMemoryStore.sessionEvents.set(demoSession.id, [demoEvent]);
}

export function resetInMemoryStore() {
  inMemoryStore.exams.clear();
  inMemoryStore.sessions.clear();
  inMemoryStore.sessionEvents.clear();
  seedInMemoryStore();
}

seedInMemoryStore();
