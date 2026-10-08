"use client"

import { MessagesSquareIcon } from "lucide-react"
import { useState } from "react"

import { EmptyState, Pagination, QueryError } from "@/components/common"
import { durasi, kindLabel, nodeLabel, TurnStatus, useLogTime } from "@/components/logs/shared"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNow } from "@/hooks/use-now"
import {
  useLogTurns,
  type LogRange,
  type TurnEndpoint,
  type TurnFilters,
} from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 50
const SEMUA = "semua"
const HASIL = ["answer", "refusal", "support", "smalltalk", "rejected"] as const
const STATUS = ["ok", "error", "dibatalkan"] as const
const JALUR: readonly TurnEndpoint[] = ["chat_stream", "chat", "uji_coba"]

export function TurnsTab({
  range,
  onOpenTurn,
}: {
  range: LogRange
  onOpenTurn: (turnId: string) => void
}) {
  const t = useT()
  const f = useFormat()
  const now = useNow()
  const waktu = useLogTime()
  const [hasil, setHasil] = useState<string>(SEMUA)
  const [status, setStatus] = useState<string>(SEMUA)
  const [jalur, setJalur] = useState<string>(SEMUA)
  const [page, setPage] = useState(0)

  // Ganti rentang: filter tetap, halaman kembali ke awal. Disetel saat render,
  // bukan di effect, supaya tidak ada satu render dengan offset yang basi.
  const [rangeSebelum, setRangeSebelum] = useState(range)
  if (range !== rangeSebelum) {
    setRangeSebelum(range)
    setPage(0)
  }

  const query = useLogTurns({
    range,
    outcome: hasil === SEMUA ? undefined : hasil,
    status: status === SEMUA ? undefined : (status as TurnFilters["status"]),
    endpoint: jalur === SEMUA ? undefined : (jalur as TurnEndpoint),
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })
  const data = query.data
  const total = data?.total ?? 0
  const halamanTerakhir = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  function ganti(ubah: () => void) {
    ubah()
    setPage(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={hasil} onValueChange={(v) => ganti(() => setHasil(v))}>
          <SelectTrigger className="w-full sm:w-52" aria-label={t.logs.turns.resultFilter}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEMUA}>{t.logs.turns.allResults}</SelectItem>
            {HASIL.map((h) => (
              <SelectItem key={h} value={h}>
                {t.labels.kind[h]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => ganti(() => setStatus(v))}>
          <SelectTrigger className="w-full sm:w-44" aria-label={t.logs.turns.statusFilter}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEMUA}>{t.logs.turns.allStatuses}</SelectItem>
            {STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {t.logs.status[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={jalur} onValueChange={(v) => ganti(() => setJalur(v))}>
          <SelectTrigger className="w-full sm:w-48" aria-label={t.logs.turns.endpointFilter}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEMUA}>{t.logs.turns.allEndpoints}</SelectItem>
            {JALUR.map((j) => (
              <SelectItem key={j} value={j}>
                {t.logs.endpoint[j]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={MessagesSquareIcon}
          title={t.logs.turns.empty}
          description={t.logs.turns.emptyBody}
        />
      ) : (
        <div className={cn("space-y-3 transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-3">{t.logs.turns.columns.time}</TableHead>
                  <TableHead>{t.logs.turns.columns.question}</TableHead>
                  <TableHead>{t.logs.turns.columns.result}</TableHead>
                  <TableHead>{t.logs.turns.columns.stoppedAt}</TableHead>
                  <TableHead className="text-right">{t.logs.turns.columns.total}</TableHead>
                  <TableHead>{t.logs.turns.columns.unit}</TableHead>
                  <TableHead className="pr-3">{t.logs.turns.columns.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((turn) => (
                  <TableRow
                    key={turn.turn_id}
                    className="cursor-pointer"
                    onClick={() => onOpenTurn(turn.turn_id)}
                  >
                    <TableCell className="pl-3 whitespace-nowrap tabular-nums">
                      {/* Tombol sungguhan untuk keyboard dan pembaca layar; klik
                          di mana pun pada baris hanya jalan pintas tetikus. */}
                      <button
                        type="button"
                        className="rounded-sm underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenTurn(turn.turn_id)
                        }}
                        aria-label={`${t.logs.turns.open}: ${waktu.lengkap(turn.timestamp)}`}
                      >
                        {waktu.waktu(turn.timestamp, now)}
                      </button>
                    </TableCell>
                    <TableCell className="max-w-72">
                      <span className="flex min-w-0 items-center gap-2">
                        {turn.endpoint === "uji_coba" ? (
                          <Badge variant="secondary" className="shrink-0">
                            {t.logs.turns.testBadge}
                          </Badge>
                        ) : null}
                        <span
                          className={cn("truncate", !turn.question && "text-muted-foreground")}
                          title={turn.question ?? undefined}
                        >
                          {turn.question ?? "—"}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>{kindLabel(t, turn.outcome)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {nodeLabel(t, turn.last_node)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {turn.total_ms == null ? "—" : durasi(f, turn.total_ms)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{turn.unit ?? "—"}</TableCell>
                    <TableCell className="pr-3 whitespace-nowrap">
                      <TurnStatus status={turn.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {total > PAGE_SIZE ? (
            <Pagination
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              onPage={setPage}
              last={halamanTerakhir}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
