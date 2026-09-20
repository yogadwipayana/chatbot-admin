"use client"

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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Schemas } from "@/lib/api/client"
import { useFormat, useT } from "@/lib/i18n"

type Point = Schemas["DailyVolume"]

function useConfig(): ChartConfig {
  const t = useT()
  return { jumlah: { label: t.stats.volumeSeries, color: "var(--series-1)" } }
}

/**
 * Satu seri, jadi tanpa legenda: judul kartu sudah menyebut isinya.
 * Batang maksimal 24px dengan ujung data membulat 4px dan pangkal rata.
 */
export function DailyVolumeChart({ data }: { data: Point[] }) {
  const f = useFormat()
  const config = useConfig()
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
        <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) => {
                const tanggal = payload?.[0]?.payload?.tanggal
                return typeof tanggal === "string" ? f.date(tanggal) : null
              }}
            />
          }
        />
        {/* Tanpa animasi masuk. Setiap ganti rentang tanggal, animasi menumbuhkan
            ulang semua batang dari nol -- padahal saat memuat ulang grafik harus
            menahan tampilan sebelumnya. Dengan animasi aktif, batang juga terbukti
            tidak tergambar pada tangkapan layar Chrome headless meski ukurannya
            di DOM sudah final. */}
        <Bar
          dataKey="jumlah"
          fill="var(--color-jumlah)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  )
}

/** Kembaran tabel grafik: setiap nilai terbaca tanpa hover dan tanpa warna. */
export function DailyVolumeTable({ data }: { data: Point[] }) {
  const t = useT()
  const f = useFormat()
  return (
    <div className="max-h-64 overflow-y-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-3">{t.stats.date}</TableHead>
            <TableHead className="pr-3 text-right">{t.stats.volumeSeries}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.tanggal}>
              <TableCell className="pl-3">{f.date(p.tanggal)}</TableCell>
              <TableCell className="pr-3 text-right tabular-nums">{f.number(p.jumlah)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
