"use client"

import {
  ChartColumnIcon,
  CircleDollarSignIcon,
  MinusIcon,
  TableIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useState } from "react"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { CostDailyChart, CostDailyTable, SERIES } from "@/components/costs/cost-charts"
import { DateRangeField } from "@/components/date-field"
import { StatusLabel } from "@/components/status"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import { useCosts, type StatsRange } from "@/lib/api/queries"
import { addDays, formatUsd, formatUsdPrecise, parseDateOnly, toDateInput } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"
import type { Format } from "@/lib/format"
import { cn } from "@/lib/utils"

type Costs = Schemas["Costs"]
type Daily = Schemas["DailyCost"]
type ByModel = Schemas["CostByModel"]
type Preset = "7" | "30" | "90" | "kustom"

/** Sama dengan halaman Statistik: log tidak pernah lebih tua dari umur layanan. */
const HARI_TERJAUH = 730

const MS_PER_HARI = 86_400_000

/** Panjang proyeksi bulanan pada KPI -- bulan kalender berbeda-beda, ini sekadar rasa. */
const HARI_PROYEKSI = 30

export function CostsView() {
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
  const valid = !!range.sejak && !!range.sampai && range.sejak <= range.sampai
  const hari = valid ? jumlahHari(range) : 0

  const costs = useCosts(valid ? range : null)
  // Angka biaya sendirian tidak dapat dinilai: $12 sebulan itu naik atau turun?
  // Rentang sebelumnya yang sama panjang memberi pembandingnya.
  const sebelumnya = useCosts(valid ? rentangSebelumnya(range, hari) : null)

  function pilihPreset(value: Preset) {
    if (value === "kustom" && preset !== "kustom") setKustom(range)
    setPreset(value)
  }

  return (
    <>
      <PageHeader title={t.costs.title} description={t.costs.description} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Tabs value={preset} onValueChange={(value) => pilihPreset(value as Preset)}>
          <TabsList>
            <TabsTrigger value="7">{t.range.d7}</TabsTrigger>
            <TabsTrigger value="30">{t.range.d30}</TabsTrigger>
            <TabsTrigger value="90">{t.range.d90}</TabsTrigger>
            <TabsTrigger value="kustom">{t.range.custom}</TabsTrigger>
          </TabsList>
        </Tabs>
        {preset === "kustom" ? (
          <DateRangeField
            id="rentang-biaya"
            min={toDateInput(addDays(new Date(now), -HARI_TERJAUH))}
            max={hariIni}
            value={kustom}
            onChange={setKustom}
          />
        ) : null}
      </div>

      {!valid ? (
        <p className="text-sm text-muted-foreground">{t.range.invalid}</p>
      ) : costs.error ? (
        <QueryError error={costs.error} onRetry={() => costs.refetch()} />
      ) : !costs.data ? (
        <CostsSkeleton />
      ) : jumlahPanggilan(costs.data) === 0 ? (
        <EmptyState
          icon={CircleDollarSignIcon}
          title={t.costs.empty}
          description={t.range.between(f.date(costs.data.sejak), f.date(costs.data.sampai))}
        />
      ) : (
        <div className={cn("space-y-6 transition-opacity", costs.isPlaceholderData && "opacity-60")}>
          <KpiRow costs={costs.data} sebelumnya={sebelumnya.data} hari={hari} />
          <div className="grid gap-6 lg:grid-cols-3">
            <DailyCard costs={costs.data} range={range} hari={hari} />
            <SourceCard costs={costs.data} />
          </div>
          <ModelCard costs={costs.data} />
        </div>
      )}
    </>
  )
}

// --- KPI -------------------------------------------------------------------

