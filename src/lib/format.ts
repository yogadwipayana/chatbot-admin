const LOCALE = "id-ID"

const tanggal = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
})
const tanggalPendek = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" })
const tanggalWaktu = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})
const relatif = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" })
const angka = new Intl.NumberFormat(LOCALE)
const skor = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 3 })

/** "2027-01-31" sebagai tanggal lokal, bukan tengah malam UTC (yang bisa mundur sehari). */
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

export function formatDate(value: string | Date): string {
  return tanggal.format(asDate(value))
}

export function formatShortDate(value: string | Date): string {
  return tanggalPendek.format(asDate(value))
}

export function formatDateTime(value: string | Date): string {
  return tanggalWaktu.format(asDate(value))
}

export function formatRelative(value: string | Date, nowMs: number): string {
  const detik = Math.round((asDate(value).getTime() - nowMs) / 1000)
  const mutlak = Math.abs(detik)
  if (mutlak < 60) return "baru saja"
  if (mutlak < 3600) return relatif.format(Math.round(detik / 60), "minute")
  if (mutlak < 86_400) return relatif.format(Math.round(detik / 3600), "hour")
  if (mutlak < 30 * 86_400) return relatif.format(Math.round(detik / 86_400), "day")
  if (mutlak < 365 * 86_400) return relatif.format(Math.round(detik / (30 * 86_400)), "month")
  return relatif.format(Math.round(detik / (365 * 86_400)), "year")
}

export function formatNumber(value: number): string {
  return angka.format(value)
}

export function formatPercent(ratio: number, digits = 1): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    maximumFractionDigits: digits,
  }).format(ratio)
}

export function formatScore(value: number): string {
  return skor.format(value)
}

export function formatUsd(value: number): string {
  const kecil = value > 0 && value < 1
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: kecil ? 4 : 2,
    maximumFractionDigits: kecil ? 4 : 2,
  }).format(value)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${formatNumber(ms)} md`
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(ms / 1000)} dtk`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${formatNumber(Math.round(bytes / 1024))} KB`
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024))} MB`
}

/**
 * Panjang sebuah rentang dalam kata: "12 hari", "3 bulan", "1 tahun 2 bulan".
 *
 * Dibulatkan, karena gunanya memberi rasa lama -- bukan menghitung hari.
 */
export function formatLama(hari: number): string {
  if (hari < 31) return `${formatNumber(hari)} hari`
  const bulan = Math.round(hari / 30.44)
  if (bulan < 12) return `${bulan} bulan`
  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12
  return sisa ? `${tahun} tahun ${sisa} bulan` : `${tahun} tahun`
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}
