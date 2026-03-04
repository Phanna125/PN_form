import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { parseBody } from "@/tests/helpers/http";

describe("GET /api/health", () => {
  it("returns service health payload", async () => {
    const response = GET();
    const body = await parseBody<{
      service: string;
      status: string;
      timestamp: string;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    if (!body.success) return;

    expect(body.data.service).toBe("pn-form-api");
    expect(body.data.status).toBe("ok");
    expect(new Date(body.data.timestamp).toString()).not.toBe("Invalid Date");
  });
});
