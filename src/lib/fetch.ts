"use client";

export type ApiResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function apiFetch<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      data?: T;
    } & Partial<T>;
    if (!res.ok) {
      return { ok: false, error: body.error || "Permintaan gagal." };
    }
    return { ok: true, data: (body.data ?? body) as T };
  } catch {
    return {
      ok: false,
      error: "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
    };
  }
}

export const postJSON = (url: string, data: unknown) =>
  apiFetch(url, { method: "POST", body: JSON.stringify(data) });

export const putJSON = (url: string, data: unknown) =>
  apiFetch(url, { method: "PUT", body: JSON.stringify(data) });

export const patchJSON = (url: string, data: unknown) =>
  apiFetch(url, { method: "PATCH", body: JSON.stringify(data) });

export const deleteReq = (url: string) =>
  apiFetch(url, { method: "DELETE" });