function KpiRow({
  costs,
  sebelumnya,
  hari,
}: {
  costs: Costs
  sebelumnya: Costs | undefined
  hari: number
}) {
  const t = useT()
  const f = useFormat()
  const perHari = costs.biaya_usd / hari
  const panggilan = jumlahPanggilan(costs)
  const tanpaBiaya =
    costs.llm_tanpa_biaya + costs.embed_chat_tanpa_biaya + costs.usage_log_tanpa_biaya
  const cakupan = (panggilan - tanpaBiaya) / panggilan
  // Penolakan FR-3 berbiaya embedding tanpa memanggil LLM, jadi pembilangnya
  // memuat biaya yang penyebutnya tidak hitung. Disebut di keterangan, bukan
  // disembunyikan: menghapusnya justru membuat biaya per jawaban tampak murah.
  const biayaChat = costs.biaya_llm_usd + costs.biaya_embed_chat_usd
  const perJawaban = costs.jumlah_panggilan_llm ? biayaChat / costs.jumlah_panggilan_llm : null

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label={t.costs.total} value={formatUsd(costs.biaya_usd)}>
        <Delta sekarang={costs.biaya_usd} sebelum={sebelumnya?.biaya_usd} hari={hari} />
      </StatTile>

      <StatTile label={t.costs.perDay} value={formatUsdPrecise(perHari)}>
        <p>{t.costs.projection(formatUsd(perHari * HARI_PROYEKSI), HARI_PROYEKSI)}</p>
      </StatTile>

      <StatTile
        label={t.costs.perAnswer}
        value={perJawaban == null ? "—" : formatUsdPrecise(perJawaban)}
      >
        {perJawaban == null ? (
          <p>{t.costs.perAnswerNone}</p>
        ) : (
          <p>{t.costs.perAnswerNote(f.number(costs.jumlah_panggilan_llm))}</p>
        )}
      </StatTile>

      <StatTile label={t.costs.coverage} value={f.percent(cakupan)}>
        {tanpaBiaya === 0 ? (
          <StatusLabel level="good" className="text-xs text-foreground">
            {t.costs.coverageFull(f.number(panggilan))}
          </StatusLabel>
        ) : (
          <StatusLabel level="warning" className="text-xs text-foreground">
            {t.costs.coveragePartial(f.number(tanpaBiaya), f.number(panggilan))}
          </StatusLabel>
        )}
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

/** Perubahan terhadap rentang sepanjang ini yang berakhir sehari sebelum rentang ini. */
function Delta({
  sekarang,
  sebelum,
  hari,
}: {
  sekarang: number
  sebelum: number | undefined
  hari: number
}) {
  const t = useT()
  const f = useFormat()
  const hariTeks = f.number(hari)
  if (sebelum === undefined) return <p>{t.costs.totalRange(hariTeks)}</p>
  if (sebelum === 0) return <p>{t.costs.noPrevious(hariTeks)}</p>

  const rasio = sekarang / sebelum - 1
  const datar = Math.abs(rasio) < 0.005
  const Icon = datar ? MinusIcon : rasio > 0 ? TrendingUpIcon : TrendingDownIcon
  return (
    <p className="flex flex-wrap items-center gap-x-1.5">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="text-foreground">
        {datar ? t.costs.flat : `${rasio > 0 ? "+" : "−"}${f.percent(Math.abs(rasio), 0)}`}
      </span>
      <span>{t.costs.versusPrevious(hariTeks, formatUsd(sebelum))}</span>
    </p>
  )
}

// --- Tren harian -----------------------------------------------------------

function DailyCard({ costs, range, hari }: { costs: Costs; range: StatsRange; hari: number }) {
  const t = useT()
  const f = useFormat()
  const [tabel, setTabel] = useState(false)
  const data = lengkapiHari(costs.biaya_harian, range)
  const puncak = data.reduce((max, row) => (row.biaya_usd > max.biaya_usd ? row : max), data[0])

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t.costs.dailyTitle}</CardTitle>
        <CardDescription>
          {t.costs.dailyRange(f.shortDate(range.sejak), f.date(range.sampai), f.number(hari))}
          {puncak && puncak.biaya_usd > 0
            ? t.costs.dailyPeak(f.date(puncak.tanggal), formatUsd(puncak.biaya_usd))
            : null}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => setTabel((v) => !v)} aria-pressed={tabel}>
            {tabel ? (
              <ChartColumnIcon data-icon="inline-start" />
            ) : (
              <TableIcon data-icon="inline-start" />
            )}
            {tabel ? t.common.chart : t.common.table}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {tabel ? <CostDailyTable data={data} /> : <CostDailyChart data={data} />}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-[2px]", s.swatch)} aria-hidden />
              {t.costs.sources[s.source]}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Komposisi sumber ------------------------------------------------------

