const rawApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "/api";

const pageProtocol = typeof window !== "undefined" ? window.location.protocol : "";
const configuredApiBase = String(rawApiBase).trim().replace(/\/+$/, "");

let normalizedApiBase = configuredApiBase;
if (pageProtocol === "https:" && /^http:\/\//i.test(configuredApiBase)) {
  normalizedApiBase = "/api";
}

export const API_URL = normalizedApiBase.endsWith("/api")
  ? normalizedApiBase
  : `${normalizedApiBase}/api`;

export function getToken() {
  return localStorage.getItem("token");
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error del servidor");
  }

  return data as T;
}
