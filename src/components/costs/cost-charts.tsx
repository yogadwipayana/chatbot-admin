"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Schemas } from "@/lib/api/client"
import { formatUsd, formatUsdPrecise } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"

type Daily = Schemas["DailyCost"]

/**
 * Tiga jalur biaya. Kunci, warna, dan urutannya tetap di sini; labelnya diambil
 * dari kamus saat menggambar, sehingga grafik, legenda, dan tabel tidak pernah
 * menyebut jalur yang sama dengan dua nama berbeda.
 */
export const SERIES = [
  { key: "biaya_llm_usd", source: "llm", color: "var(--series-1)", swatch: "bg-series-1" },
  { key: "biaya_embedding_usd", source: "embedding", color: "var(--series-2)", swatch: "bg-series-2" },
  { key: "biaya_ingestion_usd", source: "ingestion", color: "var(--series-3)", swatch: "bg-series-3" },
] as const satisfies readonly {
  key: keyof Daily
  source: keyof Dict["costs"]["sources"]
  color: string
  swatch: string
}[]

const TERAKHIR = SERIES[SERIES.length - 1].key

function useDailyConfig(): ChartConfig {
  const t = useT()
  return useMemo(
    () =>
      Object.fromEntries(
        SERIES.map((s) => [s.key, { label: t.costs.sources[s.source], color: s.color }])
      ),
    [t]
  )
}

/**
 * Batang bertumpuk: tinggi totalnya adalah biaya hari itu, potongannya
 * menjawab "dari mana". Tanpa animasi masuk, alasannya sama dengan
 * `daily-volume-chart.tsx`.
 */
export function CostDailyChart({ data }: { data: Daily[] }) {
  const f = useFormat()
  const config = useDailyConfig()

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="tanggal"
          tickLine={false}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => f.shortDate(value)}
        />
        <YAxis
          width={56}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => (value === 0 ? "$0" : formatUsdPrecise(value))}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) => {
                const tanggal = payload?.[0]?.payload?.tanggal
                return typeof tanggal === "string" ? f.date(tanggal) : null
              }}
              // Tooltip menyertakan totalnya sendiri: tiga potongan yang harus
              // dijumlahkan sendiri oleh pembaca membuat perbandingan antar hari
              // -- satu-satunya alasan hover di sini -- mustahil dilakukan cepat.
              formatter={(value, name, item, index) => (
                <>
                  <span
                    className="w-1 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: item?.color }}
                    aria-hidden
                  />
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {config[String(name)]?.label ?? name}
                    </span>
                    <span className="font-mono font-medium tabular-nums">
                      {formatUsdPrecise(Number(value))}
                    </span>
                  </div>
                  {index === SERIES.length - 1 ? <TooltipTotal item={item} /> : null}
                </>
              )}
            />
          }
        />
        {SERIES.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId="biaya"
            fill={`var(--color-${s.key})`}
            radius={s.key === TERAKHIR ? [4, 4, 0, 0] : undefined}
            maxBarSize={24}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

function TooltipTotal({ item }: { item?: { payload?: { biaya_usd?: number } } }) {
  const t = useT()
  return (
    <div className="mt-0.5 flex w-full items-center justify-between gap-3 border-t pt-1">
      <span>{t.costs.dailyTotal}</span>
      <span className="font-mono font-medium tabular-nums">
        {formatUsdPrecise(Number(item?.payload?.biaya_usd ?? 0))}
      </span>
    </div>
  )
}

/**
 * Kembaran tabel grafik: setiap nilai terbaca tanpa hover dan tanpa warna.
 *
 * Hari kosong sengaja tidak ikut, meski grafiknya memakai seluruh hari. Sumbu
 * waktu butuh jeda itu supaya trennya jujur; daftar angka tidak -- membuka
 * tabel 90 hari yang 87 barisnya "$0.00" berarti menggulir mencari hari yang
 * dicari. Jumlah yang disembunyikan disebut di bawah tabel, supaya kedua
 * tampilan tidak terkesan berselisih.
 */
export function CostDailyTable({ data }: { data: Daily[] }) {
  const t = useT()
  const f = useFormat()
  const terpakai = data.filter((row) => row.biaya_usd > 0 || row.jumlah_panggilan > 0)
  const kosong = data.length - terpakai.length
  const total = terpakai.reduce((jumlah, row) => jumlah + row.biaya_usd, 0)

  if (terpakai.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t.costs.noDays}</p>
  }

  return (
    <div className="space-y-2">
      <div className="max-h-64 overflow-y-auto rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-1 bg-background">
            <TableRow>
              <TableHead className="pl-3">{t.stats.date}</TableHead>
              {SERIES.map((s) => (
                <TableHead key={s.key} className="text-right">
                  {t.costs.sources[s.source]}
                </TableHead>
              ))}
              <TableHead className="pr-3 text-right">{t.costs.dailyTotal}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terpakai.map((row) => (
              <TableRow key={row.tanggal}>
                <TableCell className="pl-3 whitespace-nowrap">{f.date(row.tanggal)}</TableCell>
                {SERIES.map((s) => (
                  <TableCell key={s.key} className="text-right tabular-nums">
                    {formatUsdPrecise(row[s.key])}
                  </TableCell>
                ))}
                <TableCell className="pr-3 text-right font-medium tabular-nums">
                  {formatUsd(row.biaya_usd)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="sticky bottom-0">
            <TableRow>
              <TableCell className="pl-3 font-medium">
                {t.costs.daysWithCost(terpakai.length)}
              </TableCell>
              <TableCell colSpan={SERIES.length} />
              <TableCell className="pr-3 text-right font-medium tabular-nums">
                {formatUsd(total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {kosong > 0 ? (
        <p className="text-xs text-muted-foreground">{t.costs.daysHidden(kosong)}</p>
      ) : null}
    </div>
  )
}
