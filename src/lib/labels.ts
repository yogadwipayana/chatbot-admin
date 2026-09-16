import type { Schemas } from "@/lib/api/client"

/** Label tampilan `RiskTopic` backend (FR-6). */
export const TOPIC_LABELS: Record<string, string> = {
  deadline: "Tenggat waktu",
  syarat_kelulusan: "Syarat kelulusan",
  pembayaran: "Pembayaran",
  sanksi: "Sanksi",
  drop_out: "Drop out (DO)",
}

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic
}

export const KIND_LABELS: Record<Schemas["OutcomeKind"], string> = {
  answer: "Dijawab",
  refusal: "Ditolak",
  support: "Dialihkan ke konseling",
  smalltalk: "Sapaan",
}

/** Kalimat yang dilihat mahasiswa saat kill switch aktif (sama dengan backend). */
export const CLOSED_MESSAGE =
  "Layanan chat sedang dinonaktifkan sementara. Silakan hubungi Biro Administrasi Akademik pada jam kerja."
