import { fail, ok } from "@/lib/server/http";
import { sessionService } from "@/lib/server/services/sessionService";

type RouteParams = { examId: string; sessionId: string };
type MaybePromise<T> = T | Promise<T>;

async function resolveParams(params: MaybePromise<RouteParams>) {
  return await params;
}

export async function GET(
  request: Request,
  context: { params: MaybePromise<RouteParams> }
) {
  try {
    const { examId, sessionId } = await resolveParams(context.params);
    const url = new URL(request.url);
    const includeEvents = url.searchParams.get("includeEvents") === "true";
    const session = sessionService.getById(examId, sessionId);

    if (!includeEvents) {
      return ok(session);
    }

    const events = sessionService.listEvents(examId, sessionId);
    return ok({
      session,
      events,
    });
  } catch (error) {
    return fail(error);
  }
}
