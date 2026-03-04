import { ok } from "@/lib/server/http";

export function GET() {
  return ok({
    service: "pn-form-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
