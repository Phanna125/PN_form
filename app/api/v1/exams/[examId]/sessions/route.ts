import { fail, ok, readJson } from "@/lib/server/http";
import { sessionService } from "@/lib/server/services/sessionService";
import { parseCreateSessionPayload } from "@/lib/server/validation";

type RouteParams = { examId: string };
type MaybePromise<T> = T | Promise<T>;

async function resolveParams(params: MaybePromise<RouteParams>) {
  return await params;
}

export async function GET(
  _request: Request,
  context: { params: MaybePromise<RouteParams> }
) {
  try {
    const { examId } = await resolveParams(context.params);
    const sessions = await sessionService.listForExam(examId);

    return ok({
      items: sessions,
      count: sessions.length,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(
  request: Request,
  context: { params: MaybePromise<RouteParams> }
) {
  try {
    const { examId } = await resolveParams(context.params);
    const payload = parseCreateSessionPayload(await readJson(request));
    const session = await sessionService.create(examId, payload);
    return ok(session, 201);
  } catch (error) {
    return fail(error);
  }
}
