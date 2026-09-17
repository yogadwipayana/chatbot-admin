"use client"

import { CircleDollarSignIcon } from "lucide-react"
import { useState } from "react"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { DateRangeField } from "@/components/date-field"
import { CostDailyChart, CostSourceChart } from "@/components/costs/cost-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Schemas } from "@/lib/api/client"
import { useCosts, type StatsRange } from "@/lib/api/queries"
import { addDays, formatDate, formatNumber, formatUsd, toDateInput } from "@/lib/format"

type Costs = Schemas["Costs"]
type Preset = "7" | "30" | "90" | "kustom"
const HARI_TERJAUH = 730

export function CostsView() {
  const [preset, setPreset] = useState<Preset>("30")
  const [kustom, setKustom] = useState<StatsRange>({ sejak: "", sampai: "" })
  const hariIni = toDateInput(new Date())
  const range = preset === "kustom"
    ? kustom
    : { sejak: toDateInput(addDays(new Date(), -(Number(preset) - 1))), sampai: hariIni }
  const valid = !!range.sejak && !!range.sampai && range.sejak <= range.sampai
  const costs = useCosts(valid ? range : null)

  return (
    <>
      <PageHeader
        title="Biaya"
        description="Biaya LLM, embedding pertanyaan, serta ingestion dan reindex dari messages.meta dan usage_log. Nilai estimasi bukan tagihan resmi provider."
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Tabs value={preset} onValueChange={(value) => setPreset(value as Preset)}>
          <TabsList>
            <TabsTrigger value="7">7 hari</TabsTrigger>
            <TabsTrigger value="30">30 hari</TabsTrigger>
            <TabsTrigger value="90">90 hari</TabsTrigger>
            <TabsTrigger value="kustom">Pilih tanggal</TabsTrigger>
          </TabsList>
        </Tabs>
        {preset === "kustom" ? (
          <DateRangeField id="rentang-biaya" min={toDateInput(addDays(new Date(), -HARI_TERJAUH))} max={hariIni} value={kustom} onChange={setKustom} />
        ) : null}
      </div>
      {!valid ? (
        <p className="text-sm text-muted-foreground">Pilih tanggal awal dan akhir yang valid.</p>
      ) : costs.error ? (
        <QueryError error={costs.error} onRetry={() => costs.refetch()} />
      ) : !costs.data ? (
        <CostsSkeleton />
      ) : costs.data.jumlah_panggilan_llm + costs.data.jumlah_embed_chat + costs.data.jumlah_usage_log === 0 ? (
        <EmptyState icon={CircleDollarSignIcon} title="Belum ada pemanggilan model" description={`${formatDate(costs.data.sejak)} sampai ${formatDate(costs.data.sampai)}`} />
      ) : (
        <div className="space-y-6">
          <KpiRow costs={costs.data} />
          <SourceCard costs={costs.data} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tren biaya harian</CardTitle>
                <CardDescription>Perbandingan biaya LLM, embedding pertanyaan, dan ingestion.</CardDescription>
              </CardHeader>
              <CardContent><CostDailyChart data={costs.data.biaya_harian} /></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Komposisi biaya</CardTitle>
                <CardDescription>Proporsi total biaya berdasarkan sumber pemakaian.</CardDescription>
              </CardHeader>
              <CardContent>
                <CostSourceChart costs={costs.data} />
                <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <LegendDot color="bg-series-1" label="LLM chat" />
                  <LegendDot color="bg-series-2" label="Embedding pertanyaan" />
                  <LegendDot color="bg-series-3" label="Ingestion & reindex" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ModelCard costs={costs.data} />
            <DailyCard costs={costs.data} />
          </div>
        </div>
      )}
    </>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`size-2 rounded-[2px] ${color}`} aria-hidden />{label}</span>
}

function KpiRow({ costs }: { costs: Costs }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Total biaya" value={formatUsd(costs.biaya_usd)} />
      <Kpi label="Input token" value={formatNumber(costs.input_tokens)} />
      <Kpi label="Output token" value={formatNumber(costs.output_tokens)} />
      <Kpi label="Total token" value={formatNumber(costs.total_tokens)} description="LLM dan seluruh embedding yang dilaporkan" />
    </div>
  )
}

