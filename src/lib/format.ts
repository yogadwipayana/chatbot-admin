import { LOCALES, type Lang } from "@/lib/i18n/lang"

/**
 * Pemformat angka, tanggal, dan durasi.
 *
 * Dibentuk per bahasa lewat `createFormat`, bukan sebagai fungsi lepas dengan
 * locale tetap: "20 Sep 2026" dan "Sep 20, 2026" adalah tanggal yang sama, dan
 * satu halaman yang mencampur keduanya terbaca seperti dua sumber data.
 * Komponen mengambilnya dari `useFormat()` supaya ikut tergambar ulang saat
 * bahasanya diganti.
 */

export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function toDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  const hasil = new Date(date)
  hasil.setDate(hasil.getDate() + days)
  return hasil
}

function asDate(value: string | Date): Date {
  if (value instanceof Date) return value
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateOnly(value) : new Date(value)
}

/**
 * Dolar. Selalu `en-US` di kedua bahasa: angkanya berasal dari tagihan penyedia
 * yang memakai notasi itu, dan "$0,0049" (koma desimal) terbaca sebagai ribuan
 * oleh setengah pembacanya.
 */
export function formatUsd(value: number): string {
  const kecil = value > 0 && value < 1
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: kecil ? 4 : 2,
    maximumFractionDigits: kecil ? 4 : 2,
  }).format(value)
}

/**
 * Dolar yang boleh sangat kecil, untuk kolom biaya embedding.
 *
 * Meng-embed satu pertanyaan berharga $0,0000003. `formatUsd` membulatkannya ke
 * empat desimal, sehingga seluruh kolom embedding terbaca "$0.0000" -- ribuan
 * pertanyaan yang seluruhnya tampak gratis bukan laporan biaya (lihat
 * `api/docs/schema.md`, alasan yang sama dengan menyimpannya tanpa pembulatan).
 */
export function formatUsdPrecise(value: number): string {
  if (value === 0) return "$0.00"
  if (Math.abs(value) >= 0.01) return formatUsd(value)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 2,
  }).format(value)
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

export type Format = {
  date(value: string | Date): string
  shortDate(value: string | Date): string
  dateTime(value: string | Date): string
  relative(value: string | Date, nowMs: number): string
  number(value: number): string
  percent(ratio: number, digits?: number): string
  score(value: number): string
  duration(ms: number): string
  bytes(bytes: number): string
  /** Panjang rentang dalam kata: "12 hari", "3 bulan", "1 tahun 2 bulan". */
  lama(hari: number): string
}

const SATUAN = {
  id: { ms: "md", detik: "dtk", hari: "hari", bulan: "bulan", tahun: "tahun" },
  en: { ms: "ms", detik: "s", hari: "day", bulan: "month", tahun: "year" },
} satisfies Record<Lang, Record<string, string>>

function jamak(lang: Lang, jumlah: number, kata: string): string {
  return lang === "en" && jumlah !== 1 ? `${kata}s` : kata
}

const cache = new Map<Lang, Format>()

export function createFormat(lang: Lang): Format {
  const tersimpan = cache.get(lang)
  if (tersimpan) return tersimpan

  const locale = LOCALES[lang]
  const satuan = SATUAN[lang]
  const tanggal = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" })
  const tanggalPendek = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" })
  const tanggalWaktu = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const relatif = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const angka = new Intl.NumberFormat(locale)
  const skor = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 3 })
  const desimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })

  const format: Format = {
    date: (value) => tanggal.format(asDate(value)),
    shortDate: (value) => tanggalPendek.format(asDate(value)),
    dateTime: (value) => tanggalWaktu.format(asDate(value)),

    relative(value, nowMs) {
      const detik = Math.round((asDate(value).getTime() - nowMs) / 1000)
      const mutlak = Math.abs(detik)
      if (mutlak < 60) return lang === "en" ? "just now" : "baru saja"
      if (mutlak < 3600) return relatif.format(Math.round(detik / 60), "minute")
      if (mutlak < 86_400) return relatif.format(Math.round(detik / 3600), "hour")
      if (mutlak < 30 * 86_400) return relatif.format(Math.round(detik / 86_400), "day")
      if (mutlak < 365 * 86_400) return relatif.format(Math.round(detik / (30 * 86_400)), "month")
      return relatif.format(Math.round(detik / (365 * 86_400)), "year")
    },

    number: (value) => angka.format(value),

    percent: (ratio, digits = 1) =>
      new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: digits }).format(ratio),

    score: (value) => skor.format(value),

    duration(ms) {
      if (ms < 1000) return `${angka.format(ms)} ${satuan.ms}`
      return `${desimal.format(ms / 1000)} ${satuan.detik}`
    },

    bytes(bytes) {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${angka.format(Math.round(bytes / 1024))} KB`
      return `${desimal.format(bytes / (1024 * 1024))} MB`
    },

    lama(hari) {
      // Dibulatkan, karena gunanya memberi rasa lama -- bukan menghitung hari.
      if (hari < 31) return `${angka.format(hari)} ${jamak(lang, hari, satuan.hari)}`
      const bulan = Math.round(hari / 30.44)
      if (bulan < 12) return `${bulan} ${jamak(lang, bulan, satuan.bulan)}`
      const tahun = Math.floor(bulan / 12)
      const sisa = bulan % 12
      const teksTahun = `${tahun} ${jamak(lang, tahun, satuan.tahun)}`
      return sisa ? `${teksTahun} ${sisa} ${jamak(lang, sisa, satuan.bulan)}` : teksTahun
    },
  }

  cache.set(lang, format)
  return format
}
