"use client"

import { useState } from "react"

import { PageHeader } from "@/components/common"
import { AppLogsTab } from "@/components/logs/app-logs-tab"
import { PerformanceTab } from "@/components/logs/performance-tab"
import { TurnSheet } from "@/components/logs/turn-sheet"
import { TurnsTab } from "@/components/logs/turns-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LogRange } from "@/lib/api/queries"
import { useT } from "@/lib/i18n"

type Tab = "performa" | "giliran" | "aplikasi"

/**
 * Halaman Log (`logs.md`): dibaca dari SQLite log API, bukan dari Postgres.
 *
 * Rentangnya hanya 24 jam dan 7 hari -- log yang lebih tua sudah dihapus
 * (`LOG_RETENTION_DAYS`), jadi pemilih tanggal bebas hanya menawarkan hari kosong.
 * Panel rincian giliran dipegang di sini, bukan di tiap tab, karena dibuka dari
 * dua tempat: baris giliran dan baris log yang terjadi selama giliran itu.
 */
export function LogsView() {
  const t = useT()
  const [range, setRange] = useState<LogRange>("24h")
  const [tab, setTab] = useState<Tab>("performa")
  const [turnId, setTurnId] = useState<string | null>(null)

  return (
    <>
      <PageHeader title={t.logs.title} description={t.logs.description} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="performa">{t.logs.tabs.performance}</TabsTrigger>
            <TabsTrigger value="giliran">{t.logs.tabs.turns}</TabsTrigger>
            <TabsTrigger value="aplikasi">{t.logs.tabs.app}</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground md:inline">
              {t.logs.refreshNote}
            </span>
            <Tabs value={range} onValueChange={(v) => setRange(v as LogRange)}>
              <TabsList aria-label={t.logs.range.label}>
                <TabsTrigger value="24h">{t.logs.range.h24}</TabsTrigger>
                <TabsTrigger value="7d">{t.logs.range.d7}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <TabsContent value="performa">
          <PerformanceTab range={range} />
        </TabsContent>
        <TabsContent value="giliran">
          <TurnsTab range={range} onOpenTurn={setTurnId} />
        </TabsContent>
        <TabsContent value="aplikasi">
          <AppLogsTab range={range} onOpenTurn={setTurnId} />
        </TabsContent>
      </Tabs>

      <TurnSheet turnId={turnId} onOpenChange={(open) => !open && setTurnId(null)} />
    </>
  )
}
