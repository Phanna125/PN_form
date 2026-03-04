import { fail, ok, readJson } from "@/lib/server/http";
import { examService } from "@/lib/server/services/examService";
import { parseCreateExamPayload, parseExamStatusParam } from "@/lib/server/validation";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = parseExamStatusParam(url.searchParams.get("status"));
    const exams = await examService.list(status);

    return ok({
      items: exams,
      count: exams.length,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseCreateExamPayload(await readJson(request));
    const exam = await examService.create(payload);
    return ok(exam, 201);
  } catch (error) {
    return fail(error);
  }
}
