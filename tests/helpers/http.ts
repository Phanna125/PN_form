export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export async function parseBody<T>(response: Response): Promise<ApiSuccess<T> | ApiFailure> {
  return (await response.json()) as ApiSuccess<T> | ApiFailure;
}

export function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
