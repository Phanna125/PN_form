import { ApiError } from "@/lib/server/http";
import {
  EXAM_STATUSES,
  QUESTION_TYPES,
  SESSION_EVENT_SEVERITIES,
  SESSION_EVENT_TYPES,
  type CreateExamInput,
  type CreateSessionEventInput,
  type CreateSessionInput,
  type ExamStatus,
  type QuestionDraftInput,
  type QuestionType,
  type SessionEventSeverity,
  type SessionEventType,
  type UpdateExamInput,
} from "@/lib/server/models";

type Obj = Record<string, unknown>;

function isObject(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asObject(value: unknown, label: string): Obj {
  if (!isObject(value)) {
    throw new ApiError(400, "VALIDATION_ERROR", `${label} must be an object.`);
  }

  return value;
}

function readString(
  source: Obj,
  field: string,
  options: { required?: boolean; min?: number; max?: number } = {}
): string | undefined {
  const { required = false, min = 1, max = 280 } = options;
  const raw = source[field];

  if (raw === undefined || raw === null) {
    if (required) {
      throw new ApiError(400, "VALIDATION_ERROR", `${field} is required.`);
    }
    return undefined;
  }

  if (typeof raw !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} must be a string.`);
  }

  const value = raw.trim();

  if (required && value.length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} is required.`);
  }

  if (value.length > 0 && value.length < min) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} must be at least ${min} characters.`
    );
  }

  if (value.length > max) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} must be at most ${max} characters.`
    );
  }

  return value.length === 0 ? undefined : value;
}

function readNumber(
  source: Obj,
  field: string,
  options: { required?: boolean; min?: number; max?: number; integer?: boolean } = {}
): number | undefined {
  const { required = false, min = 0, max = 100_000, integer = true } = options;
  const raw = source[field];

  if (raw === undefined || raw === null) {
    if (required) {
      throw new ApiError(400, "VALIDATION_ERROR", `${field} is required.`);
    }
    return undefined;
  }

  if (typeof raw !== "number" || Number.isNaN(raw)) {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} must be a number.`);
  }

  if (integer && !Number.isInteger(raw)) {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} must be an integer.`);
  }

  if (raw < min || raw > max) {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} must be between ${min} and ${max}.`);
  }

  return raw;
}

function readBoolean(source: Obj, field: string): boolean | undefined {
  const raw = source[field];

  if (raw === undefined || raw === null) {
    return undefined;
  }

  if (typeof raw !== "boolean") {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} must be a boolean.`);
  }

  return raw;
}