/**
 * Bagian dari keseluruhan sebagai satu batang bertumpuk, pola yang sama dengan
 * "Jenis balasan" di halaman Statistik. Tiga potongan yang satu di antaranya
 * hampir selalu mendominasi tidak terbaca sebagai lingkaran.
 */
function SourceCard({ costs }: { costs: Costs }) {
  const t = useT()
  const f = useFormat()
  const baris = [
    {
      ...SERIES[0],
      biaya: costs.biaya_llm_usd,
      panggilan: costs.jumlah_panggilan_llm,
      rincian: t.costs.inOut(f.number(costs.input_tokens), f.number(costs.output_tokens)),
      tanpaBiaya: costs.llm_tanpa_biaya,
    },
    {
      ...SERIES[1],
      biaya: costs.biaya_embed_chat_usd,
      panggilan: costs.jumlah_embed_chat,
      rincian: t.costs.tokens(f.number(costs.embed_chat_tokens)),
      tanpaBiaya: costs.embed_chat_tanpa_biaya,
    },
    {
      ...SERIES[2],
      biaya: costs.biaya_usage_log_usd,
      panggilan: costs.jumlah_usage_log,
      rincian: t.costs.tokens(f.number(costs.usage_log_tokens)),
      tanpaBiaya: costs.usage_log_tanpa_biaya,
    },
  ]
  const total = costs.biaya_usd

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.costs.sourceTitle}</CardTitle>
        <CardDescription>{t.costs.sourceDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-3 w-full gap-0.5" role="img" aria-label={t.costs.sourceProportion}>
          {baris
            .filter((b) => b.biaya > 0)
            .map((b) => (
              <div
                key={b.key}
                className={cn("h-full first:rounded-l-[4px] last:rounded-r-[4px]", b.swatch)}
                // Porsi, bukan nilai dolarnya: jumlah `flex-grow` di bawah 1
                // hanya membagi sebagian ruang, sehingga batang $0,14 menyisakan
                // 86% kosong dan terbaca sebagai "baru terpakai sedikit".
                style={{ flexGrow: (b.biaya / total) * 100, flexBasis: 0 }}
              />
            ))}
        </div>

        <ul className="space-y-3">
          {baris.map((b) => (
            <li key={b.key} className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className={cn("size-2.5 shrink-0 rounded-[2px]", b.swatch)} aria-hidden />
                <span className="flex-1">{t.costs.sources[b.source]}</span>
                <span className="font-medium tabular-nums">{formatUsdPrecise(b.biaya)}</span>
                <span className="w-10 text-right text-muted-foreground tabular-nums">
                  {total ? f.percent(b.biaya / total, 0) : "—"}
                </span>
              </div>
              <p className="pl-[18px] text-xs text-muted-foreground">
                {b.panggilan === 0
                  ? t.costs.noCalls
                  : t.costs.callsTokens(f.number(b.panggilan), b.rincian)}
                {b.tanpaBiaya > 0 ? t.costs.withoutCost(f.number(b.tanpaBiaya)) : ""}
              </p>
            </li>
          ))}
        </ul>

        <p className="border-t pt-3 text-xs text-muted-foreground">{t.costs.embeddingNote}</p>
      </CardContent>
    </Card>
  )
}

// --- Rincian per model -----------------------------------------------------

const JENIS: ByModel["jenis"][] = ["llm_chat", "embedding_chat", "embedding_ingestion"]

