import { API_BASE_URL } from "../config/env";

export class ApiError extends Error {
  public status?: number;
  public details?: unknown;

  constructor(
    message: string,
    status?: number,
    details?: unknown
  ) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type ApiClientOptions = {
  tenant: string;
};

export function createApiClient(opts: ApiClientOptions) {
  const base = API_BASE_URL;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        "X-Tenant": opts.tenant
      }
    });

    if (!res.ok) {
      let body: unknown = undefined;
      try {
        body = await res.json();
      } catch {
        // ignore
      }

      // Mapping für UI: 404/400 -> Tenant/Bad Request etc.
      throw new ApiError(`Request failed: ${res.status}`, res.status, body);
    }

    return (await res.json()) as T;
  }

  return { request };
}
