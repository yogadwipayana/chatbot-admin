import createClient, { type Middleware } from "openapi-fetch"

import { clearToken, readToken } from "@/lib/auth/token"
import { dict } from "@/lib/i18n"

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

/** Jaringan mati: satu-satunya kalimat galat yang tidak berasal dari server. */
export function gagalTerhubung(): string {
  return dict().api.offline
}

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

/**
 * Kalimat galat siap tampil. Backend sudah menulis `detail` non-teknis (PRD §9).
 *
 * `detail` dari server tetap apa adanya: API hanya berbahasa Indonesia, dan
 * menerjemahkannya di sini berarti menebak kalimat yang tidak pernah dilihat.
 * Yang dialihbahasakan hanya kalimat yang disusun dashboard sendiri.
 */
export function errorMessage(status: number, body: unknown): string {
  const t = dict().api
  const detail = (body as { detail?: unknown } | null | undefined)?.detail
  if (typeof detail === "string" && detail) return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const pesan = pesanValidasi(detail[0] as GalatValidasi)
    if (pesan) return pesan
  }
  if (status >= 500) return t.serverError
  return t.failed(status)
}

/** Satu butir `detail` 422 dari FastAPI/Pydantic. */
type GalatValidasi = {
  loc?: unknown
  msg?: unknown
  type?: unknown
  ctx?: Record<string, unknown>
} | null

/**
 * Galat validasi bawaan Pydantic berbahasa Inggris dan tanpa nama kolom, jadi
 * disusun ulang dari `type` dan `ctx`-nya -- bukan dari kalimatnya -- beserta
 * nama kolom dari `loc`. Kalimat validator API sendiri (`value_error`) sudah
 * berbahasa Indonesia dan ditampilkan apa adanya.
 */
function pesanValidasi(galat: GalatValidasi): string | null {
  if (typeof galat?.msg !== "string") return null
  const t = dict()
  if (galat.type === "value_error") {
    return t.api.invalidInput(galat.msg.replace(/^Value error, /, ""))
  }
  const kalimat = kalimatValidasi(galat.type, galat.ctx ?? {})
  const kolom = namaKolom(galat.loc)
  return kolom ? t.api.invalidField(kolom, kalimat) : t.api.invalidInput(kalimat)
}

function kalimatValidasi(jenis: unknown, ctx: Record<string, unknown>): string {
  const v = dict().api.validation
  const batas = (kunci: string) => String(ctx[kunci])
  switch (jenis) {
    case "missing":
      return v.missing
    case "string_too_short":
      return Number(ctx.min_length) <= 1 ? v.empty : v.tooShort(Number(ctx.min_length))
    case "string_too_long":
      return v.tooLong(Number(ctx.max_length))
    case "too_short":
      return v.tooFew(Number(ctx.min_length))
    case "too_long":
      return v.tooMany(Number(ctx.max_length))
    case "greater_than_equal":
      return v.atLeast(batas("ge"))
    case "less_than_equal":
      return v.atMost(batas("le"))
    case "greater_than":
      return v.above(batas("gt"))
    case "less_than":
      return v.below(batas("lt"))
    case "int_parsing":
    case "int_type":
    case "int_from_float":
      return v.integer
    case "float_parsing":
    case "float_type":
      return v.number
    case "date_parsing":
    case "date_type":
    case "date_from_datetime_parsing":
    case "date_from_datetime_inexact":
      return v.date
    case "enum":
    case "literal_error":
      return v.choice
    case "extra_forbidden":
      return v.unknown
    default:
      return v.invalid
  }
}

/** Nama kolom dari `loc`, mis. `["body", "question"]` atau `["body", "allowed_origins", 0]`. */
function namaKolom(loc: unknown): string | null {
  if (!Array.isArray(loc)) return null
  const kunci = [...loc]
    .reverse()
    .find((b): b is string => typeof b === "string" && !["body", "query", "path"].includes(b))
  if (!kunci) return null
  const t = dict()
  const umum = t.api.fields as Record<string, string>
  const konfigurasi = t.config.fields as Record<string, { label: string } | undefined>
  return umum[kunci] ?? konfigurasi[kunci]?.label ?? null
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
    throw new ApiError(0, gagalTerhubung())
  }
  if (!result.response.ok) {
    throw new ApiError(
      result.response.status,
      errorMessage(result.response.status, result.error)
    )
  }
  return result.data as Exclude<R["data"], undefined>
}
