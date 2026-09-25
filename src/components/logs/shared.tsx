"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { StatusLabel, type StatusLevel } from "@/components/status"
import { Button } from "@/components/ui/button"
import type { Format } from "@/lib/format"
import { useLang, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"
import { LOCALES } from "@/lib/i18n/lang"

/**
 * Durasi langkah. Langkah aturan (sanitasi, deteksi sensitif) sering di bawah
 * satu milidetik; "0 md" terbaca sebagai "tidak berjalan", padahal berjalan.
 */
export function durasi(f: Format, ms: number): string {
  if (ms > 0 && ms < 1) return `< ${f.duration(1)}`
  return f.duration(Math.round(ms))
}

/** Node yang belum dikenal kamus tampil dengan nama teknisnya, bukan hilang. */
export function nodeLabel(t: Dict, node: string | null | undefined): string {
  if (!node) return "—"
  return t.logs.nodes[node as keyof Dict["logs"]["nodes"]] ?? node
}

export function kindLabel(t: Dict, kind: string | null | undefined): string {
  if (!kind) return "—"
  return t.labels.kind[kind as keyof Dict["labels"]["kind"]] ?? kind
}

/**
 * Jam dengan detik, di zona waktu peramban.
 *
 * `Format.dateTime` berhenti di menit. Log butuh detik: dua galat yang berjarak
 * tiga detik dan yang berjarak satu jam harus dapat dibedakan tanpa membuka
 * rinciannya. Waktu dari API selalu UTC (`...Z`); `Intl` menggeser ke zona lokal.
 */
export function useLogTime() {
  const { lang } = useLang()
  return useMemo(() => {
    const locale = LOCALES[lang]
    const jam = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const tanggalJam = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const labelJam = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" })
    const labelHariJam = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
    })
    return {
      /** "13:05:57" untuk hari ini, "24 Sep 13:05:57" untuk hari lain. */
      waktu(iso: string, nowMs: number): string {
        const d = new Date(iso)
        const hariIni = new Date(nowMs).toDateString() === d.toDateString()
        return (hariIni ? jam : tanggalJam).format(d)
      },
      lengkap: (iso: string) => tanggalJam.format(new Date(iso)),
      /** Label sumbu per jam: "13.00" untuk 24 jam, "24 Sep 13" untuk 7 hari. */
      sumbu: (iso: string, range: "24h" | "7d") =>
        (range === "24h" ? labelJam : labelHariJam).format(new Date(iso)),
    }
  }, [lang])
}

export function levelStatus(level: string): StatusLevel | null {
  if (level === "CRITICAL") return "critical"
  if (level === "ERROR") return "critical"
  if (level === "WARNING") return "warning"
  return null
}

/** Level log: ikon warna hanya untuk WARNING ke atas, supaya galat menonjol. */
export function LevelLabel({ level }: { level: string }) {
  const status = levelStatus(level)
  if (!status) return <span className="text-sm text-muted-foreground">{level}</span>
  return (
    <StatusLabel level={status} className="font-medium">
      {level}
    </StatusLabel>
  )
}

export function turnStatusLevel(status: string): StatusLevel {
  if (status === "error") return "critical"
  if (status === "dibatalkan") return "warning"
  return "good"
}

export function TurnStatus({ status }: { status: string }) {
  const t = useT()
  return (
    <StatusLabel level={turnStatusLevel(status)}>
      {t.logs.status[status as keyof Dict["logs"]["status"]] ?? status}
    </StatusLabel>
  )
}

/** ID panjang yang perlu ditempel di tempat lain (tabel messages, pencarian LangSmith). */
export function CopyValue({ value }: { value: string }) {
  const t = useT()
  const [tersalin, setTersalin] = useState(false)

  async function salin() {
    try {
      await navigator.clipboard.writeText(value)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 1500)
    } catch {
      // Clipboard ditolak (mis. bukan HTTPS): nilainya tetap dapat diseleksi manual.
    }
  }

  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <code className="truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs select-all">
        {value}
      </code>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={salin}
        aria-label={tersalin ? t.logs.turn.copied : t.logs.turn.copy}
        title={tersalin ? t.logs.turn.copied : t.logs.turn.copy}
      >
        {tersalin ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </span>
  )
}
