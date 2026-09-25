"use client"

import { ChevronDownIcon, ScrollTextIcon, SearchIcon, ShieldIcon, TriangleAlertIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { EmptyState, QueryError } from "@/components/common"
import { LevelLabel, useLogTime } from "@/components/logs/shared"
import { Pagination } from "@/components/logs/turns-tab"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import { useAppLogs, useMe, type AppLogFilters, type LogRange } from "@/lib/api/queries"
import { useT } from "@/lib/i18n"
import { atLeast } from "@/lib/roles"
import { cn } from "@/lib/utils"

type AppLog = Schemas["AppLogOut"]

const PAGE_SIZE = 50
const SEMUA = "semua"
const AUDIT = "app.audit"
const LEVELS = ["INFO", "WARNING", "ERROR"] as const
/** Jeda sebelum kata kunci dikirim, supaya satu kata tidak menjadi tujuh permintaan. */
const JEDA_CARI_MS = 300

export function AppLogsTab({
  range,
  onOpenTurn,
}: {
  range: LogRange
  onOpenTurn: (turnId: string) => void
}) {
  const t = useT()
  const me = useMe().data
  // Hanya menentukan tombol yang tampil. Penyaringannya di API: role admin
  // tidak pernah menerima baris audit, apa pun yang diminta dari sini.
  const bolehAudit = atLeast(me, "superadmin")
  const [level, setLevel] = useState<AppLogFilters["level"]>("INFO")
  const [logger, setLogger] = useState<string>(SEMUA)
  const [ketik, setKetik] = useState("")
  const [cari, setCari] = useState("")
  const [page, setPage] = useState(0)
  const [terbuka, setTerbuka] = useState<number | null>(null)

  // Ganti rentang: filter tetap, halaman kembali ke awal. Disetel saat render,
  // bukan di effect, supaya tidak ada satu render dengan offset yang basi.
  const [rangeSebelum, setRangeSebelum] = useState(range)
  if (range !== rangeSebelum) {
    setRangeSebelum(range)
    setPage(0)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setCari(ketik.trim())
      setPage(0)
    }, JEDA_CARI_MS)
    return () => clearTimeout(timer)
  }, [ketik])

  const query = useAppLogs({
    range,
    level,
    logger: logger === SEMUA ? undefined : logger,
    q: cari || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })
  const data = query.data
  const total = data?.total ?? 0
  const halamanTerakhir = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)
  // Logger yang sedang dipilih tetap ada di daftar meski rentang barunya tidak
  // memuatnya, supaya Select tidak kehilangan nilainya sendiri.
  const loggers = Array.from(
    new Set([...(data?.loggers ?? []), ...(logger === SEMUA ? [] : [logger])])
  ).sort()

  function ganti(ubah: () => void) {
    ubah()
    setPage(0)
    setTerbuka(null)
  }

  const galatSaja = level === "ERROR"
  const auditSaja = logger === AUDIT

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={ketik}
            onChange={(e) => setKetik(e.target.value)}
            placeholder={t.logs.app.search}
            aria-label={t.logs.app.search}
            maxLength={200}
            className="pl-8"
          />
        </div>
        <Select
          value={level}
          onValueChange={(v) => ganti(() => setLevel(v as AppLogFilters["level"]))}
        >
          <SelectTrigger className="w-full lg:w-40" aria-label={t.logs.app.level}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={logger} onValueChange={(v) => ganti(() => setLogger(v))}>
          <SelectTrigger className="w-full lg:w-64" aria-label={t.logs.app.logger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEMUA}>{t.logs.app.allLoggers}</SelectItem>
            {loggers.map((l) => (
              <SelectItem key={l} value={l}>
                <span className="font-mono text-xs">{l}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={galatSaja ? "secondary" : "outline"}
            size="sm"
            aria-pressed={galatSaja}
            onClick={() => ganti(() => setLevel(galatSaja ? "INFO" : "ERROR"))}
          >
            <TriangleAlertIcon data-icon="inline-start" />
            {t.logs.app.errorsOnly}
          </Button>
          {bolehAudit ? (
            <Button
              variant={auditSaja ? "secondary" : "outline"}
              size="sm"
              aria-pressed={auditSaja}
              title={t.logs.app.auditHint}
              onClick={() => ganti(() => setLogger(auditSaja ? SEMUA : AUDIT))}
            >
              <ShieldIcon data-icon="inline-start" />
              {t.logs.app.audit}
            </Button>
          ) : null}
        </div>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={ScrollTextIcon} title={t.logs.app.empty} description={t.logs.app.emptyBody} />
      ) : (
        <div className={cn("space-y-3 transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <ul className="divide-y rounded-xl border bg-card">
            {data.items.map((log) => (
              <LogRow
                key={log.id}
                log={log}
                terbuka={terbuka === log.id}
                onToggle={() => setTerbuka((id) => (id === log.id ? null : log.id))}
                onOpenTurn={onOpenTurn}
              />
            ))}
          </ul>
          {total > PAGE_SIZE ? (
            <Pagination
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              last={halamanTerakhir}
              onPage={(p) => {
                setPage(p)
                setTerbuka(null)
              }}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

function LogRow({
  log,
  terbuka,
  onToggle,
  onOpenTurn,
}: {
  log: AppLog
  terbuka: boolean
  onToggle: () => void
  onOpenTurn: (turnId: string) => void
}) {
  const t = useT()
  const now = useNow()
  const waktu = useLogTime()
  const idRincian = `log-${log.id}`

  return (
    <li>
      <button
        type="button"
        className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-1 p-3 text-left text-sm hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[7.5rem_6.5rem_minmax(0,14rem)_1fr_auto]"
        onClick={onToggle}
        aria-expanded={terbuka}
        aria-controls={idRincian}
      >
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {waktu.waktu(log.waktu, now)}
        </span>
        <span className="sm:order-none">
          <LevelLabel level={log.level} />
        </span>
        <ChevronDownIcon
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform sm:order-last",
            terbuka && "rotate-180"
          )}
          aria-label={terbuka ? t.logs.app.collapse : t.logs.app.expand}
        />
        <code className="col-span-3 truncate font-mono text-xs text-muted-foreground sm:col-span-1 sm:pt-0.5">
          {log.logger}
        </code>
        <span className={cn("col-span-3 min-w-0 break-words sm:col-span-1", !terbuka && "line-clamp-2")}>
          {log.pesan}
        </span>
      </button>

      {terbuka ? (
        <div id={idRincian} className="space-y-3 border-t bg-muted/30 px-3 py-3 text-sm">
          <p className="text-xs text-muted-foreground">
            {t.logs.app.location}: <code className="font-mono text-foreground">{log.lokasi ?? "—"}</code>
            {" · "}
            {waktu.lengkap(log.waktu)}
          </p>
          {log.traceback ? (
            <div className="space-y-1">
              <p className="text-xs font-medium">{t.logs.app.traceback}</p>
              <pre className="max-h-72 overflow-auto rounded-lg border bg-background p-3 font-mono text-xs">
                {log.traceback}
              </pre>
            </div>
          ) : null}
          {log.turn_id ? (
            <Button variant="outline" size="sm" onClick={() => onOpenTurn(log.turn_id!)}>
              {t.logs.app.openTurn}
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
