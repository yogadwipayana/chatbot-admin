/**
 * Bahasa antarmuka dashboard.
 *
 * Bahasa Indonesia tetap bawaan: yang memakai dashboard ini sehari-hari staf
 * kampus. Bahasa Inggris ada karena istilah teknis pencarian dan biaya --
 * "RRF damping", "chunk overlap", "embedding model" -- kehilangan artinya saat
 * diterjemahkan, dan menebak istilah aslinya dari terjemahan justru memperlambat
 * orang yang paham hal itu.
 */

export type Lang = "id" | "en"

export const LANGS: Lang[] = ["id", "en"]

export const LANG_LABELS: Record<Lang, string> = {
  id: "Bahasa Indonesia",
  en: "English",
}

/** Locale Intl. Menentukan urutan tanggal, pemisah ribuan, dan bentuk relatif. */
export const LOCALES: Record<Lang, string> = {
  id: "id-ID",
  en: "en-US",
}

export const LANG_STORAGE_KEY = "chatbot-admin:lang"

export function isLang(value: unknown): value is Lang {
  return value === "id" || value === "en"
}
