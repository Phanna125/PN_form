import { beforeEach, describe, expect, it } from "vitest";
import { POST as postEvent } from "@/app/api/v1/exams/[examId]/sessions/[sessionId]/events/route";
import { GET as getSessionById } from "@/app/api/v1/exams/[examId]/sessions/[sessionId]/route";
import {
  GET as getSessions,
  POST as postSession,
} from "@/app/api/v1/exams/[examId]/sessions/route";
import { resetInMemoryStore } from "@/lib/server/repository/inMemoryStore";
import { DEMO_EXAM_ID, DEMO_SESSION_ID } from "@/lib/shared/demo";
import { jsonRequest, parseBody } from "@/tests/helpers/http";

describe("Session routes", () => {
  beforeEach(() => {
    resetInMemoryStore();
  });

  it("lists seeded sessions", async () => {
    const response = await getSessions(new Request("http://localhost"), {
      params: { examId: DEMO_EXAM_ID },
    });
    const body = await parseBody<{ items: Array<{ id: string }>; count: number }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    if (!body.success) return;

    expect(body.data.count).toBeGreaterThan(0);
    expect(body.data.items.some((session) => session.id === DEMO_SESSION_ID)).toBe(true);
  });

  it("creates a session for an exam", async () => {
    const response = await postSession(
      jsonRequest("http://localhost/api/v1/exams/demo/sessions", "POST", {
        studentName: "Jamie Fox",
        studentId: "S-102",
      }),
      { params: { examId: DEMO_EXAM_ID } }
    );
    const body = await parseBody<{ id: string; studentName: string }>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    if (!body.success) return;

    expect(body.data.id).toMatch(/^session-/);
    expect(body.data.studentName).toBe("Jamie Fox");
  });

  it("records focus-loss event and updates session metrics", async () => {
    const response = await postEvent(
      jsonRequest("http://localhost/api/v1/exams/demo/sessions/demo/events", "POST", {
        type: "focus-loss",
        detail: "Student switched away from exam tab.",
      }),
      { params: { examId: DEMO_EXAM_ID, sessionId: DEMO_SESSION_ID } }
    );
    const body = await parseBody<{
      session: { focusLossCount: number; integrityFlags: number };
      event: { type: string };
    }>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    if (!body.success) return;

    expect(body.data.session.focusLossCount).toBe(1);
    expect(body.data.session.integrityFlags).toBe(1);
    expect(body.data.event.type).toBe("focus-loss");

    const sessionResponse = await getSessionById(
      new Request(
        `http://localhost/api/v1/exams/${DEMO_EXAM_ID}/sessions/${DEMO_SESSION_ID}?includeEvents=true`
      ),
      { params: { examId: DEMO_EXAM_ID, sessionId: DEMO_SESSION_ID } }
    );
    const sessionBody = await parseBody<{
      session: { focusLossCount: number };
      events: Array<{ type: string }>;
    }>(sessionResponse);

    expect(sessionResponse.status).toBe(200);
    expect(sessionBody.success).toBe(true);
    if (!sessionBody.success) return;

    expect(sessionBody.data.session.focusLossCount).toBe(1);
    expect(sessionBody.data.events[0]?.type).toBe("focus-loss");
  });
});
