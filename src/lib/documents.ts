import { API_BASE_URL, type Schemas } from "@/lib/api/client"
import { parseDateOnly } from "@/lib/format"

export type Doc = Schemas["Document"]

/**
 * Masa berlaku habis. Sama dengan filter retrieval backend
 * (`valid_until > now()`): dokumen berhenti dipakai sejak awal tanggal itu.
 */
export function isExpired(doc: Pick<Doc, "valid_until">, nowMs: number): boolean {
  return !!doc.valid_until && parseDateOnly(doc.valid_until).getTime() <= nowMs
}

/** Benar-benar terambil chatbot: aktif DAN masih berlaku. */
export function isServed(doc: Pick<Doc, "is_active" | "valid_until">, nowMs: number): boolean {
  return doc.is_active && !isExpired(doc, nowMs)
}

export type StaleReason = "expired" | "old"

/**
 * Alasan sebuah dokumen diberi badge "perlu ditinjau", sebagai kunci dan bukan
 * kalimat: kalimatnya ada di `t.docStatus.stale`. Dipakai dokumen dan entri
 * tanya jawab -- keduanya baris `documents` yang sama.
 */
export function staleReason(
  doc: Pick<Doc, "stale" | "valid_until">,
  nowMs: number
): StaleReason | null {
  if (!doc.stale) return null
  return isExpired(doc, nowMs) ? "expired" : "old"
}

/** PDF sumber, sama dengan tujuan kartu sitasi mahasiswa (FE-2). Hanya untuk dokumen yang dipakai. */
export function documentFileUrl(id: string): string {
  return `${API_BASE_URL}/api/documents/${id}/file`
}
