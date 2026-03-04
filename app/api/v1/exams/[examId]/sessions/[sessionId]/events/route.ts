import { fail, ok, readJson } from "@/lib/server/http";
import { sessionService } from "@/lib/server/services/sessionService";
import { parseCreateSessionEventPayload } from "@/lib/server/validation";

type RouteParams = { examId: string; sessionId: string };
type MaybePromise<T> = T | Promise<T>;

async function resolveParams(params: MaybePromise<RouteParams>) {
  return await params;
}

export async function GET(
  _request: Request,
  context: { params: MaybePromise<RouteParams> }
) {
  try {
    const { examId, sessionId } = await resolveParams(context.params);
    const events = await sessionService.listEvents(examId, sessionId);

    return ok({
      items: events,
      count: events.length,
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
    const { examId, sessionId } = await resolveParams(context.params);
    const payload = parseCreateSessionEventPayload(await readJson(request));
    const result = await sessionService.addEvent(examId, sessionId, payload);
    return ok(result, 201);
  } catch (error) {
    return fail(error);
  }
}
