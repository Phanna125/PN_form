export const EXAM_STATUSES = ["draft", "published", "archived"] as const;
export type ExamStatus = (typeof EXAM_STATUSES)[number];

export const QUESTION_TYPES = ["essay", "mcq"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const SESSION_STATUSES = ["active", "completed", "terminated"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_EVENT_TYPES = [
  "session-started",
  "focus-loss",
  "clipboard-block",
  "screenshot-attempt",
  "manual-note",
  "face-verified",
] as const;
export type SessionEventType = (typeof SESSION_EVENT_TYPES)[number];

export const SESSION_EVENT_SEVERITIES = ["info", "warn", "critical"] as const;
export type SessionEventSeverity = (typeof SESSION_EVENT_SEVERITIES)[number];

export type GuardPolicy = {
  lockdownBrowser: boolean;
  clipboardLock: boolean;
  blackoutMode: boolean;
  screenshotDetection: boolean;
  aiFocusLogs: boolean;
};

export const DEFAULT_GUARD_POLICY: GuardPolicy = {
  lockdownBrowser: true,
  clipboardLock: true,
  blackoutMode: true,
  screenshotDetection: true,
  aiFocusLogs: true,
};

export type ExamQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options: string[];
};

export type Exam = {
  id: string;
  title: string;
  course: string;
  status: ExamStatus;
  durationMinutes: number;
  guardPolicy: GuardPolicy;
  questions: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type ExamSession = {
  id: string;
  examId: string;
  studentName: string;
  studentId: string;
  status: SessionStatus;
  focusScore: number;
  focusLossCount: number;
  blockedClipboardActions: number;
  integrityFlags: number;
  startedAt: string;
  updatedAt: string;
};

export type SessionEvent = {
  id: string;
  examId: string;
  sessionId: string;
  type: SessionEventType;
  detail: string;
  severity: SessionEventSeverity;
  at: string;
};

export type QuestionDraftInput = {
  type: QuestionType;
  prompt: string;
  points: number;
  options?: string[];
};

export type CreateExamInput = {
  title: string;
  course: string;
  durationMinutes: number;
  status?: ExamStatus;
  guardPolicy?: Partial<GuardPolicy>;
  questions?: QuestionDraftInput[];
};

export type UpdateExamInput = {
  title?: string;
  course?: string;
  durationMinutes?: number;
  status?: ExamStatus;
  guardPolicy?: Partial<GuardPolicy>;
  questions?: QuestionDraftInput[];
};

export type CreateSessionInput = {
  studentName: string;
  studentId: string;
};

export type CreateSessionEventInput = {
  type: SessionEventType;
  detail: string;
  severity: SessionEventSeverity;
};
