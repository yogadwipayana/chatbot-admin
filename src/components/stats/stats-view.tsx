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
import { addDays, formatUsd, toDateInput } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"
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
  const t = useT()
  const f = useFormat()
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
        title={t.stats.title}
        description={t.stats.description}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Tabs value={preset} onValueChange={(v) => pilihPreset(v as Preset)}>
          <TabsList>
            <TabsTrigger value="7">{t.range.d7}</TabsTrigger>
            <TabsTrigger value="30">{t.range.d30}</TabsTrigger>
            <TabsTrigger value="90">{t.range.d90}</TabsTrigger>
            <TabsTrigger value="kustom">{t.range.custom}</TabsTrigger>
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
        <p className="text-sm text-muted-foreground">{t.range.invalid}</p>
      ) : stats.error ? (
        <QueryError error={stats.error} onRetry={() => stats.refetch()} />
      ) : !stats.data ? (
        <StatsSkeleton />
      ) : stats.data.total_pertanyaan === 0 ? (
        <EmptyState
          icon={ChartColumnIcon}
          title={t.stats.empty}
          description={t.range.between(f.date(stats.data.sejak), f.date(stats.data.sampai))}
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
  const t = useT()
  const f = useFormat()
  const fb = stats.rasio_feedback_positif
  const tt = stats.rasio_tak_terjawab
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label={t.stats.feedbackRatio} value={fb == null ? "—" : f.percent(fb)}>
        {fb == null ? (
          <p>{t.stats.feedbackNone}</p>
        ) : (
          <>
            <StatusLabel level={fb >= TARGET_FEEDBACK ? "good" : "serious"} className="text-xs text-foreground">
              {fb >= TARGET_FEEDBACK
                ? t.stats.feedbackMeets(f.percent(TARGET_FEEDBACK, 0))
                : t.stats.feedbackBelow(f.percent(TARGET_FEEDBACK, 0))}
            </StatusLabel>
            <p>{t.stats.feedbackFrom(f.number(stats.jumlah_feedback))}</p>
          </>
        )}
      </StatTile>

      <StatTile label={t.stats.unanswered} value={tt == null ? "—" : f.percent(tt)}>
        {tt == null ? null : (
          <>
            <StatusLabel level={tt < TARGET_TAK_TERJAWAB ? "good" : "serious"} className="text-xs text-foreground">
              {tt < TARGET_TAK_TERJAWAB
                ? t.stats.unansweredMeets(f.percent(TARGET_TAK_TERJAWAB, 0))
                : t.stats.unansweredAbove(f.percent(TARGET_TAK_TERJAWAB, 0))}
            </StatusLabel>
            <p>
              {t.stats.unansweredOf(
                f.number(stats.rincian_jenis.refusal),
                f.number(stats.total_pertanyaan)
              )}
              <Link href="/pertanyaan" className="underline underline-offset-3 hover:text-foreground">
                {t.stats.seeList}
              </Link>
            </p>
          </>
        )}
      </StatTile>

      <StatTile label={t.stats.cost} value={formatUsd(stats.biaya_usd_berjalan)}>
        {stats.pesan_tanpa_estimasi_biaya > 0 ? (
          <StatusLabel level="warning" className="text-xs text-foreground">
            {t.stats.costMissing(f.number(stats.pesan_tanpa_estimasi_biaya))}
          </StatusLabel>
        ) : (
          <p>{t.stats.costNote}</p>
        )}
      </StatTile>

      <StatTile
        label={t.stats.latency}
        value={stats.latency_p95_ms == null ? "—" : f.duration(stats.latency_p95_ms)}
      >
        <p>{t.stats.latencyNote}</p>
      </StatTile>
    </div>
  )
}

function VolumeCard({ stats }: { stats: Stats }) {
  const t = useT()
  const f = useFormat()
  const [tabel, setTabel] = useState(false)
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t.stats.volumeTitle}</CardTitle>
        <CardDescription>
          {t.stats.volumeDescription(
            f.number(stats.total_pertanyaan),
            f.number(stats.total_percakapan)
          )}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => setTabel((t) => !t)} aria-pressed={tabel}>
            {tabel ? <ChartColumnIcon data-icon="inline-start" /> : <TableIcon data-icon="inline-start" />}
            {tabel ? t.common.chart : t.common.table}
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
] as const satisfies readonly { key: keyof Dict["labels"]["kind"]; swatch: string }[]

/** Bagian dari keseluruhan: satu batang bertumpuk, legenda sekaligus berfungsi sebagai label nilai. */
function KindCard({ stats }: { stats: Stats }) {
  const t = useT()
  const f = useFormat()
  const total = KIND_SEGMENTS.reduce((jumlah, s) => jumlah + stats.rincian_jenis[s.key], 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.stats.kindTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-3 w-full gap-0.5" role="img" aria-label={t.stats.kindTitle}>
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
                <span className="flex-1">{t.labels.kind[s.key]}</span>
                <span className="font-medium tabular-nums">{f.number(n)}</span>
                <span className="w-12 text-right text-muted-foreground tabular-nums">
                  {total ? f.percent(n / total, 0) : "—"}
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
  const t = useT()
  const f = useFormat()
  const terbanyak = stats.topik_populer.reduce((max, baris) => Math.max(max, baris.jumlah), 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.stats.topicTitle}</CardTitle>
        <CardDescription>{t.stats.topicDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.topik_populer.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.stats.topicEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {stats.topik_populer.map((baris) => (
              <li key={baris.topik} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-sm">
                {/* Topik yang belum dikenal kamus tampil apa adanya, bukan hilang. */}
                <span className="truncate">
                  {t.labels.topic[baris.topik as keyof typeof t.labels.topic] ?? baris.topik}
                </span>
                <div className="h-2" aria-hidden>
                  <div
                    className="h-full rounded-r-[4px] bg-series-1"
                    style={{ width: `${(baris.jumlah / terbanyak) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium tabular-nums">
                  {f.number(baris.jumlah)}
                </span>
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
