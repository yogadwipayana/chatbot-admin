"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Schemas } from "@/lib/api/client"
import { formatDate, formatShortDate, formatUsd } from "@/lib/format"

type Costs = Schemas["Costs"]

const dailyConfig = {
  biaya_llm_usd: { label: "LLM chat", color: "var(--series-1)" },
  biaya_embedding_usd: { label: "Embedding pertanyaan", color: "var(--series-2)" },
  biaya_ingestion_usd: { label: "Ingestion & reindex", color: "var(--series-3)" },
} satisfies ChartConfig

const sourceConfig = {
  llm: { label: "LLM chat", color: "var(--series-1)" },
  embedding: { label: "Embedding pertanyaan", color: "var(--series-2)" },
  ingestion: { label: "Ingestion & reindex", color: "var(--series-3)" },
} satisfies ChartConfig

export function CostDailyChart({ data }: { data: Costs["biaya_harian"] }) {
  return (
    <ChartContainer config={dailyConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="tanggal"
          tickLine={false}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => formatShortDate(value)}
        />
        <YAxis
          width={48}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatUsd(value)}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const tanggal = payload?.[0]?.payload?.tanggal
                return typeof tanggal === "string" ? formatDate(tanggal) : null
              }}
              indicator="line"
              formatter={(value, name) => (
                <div className="flex min-w-32 items-center justify-between gap-3">
                  <span>{dailyConfig[String(name) as keyof typeof dailyConfig]?.label ?? name}</span>
                  <span className="font-mono font-medium tabular-nums">{formatUsd(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="biaya_llm_usd" stackId="biaya" fill="var(--color-biaya_llm_usd)" maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="biaya_embedding_usd" stackId="biaya" fill="var(--color-biaya_embedding_usd)" maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="biaya_ingestion_usd" stackId="biaya" fill="var(--color-biaya_ingestion_usd)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  )
}

export function CostSourceChart({ costs }: { costs: Costs }) {
  const data = [
    { name: "llm", value: costs.biaya_llm_usd },
    { name: "embedding", value: costs.biaya_embed_chat_usd },
    { name: "ingestion", value: costs.biaya_usage_log_usd },
  ].filter((item) => item.value > 0)

  if (!data.length) return <p className="py-20 text-center text-sm text-muted-foreground">Belum ada biaya tercatat.</p>

  return (
    <ChartContainer config={sourceConfig} className="mx-auto aspect-square h-64 w-full max-w-md">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent indicator="line" hideLabel formatter={(value, name) => <span>{sourceConfig[String(name) as keyof typeof sourceConfig]?.label ?? name}: {formatUsd(Number(value))}</span>} />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={2} strokeWidth={0} isAnimationActive={false}>
          {data.map((item) => <Cell key={item.name} fill={`var(--color-${item.name})`} />)}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
