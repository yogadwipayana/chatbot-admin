import createClient, { type Middleware } from "openapi-fetch"

import { clearToken, readToken } from "@/lib/auth/token"

import type { components, paths } from "./schema"

/**
 * Klien API bertipe, dibangkitkan dari `api/api.yaml` (`npm run gen:api`).
 * Kontrak itu satu-satunya sumber kebenaran bentuk data antara backend dan
 * dashboard: ubah YAML-nya, bangkitkan ulang, dan TypeScript menunjukkan
 * setiap tempat yang ikut terdampak.
 */

export type Schemas = components["schemas"]

/**
 * Kosongkan (`NEXT_PUBLIC_API_BASE_URL=`) bila dashboard dan API disajikan dari
 * domain yang sama di balik Caddy.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "")

export const GAGAL_TERHUBUNG =
  "Tidak dapat terhubung ke server. Periksa koneksi internet atau coba lagi sebentar lagi."

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

const auth: Middleware = {
  onRequest({ request }) {
    const token = readToken()
    if (token) request.headers.set("Authorization", `Bearer ${token}`)
    return request
  },
  onResponse({ request, response }) {
    // Token kedaluwarsa atau tidak sah: akhiri sesi di semua tab. Login sendiri
    // membalas 401 untuk kata sandi salah -- itu bukan alasan menghapus sesi.
    if (response.status === 401 && !new URL(request.url).pathname.endsWith("/admin/login")) {
      clearToken()
    }
    return response
  },
}

export const api = createClient<paths>({ baseUrl: API_BASE_URL })
api.use(auth)

/** Kalimat galat siap tampil. Backend sudah menulis `detail` non-teknis (PRD §9). */
export function errorMessage(status: number, body: unknown): string {
  const detail = (body as { detail?: unknown } | null | undefined)?.detail
  if (typeof detail === "string" && detail) return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const pertama = detail[0] as { msg?: unknown }
    if (typeof pertama?.msg === "string") {
      return `Isian tidak sah: ${pertama.msg.replace(/^Value error, /, "")}`
    }
  }
  if (status >= 500) return "Terjadi gangguan di server. Coba lagi beberapa saat lagi."
  return `Permintaan gagal (kode ${status}).`
}

type FetchResult = { data?: unknown; error?: unknown; response: Response }

/** Ubah hasil openapi-fetch menjadi datanya, atau lempar `ApiError`. */
export async function unwrap<R extends FetchResult>(
  request: Promise<R>
): Promise<Exclude<R["data"], undefined>> {
  let result: R
  try {
    result = await request
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(0, GAGAL_TERHUBUNG)
  }
  if (!result.response.ok) {
    throw new ApiError(
      result.response.status,
      errorMessage(result.response.status, result.error)
    )
  }
  return result.data as Exclude<R["data"], undefined>
}
