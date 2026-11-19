const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? "Não foi possível concluir a solicitação.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
