"use client"

import { ActivityIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { EmptyState, QueryError } from "@/components/common"
import { durasi, nodeLabel, useLogTime } from "@/components/logs/shared"
import { StatusLabel } from "@/components/status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { Schemas } from "@/lib/api/client"
import { useLogSummary, type LogRange } from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Summary = Schemas["LogSummary"]

/** Batas "lambat" untuk kartu p95. Jawaban LLM wajar beberapa detik; di atas
    ini mahasiswa mulai mengira chatbot macet. */
const P95_LAMBAT_MS = 8_000

export function PerformanceTab({ range }: { range: LogRange }) {
  const t = useT()
  const summary = useLogSummary(range)

  if (summary.error) return <QueryError error={summary.error} onRetry={() => summary.refetch()} />
  if (!summary.data) return <PerformanceSkeleton />
  if (summary.data.jumlah_giliran === 0) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title={t.logs.emptyPerformance}
        description={t.logs.emptyPerformanceBody}
      />
    )
  }

  const data = summary.data
  return (
    <div className={cn("space-y-6 transition-opacity", summary.isPlaceholderData && "opacity-60")}>
      <KpiRow data={data} />
      <div className="grid gap-6 lg:grid-cols-5">
        <NodeCard data={data} className="lg:col-span-3" />
        <ExitCard data={data} className="lg:col-span-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <LatencyCard data={data} range={range} />
        <ErrorCard data={data} range={range} />
      </div>
    </div>
  )
}

// --- KPI -------------------------------------------------------------------

function KpiRow({ data }: { data: Summary }) {
  const t = useT()
  const f = useFormat()
  const dijawab = data.titik_keluar.find((x) => x.node === "generate")?.jumlah ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label={t.logs.kpi.turns} value={f.number(data.jumlah_giliran)}>
        <p>{t.logs.kpi.turnsNote(f.number(dijawab))}</p>
      </StatTile>

      <StatTile
        label={t.logs.kpi.p95}
        value={data.p95_total_ms == null ? "—" : durasi(f, data.p95_total_ms)}
      >
        {data.p95_total_ms != null && data.p95_total_ms > P95_LAMBAT_MS ? (
          <StatusLabel level="warning" className="text-xs text-foreground">
            {t.logs.kpi.p95Note(durasi(f, data.p50_total_ms ?? 0))}
          </StatusLabel>
        ) : (
          <p>{t.logs.kpi.p95Note(durasi(f, data.p50_total_ms ?? 0))}</p>
        )}
      </StatTile>

      <StatTile label={t.logs.kpi.errors} value={f.percent(data.rasio_error)}>
        <StatusLabel
          level={data.giliran_error === 0 && data.log_error === 0 ? "good" : "critical"}
          className="text-xs text-foreground"
        >
          {t.logs.kpi.errorsNote(f.number(data.log_error))}
        </StatusLabel>
      </StatTile>

      <StatTile label={t.logs.kpi.blocked} value={f.percent(data.rasio_diblokir_jev)}>
        <p>{t.logs.kpi.blockedNote(f.number(data.diblokir_jev))}</p>
      </StatTile>
    </div>
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
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {children ? <div className="space-y-1 text-xs text-muted-foreground">{children}</div> : null}
      </CardContent>
    </Card>
  )
}

// --- Durasi per node ----------------------------------------------------------

/**
 * Batang mendatar, bukan grafik recharts: durasi antar langkah berselisih tiga
 * orde (1 md untuk sanitasi, beberapa detik untuk LLM). Di satu sumbu linear
 * langkah cepat menjadi garis tak terlihat; di sini setiap baris tetap membawa
 * angkanya sendiri, dan batangnya hanya memberi rasa proporsi.
 */