function readEnum<T extends string>(
  source: Obj,
  field: string,
  allowed: readonly T[],
  required = false
): T | undefined {
  const value = readString(source, field, { required, min: 1, max: 60 });
  if (!value) return undefined;

  if (!allowed.includes(value as T)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} must be one of: ${allowed.join(", ")}.`
    );
  }

  return value as T;
}

function parseQuestion(item: unknown, index: number): QuestionDraftInput {
  const obj = asObject(item, `questions[${index}]`);
  const type = readEnum(obj, "type", QUESTION_TYPES, true) as QuestionType;
  const prompt = readString(obj, "prompt", { required: true, min: 5, max: 700 })!;
  const points = readNumber(obj, "points", {
    required: true,
    min: 1,
    max: 100,
    integer: true,
  })!;

  const optionsRaw = obj.options;
  if (optionsRaw !== undefined && !Array.isArray(optionsRaw)) {
    throw new ApiError(400, "VALIDATION_ERROR", `questions[${index}].options must be an array.`);
  }

  const options = (Array.isArray(optionsRaw) ? optionsRaw : [])
    .map((entry, optionIndex) => {
      if (typeof entry !== "string") {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `questions[${index}].options[${optionIndex}] must be a string.`
        );
      }
      return entry.trim();
    })
    .filter((entry) => entry.length > 0);

  if (type === "mcq" && options.length < 2) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `questions[${index}] must have at least 2 options for mcq type.`
    );
  }

  return {
    type,
    prompt,
    points,
    options,
  };
}

function parseQuestions(raw: unknown): QuestionDraftInput[] {
  if (!Array.isArray(raw)) {
    throw new ApiError(400, "VALIDATION_ERROR", "questions must be an array.");
  }

  return raw.map((item, index) => parseQuestion(item, index));
}

function parseGuardPolicy(raw: unknown): Partial<CreateExamInput["guardPolicy"]> {
  const policy = asObject(raw, "guardPolicy");

  const parsed = {
    lockdownBrowser: readBoolean(policy, "lockdownBrowser"),
    clipboardLock: readBoolean(policy, "clipboardLock"),
    blackoutMode: readBoolean(policy, "blackoutMode"),
    screenshotDetection: readBoolean(policy, "screenshotDetection"),
    aiFocusLogs: readBoolean(policy, "aiFocusLogs"),
  };

  return Object.fromEntries(
    Object.entries(parsed).filter((entry): entry is [string, boolean] => entry[1] !== undefined)
  );
}

export function parseExamStatusParam(value: string | null): ExamStatus | undefined {
  if (!value) return undefined;

  if (!EXAM_STATUSES.includes(value as ExamStatus)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `status must be one of: ${EXAM_STATUSES.join(", ")}.`
    );
  }

  return value as ExamStatus;
}

export function parseCreateExamPayload(body: unknown): CreateExamInput {
  const payload = asObject(body, "Request body");

  const title = readString(payload, "title", { required: true, min: 3, max: 120 })!;
  const course = readString(payload, "course", { required: true, min: 2, max: 120 })!;
  const durationMinutes =
    readNumber(payload, "durationMinutes", {
      required: false,
      min: 15,
      max: 480,
      integer: true,
    }) ?? 90;

  const status = readEnum(payload, "status", EXAM_STATUSES, false);
  const guardPolicy = payload.guardPolicy ? parseGuardPolicy(payload.guardPolicy) : undefined;
  const questions = payload.questions ? parseQuestions(payload.questions) : undefined;

  return {
    title,
    course,
    durationMinutes,
    status,
    guardPolicy,
    questions,
  };
}

export function parseUpdateExamPayload(body: unknown): UpdateExamInput {
  const payload = asObject(body, "Request body");
  const patch: UpdateExamInput = {};

  const title = readString(payload, "title", { required: false, min: 3, max: 120 });
  const course = readString(payload, "course", { required: false, min: 2, max: 120 });
  const durationMinutes = readNumber(payload, "durationMinutes", {
    required: false,
    min: 15,
    max: 480,
    integer: true,
  });
  const status = readEnum(payload, "status", EXAM_STATUSES, false);

  if (title !== undefined) patch.title = title;
  if (course !== undefined) patch.course = course;
  if (durationMinutes !== undefined) patch.durationMinutes = durationMinutes;
  if (status !== undefined) patch.status = status;
  if (payload.guardPolicy !== undefined) patch.guardPolicy = parseGuardPolicy(payload.guardPolicy);
  if (payload.questions !== undefined) patch.questions = parseQuestions(payload.questions);

  if (Object.keys(patch).length === 0) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "At least one editable field must be provided."
    );
  }

  return patch;
}

export function parseCreateSessionPayload(body: unknown): CreateSessionInput {
  const payload = asObject(body, "Request body");
  const studentName = readString(payload, "studentName", { required: true, min: 2, max: 80 })!;
  const studentId = readString(payload, "studentId", { required: true, min: 2, max: 40 })!;

  return { studentName, studentId };
}

function defaultSeverity(type: SessionEventType): SessionEventSeverity {
  switch (type) {
    case "focus-loss":
    case "clipboard-block":
    case "screenshot-attempt":
      return "warn";
    case "session-started":
    case "face-verified":
    case "manual-note":
      return "info";
    default:
      return "info";
  }
}

export function parseCreateSessionEventPayload(body: unknown): CreateSessionEventInput {
  const payload = asObject(body, "Request body");
  const type = readEnum(payload, "type", SESSION_EVENT_TYPES, true)!;
  const detail = readString(payload, "detail", { required: true, min: 4, max: 300 })!;
  const severity =
    readEnum(payload, "severity", SESSION_EVENT_SEVERITIES, false) ?? defaultSeverity(type);

  return {
    type,
    detail,
    severity,
  };
}