function ModelCard({ costs }: { costs: Costs }) {
  const t = useT()
  const f = useFormat()
  const total = costs.biaya_usd

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.costs.modelTitle}</CardTitle>
        <CardDescription>{t.costs.modelDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-3">{t.costs.columns.model}</TableHead>
                <TableHead className="text-right">{t.costs.columns.calls}</TableHead>
                <TableHead className="text-right">{t.costs.columns.tokens}</TableHead>
                <TableHead className="text-right">{t.costs.columns.cost}</TableHead>
                <TableHead className="w-24 pr-3 text-right">{t.costs.columns.share}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {JENIS.map((jenis) => {
                const rows = costs.rincian_model.filter((row) => row.jenis === jenis)
                if (rows.length === 0) return null
                return <ModelGroup key={jenis} jenis={jenis} rows={rows} total={total} t={t} f={f} />
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="pl-3 font-medium">{t.costs.dailyTotal}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {f.number(jumlahPanggilan(costs))}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {f.number(costs.total_tokens)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatUsd(total)}
                </TableCell>
                <TableCell className="pr-3" />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function ModelGroup({
  jenis,
  rows,
  total,
  t,
  f,
}: {
  jenis: ByModel["jenis"]
  rows: ByModel[]
  total: number
  t: Dict
  f: Format
}) {
  const kelompok = t.costs.kinds[jenis]
  return (
    <>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableCell colSpan={5} className="py-2 pl-3">
          <span className="text-xs font-medium tracking-wide uppercase">{kelompok.label}</span>
          <span className="ml-2 text-xs text-muted-foreground">{kelompok.note}</span>
        </TableCell>
      </TableRow>
      {rows.map((row) => (
        <TableRow key={`${row.jenis}-${row.model}`}>
          <TableCell className="max-w-64 pl-3 font-medium break-words">{row.model}</TableCell>
          <TableCell className="text-right tabular-nums">{f.number(row.jumlah_panggilan)}</TableCell>
          <TableCell className="text-right tabular-nums">
            {f.number(row.tokens)}
            {row.jenis === "llm_chat" ? (
              <span className="block text-xs text-muted-foreground">
                {t.costs.inOut(f.number(row.input_tokens), f.number(row.output_tokens))}
              </span>
            ) : null}
          </TableCell>
          <TableCell className="text-right tabular-nums">{formatUsdPrecise(row.biaya_usd)}</TableCell>
          <TableCell className="pr-3">
            <div className="flex items-center justify-end gap-2">
              <div className="h-1.5 w-10 rounded-[2px] bg-series-1-track" aria-hidden>
                <div
                  className="h-full rounded-[2px] bg-series-1"
                  style={{ width: `${total ? Math.min((row.biaya_usd / total) * 100, 100) : 0}%` }}
                />
              </div>
              <span className="w-9 text-right text-muted-foreground tabular-nums">
                {total ? f.percent(row.biaya_usd / total, 0) : "—"}
              </span>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// --- Bantuan ---------------------------------------------------------------

function jumlahPanggilan(costs: Costs): number {
  return costs.jumlah_panggilan_llm + costs.jumlah_embed_chat + costs.jumlah_usage_log
}

/** Rentang inklusif: 1–30 September berarti 30 hari, bukan 29. */
function jumlahHari(range: StatsRange): number {
  const jarak = parseDateOnly(range.sampai).getTime() - parseDateOnly(range.sejak).getTime()
  return Math.round(jarak / MS_PER_HARI) + 1
}

/** Rentang sepanjang `hari` yang berakhir tepat sehari sebelum rentang ini mulai. */
function rentangSebelumnya(range: StatsRange, hari: number): StatsRange {
  const sampai = addDays(parseDateOnly(range.sejak), -1)
  return { sejak: toDateInput(addDays(sampai, -(hari - 1))), sampai: toDateInput(sampai) }
}

/**
 * Backend hanya mengirim hari yang berbiaya. Tanpa hari nol disisipkan,
 * sumbu waktunya berbohong: tiga hari aktif yang terpisah sebulan tergambar
 * sebagai tiga hari berturut-turut, dan tren yang dibaca dari situ salah.
 */
function lengkapiHari(data: Daily[], range: StatsRange): Daily[] {
  const peta = new Map(data.map((row) => [row.tanggal, row]))
  const hasil: Daily[] = []
  for (
    let hari = parseDateOnly(range.sejak);
    toDateInput(hari) <= range.sampai;
    hari = addDays(hari, 1)
  ) {
    const tanggal = toDateInput(hari)
    hasil.push(
      peta.get(tanggal) ?? {
        tanggal,
        jumlah_panggilan: 0,
        llm_tokens: 0,
        embed_tokens: 0,
        biaya_llm_usd: 0,
        biaya_embedding_usd: 0,
        biaya_ingestion_usd: 0,
        biaya_usd: 0,
      }
    )
  }
  return hasil
}

function CostsSkeleton() {
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
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
