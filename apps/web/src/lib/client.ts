export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? "GET",
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiClientError("Server se rabta nahi ho raha. Internet check karein.", 0);
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiClientError(data.error ?? "Kuch masla aa gaya", res.status);
  return data;
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Kuch masla aa gaya";
}