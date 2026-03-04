import { beforeEach, describe, expect, it } from "vitest";
import { GET as getExams, POST as postExam } from "@/app/api/v1/exams/route";
import {
  DELETE as deleteExam,
  GET as getExamById,
  PATCH as patchExam,
} from "@/app/api/v1/exams/[examId]/route";
import { resetInMemoryStore } from "@/lib/server/repository/inMemoryStore";
import { DEMO_EXAM_ID } from "@/lib/shared/demo";
import { jsonRequest, parseBody } from "@/tests/helpers/http";

describe("Exam routes", () => {
  beforeEach(() => {
    resetInMemoryStore();
  });

  it("lists seeded exams", async () => {
    const response = await getExams(new Request("http://localhost/api/v1/exams"));
    const body = await parseBody<{ items: Array<{ id: string }>; count: number }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    if (!body.success) return;

    expect(body.data.count).toBeGreaterThan(0);
    expect(body.data.items.some((exam) => exam.id === DEMO_EXAM_ID)).toBe(true);
  });

  it("returns validation error on unknown exam status filter", async () => {
    const response = await getExams(
      new Request("http://localhost/api/v1/exams?status=not-real")
    );
    const body = await parseBody<never>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    if (body.success) return;

    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("supports create, update, and delete lifecycle", async () => {
    const createResponse = await postExam(
      jsonRequest("http://localhost/api/v1/exams", "POST", {
        title: "Chemistry Quiz 1",
        course: "Chem 101",
        durationMinutes: 60,
        questions: [
          {
            type: "essay",
            prompt: "Define molarity in your own words.",
            points: 5,
          },
        ],
      })
    );
    const createBody = await parseBody<{ id: string; title: string }>(createResponse);

    expect(createResponse.status).toBe(201);
    expect(createBody.success).toBe(true);
    if (!createBody.success) return;

    const examId = createBody.data.id;
    expect(createBody.data.title).toBe("Chemistry Quiz 1");

    const getResponse = await getExamById(
      new Request(`http://localhost/api/v1/exams/${examId}`),
      { params: { examId } }
    );
    const getBody = await parseBody<{ id: string; status: string }>(getResponse);

    expect(getResponse.status).toBe(200);
    expect(getBody.success).toBe(true);
    if (!getBody.success) return;
    expect(getBody.data.status).toBe("draft");

    const patchResponse = await patchExam(
      jsonRequest(`http://localhost/api/v1/exams/${examId}`, "PATCH", {
        status: "published",
        durationMinutes: 75,
      }),
      { params: { examId } }
    );
    const patchBody = await parseBody<{ status: string; durationMinutes: number }>(patchResponse);

    expect(patchResponse.status).toBe(200);
    expect(patchBody.success).toBe(true);
    if (!patchBody.success) return;
    expect(patchBody.data.status).toBe("published");
    expect(patchBody.data.durationMinutes).toBe(75);

    const deleteResponse = await deleteExam(
      new Request(`http://localhost/api/v1/exams/${examId}`, { method: "DELETE" }),
      { params: { examId } }
    );
    const deleteBody = await parseBody<{ deleted: boolean }>(deleteResponse);

    expect(deleteResponse.status).toBe(200);
    expect(deleteBody.success).toBe(true);
    if (!deleteBody.success) return;
    expect(deleteBody.data.deleted).toBe(true);

    const afterDeleteResponse = await getExamById(
      new Request(`http://localhost/api/v1/exams/${examId}`),
      { params: { examId } }
    );
    const afterDeleteBody = await parseBody<never>(afterDeleteResponse);

    expect(afterDeleteResponse.status).toBe(404);
    expect(afterDeleteBody.success).toBe(false);
    if (afterDeleteBody.success) return;
    expect(afterDeleteBody.error.code).toBe("EXAM_NOT_FOUND");
  });
});
