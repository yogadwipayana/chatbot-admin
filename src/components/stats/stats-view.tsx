"use client"

import { ChartColumnIcon, TableIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { DateRangeField } from "@/components/date-field"
import { DailyVolumeChart, DailyVolumeTable } from "@/components/stats/daily-volume-chart"
import { StatusLabel } from "@/components/status"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import { useStats, type StatsRange } from "@/lib/api/queries"
import {
  addDays,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatUsd,
  toDateInput,
} from "@/lib/format"
import { KIND_LABELS, topicLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"

type Stats = Schemas["Stats"]
type Preset = "7" | "30" | "90" | "kustom"

/** Batas bawah pemilih tanggal: dua tahun. Log percakapan tidak pernah lebih tua
dari umur layanan ini, dan tanpa batas apa pun dropdown tahunnya mengundang salah
klik ke tahun yang sudah pasti kosong. */
const HARI_TERJAUH = 730

const TARGET_FEEDBACK = 0.75
const TARGET_TAK_TERJAWAB = 0.15

export function StatsView() {
  const now = useNow()
  const [preset, setPreset] = useState<Preset>("30")
  const [kustom, setKustom] = useState<StatsRange>({ sejak: "", sampai: "" })

  const hariIni = toDateInput(new Date(now))
  const range: StatsRange =
    preset === "kustom"
      ? kustom
      : { sejak: toDateInput(addDays(new Date(now), -(Number(preset) - 1))), sampai: hariIni }
  const rangeValid = !!range.sejak && !!range.sampai && range.sejak <= range.sampai
  const stats = useStats(rangeValid ? range : null)

  function pilihPreset(value: Preset) {
    // Rentang kustom dimulai dari rentang yang sedang dilihat, bukan dari kosong.
    if (value === "kustom" && preset !== "kustom") setKustom(range)
    setPreset(value)
  }

  return (
    <>
      <PageHeader
        title="Statistik"
        description="Seberapa membantu chatbot bagi mahasiswa, dan berapa biayanya. Target mengikuti PRD §3."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Tabs value={preset} onValueChange={(v) => pilihPreset(v as Preset)}>
          <TabsList>
            <TabsTrigger value="7">7 hari</TabsTrigger>
            <TabsTrigger value="30">30 hari</TabsTrigger>
            <TabsTrigger value="90">90 hari</TabsTrigger>
            <TabsTrigger value="kustom">Pilih tanggal</TabsTrigger>
          </TabsList>
        </Tabs>
        {preset === "kustom" ? (
          <DateRangeField
            id="rentang"
            min={toDateInput(addDays(new Date(now), -HARI_TERJAUH))}
            max={hariIni}
            value={kustom}
            onChange={setKustom}
          />
        ) : null}
      </div>

      {!rangeValid ? (
        <p className="text-sm text-muted-foreground">
          Pilih tanggal awal dan akhir, dengan tanggal awal tidak setelah tanggal akhir.
        </p>
      ) : stats.error ? (
        <QueryError error={stats.error} onRetry={() => stats.refetch()} />
      ) : !stats.data ? (
        <StatsSkeleton />
      ) : stats.data.total_pertanyaan === 0 ? (
        <EmptyState
          icon={ChartColumnIcon}
          title="Belum ada pertanyaan pada periode ini"
          description={`${formatDate(stats.data.sejak)} sampai ${formatDate(stats.data.sampai)}`}
        />
      ) : (
        <div className={cn("space-y-6 transition-opacity", stats.isPlaceholderData && "opacity-60")}>
          <KpiRow stats={stats.data} />
          <div className="grid gap-6 lg:grid-cols-3">
            <VolumeCard stats={stats.data} />
            <div className="grid gap-6">
              <KindCard stats={stats.data} />
              <TopicCard stats={stats.data} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatTile({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {children ? <div className="space-y-1 text-xs text-muted-foreground">{children}</div> : null}
      </CardContent>
    </Card>
  )
}

function KpiRow({ stats }: { stats: Stats }) {
  const fb = stats.rasio_feedback_positif
  const tt = stats.rasio_tak_terjawab
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Umpan balik positif" value={fb == null ? "—" : formatPercent(fb)}>
        {fb == null ? (
          <p>Belum ada umpan balik pada periode ini.</p>
        ) : (
          <>
            <StatusLabel level={fb >= TARGET_FEEDBACK ? "good" : "serious"} className="text-xs text-foreground">
              {fb >= TARGET_FEEDBACK ? "Memenuhi" : "Di bawah"} target ≥ {formatPercent(TARGET_FEEDBACK, 0)}
            </StatusLabel>
            <p>dari {formatNumber(stats.jumlah_feedback)} umpan balik</p>
          </>
        )}
      </StatTile>

      <StatTile label="Pertanyaan tak terjawab" value={tt == null ? "—" : formatPercent(tt)}>
        {tt == null ? null : (
          <>
            <StatusLabel level={tt < TARGET_TAK_TERJAWAB ? "good" : "serious"} className="text-xs text-foreground">
              {tt < TARGET_TAK_TERJAWAB ? "Memenuhi" : "Di atas"} target &lt; {formatPercent(TARGET_TAK_TERJAWAB, 0)}
            </StatusLabel>
            <p>
              {formatNumber(stats.rincian_jenis.refusal)} dari {formatNumber(stats.total_pertanyaan)}{" "}
              pertanyaan ·{" "}
              <Link href="/pertanyaan" className="underline underline-offset-3 hover:text-foreground">
                Lihat daftar
              </Link>
            </p>
          </>
        )}
      </StatTile>

      <StatTile label="Biaya API berjalan" value={formatUsd(stats.biaya_usd_berjalan)}>
        {stats.pesan_tanpa_estimasi_biaya > 0 ? (
          <StatusLabel level="warning" className="text-xs text-foreground">
            {formatNumber(stats.pesan_tanpa_estimasi_biaya)} jawaban belum terhitung: tarif model
            belum didaftarkan
          </StatusLabel>
        ) : (
          <p>Estimasi dari token terpakai, bukan tagihan resmi.</p>
        )}
      </StatTile>

      <StatTile
        label="Waktu proses (p95)"
        value={stats.latency_p95_ms == null ? "—" : formatDuration(stats.latency_p95_ms)}
      >
        <p>95% jawaban selesai dalam waktu ini. Target kemunculan kata pertama &lt; 3 dtk.</p>
      </StatTile>
    </div>
  )
}

function VolumeCard({ stats }: { stats: Stats }) {
  const [tabel, setTabel] = useState(false)
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Pertanyaan per hari</CardTitle>
        <CardDescription>
          {formatNumber(stats.total_pertanyaan)} pertanyaan dalam{" "}
          {formatNumber(stats.total_percakapan)} percakapan. Volume adalah konteks, bukan ukuran
          keberhasilan: angka tinggi juga bisa berarti mahasiswa bertanya berulang karena jawaban
          kurang membantu.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => setTabel((t) => !t)} aria-pressed={tabel}>
            {tabel ? <ChartColumnIcon data-icon="inline-start" /> : <TableIcon data-icon="inline-start" />}
            {tabel ? "Grafik" : "Tabel"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {tabel ? (
          <DailyVolumeTable data={stats.volume_harian} />
        ) : (
          <DailyVolumeChart data={stats.volume_harian} />
        )}
      </CardContent>
    </Card>
  )
}

// Sapaan memakai warna netral, bukan warna seri: ia bukan hasil penanganan
// pertanyaan, jadi tidak setara dengan tiga jenis lainnya.
const KIND_SEGMENTS = [
  { key: "answer", swatch: "bg-series-1" },
  { key: "refusal", swatch: "bg-series-2" },
  { key: "support", swatch: "bg-series-3" },
  { key: "smalltalk", swatch: "bg-muted-foreground/40" },
] as const

/** Bagian dari keseluruhan: satu batang bertumpuk, legenda sekaligus berfungsi sebagai label nilai. */
function KindCard({ stats }: { stats: Stats }) {
  const total = KIND_SEGMENTS.reduce((jumlah, s) => jumlah + stats.rincian_jenis[s.key], 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jenis balasan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-3 w-full gap-0.5" role="img" aria-label="Proporsi jenis balasan">
          {KIND_SEGMENTS.filter((s) => stats.rincian_jenis[s.key] > 0).map((s) => (
            <div
              key={s.key}
              className={cn("h-full first:rounded-l-[4px] last:rounded-r-[4px]", s.swatch)}
              style={{ flexGrow: stats.rincian_jenis[s.key], flexBasis: 0 }}
            />
          ))}
        </div>
        <ul className="space-y-2 text-sm">
          {KIND_SEGMENTS.map((s) => {
            const n = stats.rincian_jenis[s.key]
            return (
              <li key={s.key} className="flex items-center gap-2">
                <span className={cn("size-2.5 shrink-0 rounded-[2px]", s.swatch)} aria-hidden />
                <span className="flex-1">{KIND_LABELS[s.key]}</span>
                <span className="font-medium tabular-nums">{formatNumber(n)}</span>
                <span className="w-12 text-right text-muted-foreground tabular-nums">
                  {total ? formatPercent(n / total, 0) : "—"}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function TopicCard({ stats }: { stats: Stats }) {
  const terbanyak = stats.topik_populer.reduce((max, t) => Math.max(max, t.jumlah), 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Topik berisiko tinggi</CardTitle>
        <CardDescription>Jawaban pada topik ini selalu disertai kontak unit resmi.</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.topik_populer.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pertanyaan pada topik berisiko.</p>
        ) : (
          <ul className="space-y-3">
            {stats.topik_populer.map((t) => (
              <li key={t.topik} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="truncate">{topicLabel(t.topik)}</span>
                <div className="h-2" aria-hidden>
                  <div
                    className="h-full rounded-r-[4px] bg-series-1"
                    style={{ width: `${(t.jumlah / terbanyak) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium tabular-nums">{formatNumber(t.jumlah)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}
