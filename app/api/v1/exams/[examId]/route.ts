import { fail, ok, readJson } from "@/lib/server/http";
import { examService } from "@/lib/server/services/examService";
import { sessionService } from "@/lib/server/services/sessionService";
import { parseUpdateExamPayload } from "@/lib/server/validation";

type RouteParams = { examId: string };
type MaybePromise<T> = T | Promise<T>;

async function resolveParams(params: MaybePromise<RouteParams>) {
  return await params;
}

export async function GET(
  request: Request,
  context: { params: MaybePromise<RouteParams> }
) {
  try {
    const { examId } = await resolveParams(context.params);
    const url = new URL(request.url);
    const includeSessions = url.searchParams.get("includeSessions") === "true";
    const exam = examService.getById(examId);

    if (!includeSessions) {
      return ok(exam);
    }

    const sessions = sessionService.listForExam(examId);
    return ok({
      exam,
      sessions,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: MaybePromise<RouteParams> }
) {
  try {
    const { examId } = await resolveParams(context.params);
    const payload = parseUpdateExamPayload(await readJson(request));
    const updated = examService.update(examId, payload);
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: MaybePromise<RouteParams> }
) {
  try {
    const { examId } = await resolveParams(context.params);
    examService.delete(examId);
    return ok({ deleted: true, examId });
  } catch (error) {
    return fail(error);
  }
}