function NodeCard({ data, className }: { data: Summary; className?: string }) {
  const t = useT()
  const f = useFormat()
  const terlama = data.per_node.reduce((max, n) => Math.max(max, n.p95_ms ?? 0), 0)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t.logs.nodeTitle}</CardTitle>
        <CardDescription>{t.logs.nodeDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.per_node.map((n) => {
            const p50 = n.p50_ms ?? 0
            const p95 = n.p95_ms ?? 0
            return (
              <li
                key={n.node}
                className="grid grid-cols-[9rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[11rem_1fr_auto]"
              >
                <span className="min-w-0">
                  <span className="block truncate">{nodeLabel(t, n.node)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t.logs.nodeRuns(f.number(n.jumlah))}
                    {n.error > 0 ? (
                      <span className="text-status-critical"> · {t.logs.nodeErrors(f.number(n.error))}</span>
                    ) : null}
                  </span>
                </span>
                <div className="relative h-2.5" aria-hidden>
                  <div
                    className="absolute inset-y-0 left-0 rounded-[2px] bg-series-1-track"
                    style={{ width: `${terlama ? Math.max((p95 / terlama) * 100, 0.5) : 0}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-[2px] bg-series-1"
                    style={{ width: `${terlama ? Math.max((p50 / terlama) * 100, 0.5) : 0}%` }}
                  />
                </div>
                <span className="w-28 text-right text-xs tabular-nums">
                  <span className="font-medium">{durasi(f, p50)}</span>
                  <span className="text-muted-foreground"> / {durasi(f, p95)}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-series-1" aria-hidden />
            p50
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-series-1-track" aria-hidden />
            p95
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Titik keluar ---------------------------------------------------------------

function ExitCard({ data, className }: { data: Summary; className?: string }) {
  const t = useT()
  const f = useFormat()
  const total = data.titik_keluar.reduce((jumlah, x) => jumlah + x.jumlah, 0)
  const terbanyak = data.titik_keluar.reduce((max, x) => Math.max(max, x.jumlah), 0)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t.logs.exitTitle}</CardTitle>
        <CardDescription>{t.logs.exitDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.titik_keluar.map((x) => (
            <li key={x.node} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3 text-sm">
              <span className="truncate">{nodeLabel(t, x.node)}</span>
              <div className="h-2" aria-hidden>
                <div
                  className={cn(
                    "h-full rounded-[2px]",
                    x.node === "generate" ? "bg-series-1" : "bg-series-2"
                  )}
                  style={{ width: `${terbanyak ? (x.jumlah / terbanyak) * 100 : 0}%` }}
                />
              </div>
              <span className="w-20 text-right tabular-nums">
                <span className="font-medium">{f.number(x.jumlah)}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {total ? f.percent(x.jumlah / total, 0) : "—"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// --- Tren per jam ----------------------------------------------------------------

function LatencyCard({ data, range }: { data: Summary; range: LogRange }) {
  const t = useT()
  const f = useFormat()
  const waktu = useLogTime()
  const config = {
    p95_total_ms: { label: t.logs.series.p95, color: "var(--series-1)" },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.logs.hourlyTitle}</CardTitle>
        <CardDescription>{t.logs.hourlyDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-56 w-full">
          <LineChart data={data.per_jam} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="jam"
              tickLine={false}
              axisLine={{ stroke: "var(--chart-axis)" }}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => waktu.sumbu(value, range)}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => f.duration(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    const jam = payload?.[0]?.payload?.jam
                    return typeof jam === "string" ? waktu.lengkap(jam) : null
                  }}
                  formatter={(value) => (
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <span className="text-muted-foreground">{t.logs.series.p95}</span>
                      <span className="font-mono font-medium tabular-nums">
                        {durasi(f, Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            {/* Jam tanpa giliran bernilai null: garisnya terputus, bukan jatuh ke
                nol -- nol berarti "cepat sekali", padahal tidak ada yang bertanya. */}
            <Line
              dataKey="p95_total_ms"
              type="monotone"
              stroke="var(--color-p95_total_ms)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function ErrorCard({ data, range }: { data: Summary; range: LogRange }) {
  const t = useT()
  const f = useFormat()
  const waktu = useLogTime()
  const config = {
    giliran_error: { label: t.logs.series.turnErrors, color: "var(--status-critical)" },
    log_error: { label: t.logs.series.logErrors, color: "var(--status-serious)" },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.logs.errorTitle}</CardTitle>
        <CardDescription>{t.logs.errorDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChartContainer config={config} className="aspect-auto h-56 w-full">
          <BarChart data={data.per_jam} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="jam"
              tickLine={false}
              axisLine={{ stroke: "var(--chart-axis)" }}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => waktu.sumbu(value, range)}
            />
            <YAxis
              width={32}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickFormatter={(value: number) => f.number(value)}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    const jam = payload?.[0]?.payload?.jam
                    return typeof jam === "string" ? waktu.lengkap(jam) : null
                  }}
                />
              }
            />
            <Bar
              dataKey="giliran_error"
              stackId="error"
              fill="var(--color-giliran_error)"
              maxBarSize={16}
              isAnimationActive={false}
            />
            <Bar
              dataKey="log_error"
              stackId="error"
              fill="var(--color-log_error)"
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-status-critical" aria-hidden />
            {t.logs.series.turnErrors}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-status-serious" aria-hidden />
            {t.logs.series.logErrors}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}