function Kpi({ label, value, description }: { label: string; value: string; description?: string }) {
  return <Card><CardContent className="space-y-2"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>{description ? <p className="text-xs text-muted-foreground">{description}</p> : null}</CardContent></Card>
}

function SourceCard({ costs }: { costs: Costs }) {
  const tidakLengkap = costs.llm_tanpa_biaya + costs.embed_chat_tanpa_biaya + costs.usage_log_tanpa_biaya
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sumber biaya</CardTitle>
        <CardDescription>Total merupakan penjumlahan tiga jalur pemakaian model.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <Source label="LLM chat" cost={costs.biaya_llm_usd} detail={`${formatNumber(costs.jumlah_panggilan_llm)} panggilan · ${formatNumber(costs.input_tokens + costs.output_tokens)} token`} />
        <Source label="Embedding pertanyaan" cost={costs.biaya_embed_chat_usd} detail={`${formatNumber(costs.jumlah_embed_chat)} panggilan · ${formatNumber(costs.embed_chat_tokens)} token`} />
        <Source label="Ingestion & reindex" cost={costs.biaya_usage_log_usd} detail={`${formatNumber(costs.jumlah_usage_log)} panggilan · ${formatNumber(costs.usage_log_tokens)} token`} />
        {tidakLengkap > 0 ? <p className="text-sm text-status-warning sm:col-span-3">Estimasi belum lengkap: {formatNumber(costs.llm_tanpa_biaya)} LLM, {formatNumber(costs.embed_chat_tanpa_biaya)} embedding pertanyaan, dan {formatNumber(costs.usage_log_tanpa_biaya)} ingestion tidak memiliki biaya.</p> : null}
      </CardContent>
    </Card>
  )
}

function Source({ label, cost, detail }: { label: string; cost: number; detail: string }) {
  return <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{formatUsd(cost)}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>
}

function ModelCard({ costs }: { costs: Costs }) {
  return <Card><CardHeader><CardTitle>Rincian per model</CardTitle><CardDescription>LLM chat dan embedding dipisahkan agar tokennya tidak rancu.</CardDescription></CardHeader><CardContent><div className="space-y-4">{costs.rincian_model.map((row) => <div key={`${row.jenis}-${row.model}`} className="grid gap-1 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:gap-4"><div><p className="font-medium break-all">{row.model}</p><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{jenisLabel(row.jenis)}</p><p className="text-sm text-muted-foreground">{formatNumber(row.jumlah_panggilan)} panggilan · {row.jenis === "llm_chat" ? `${formatNumber(row.input_tokens)} in · ${formatNumber(row.output_tokens)} out` : `${formatNumber(row.tokens)} token`}</p></div><p className="font-medium tabular-nums sm:text-right">{formatUsd(row.biaya_usd)}</p></div>)}</div></CardContent></Card>
}

function DailyCard({ costs }: { costs: Costs }) {
  return <Card><CardHeader><CardTitle>Biaya per hari</CardTitle><CardDescription>Hari tanpa pemanggilan model tidak ditampilkan.</CardDescription></CardHeader><CardContent><div className="space-y-3">{costs.biaya_harian.map((row) => <div key={row.tanggal} className="flex items-start justify-between gap-4 border-b pb-2 last:border-0"><div><p className="font-medium">{formatDate(row.tanggal)}</p><p className="text-sm text-muted-foreground">{formatNumber(row.llm_tokens)} token LLM · {formatNumber(row.embed_tokens)} token embedding</p><p className="text-xs text-muted-foreground">LLM {formatUsd(row.biaya_llm_usd)} · query {formatUsd(row.biaya_embedding_usd)} · ingestion {formatUsd(row.biaya_ingestion_usd)}</p></div><p className="font-medium tabular-nums">{formatUsd(row.biaya_usd)}</p></div>)}</div></CardContent></Card>
}

function jenisLabel(jenis: Costs["rincian_model"][number]["jenis"]): string {
  if (jenis === "llm_chat") return "LLM chat"
  if (jenis === "embedding_chat") return "Embedding pertanyaan"
  return "Embedding ingestion"
}

function CostsSkeleton() { return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-32 rounded-xl" />)}</div><Skeleton className="h-96 w-full rounded-xl" /></div> }
