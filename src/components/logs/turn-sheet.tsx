"use client"

import { InfoIcon, WorkflowIcon } from "lucide-react"
import { useState } from "react"

import { QueryError } from "@/components/common"
import {
  CopyValue,
  durasi,
  kindLabel,
  LevelLabel,
  NodeDetail,
  nodeLabel,
  TurnStatus,
  useLogTime,
} from "@/components/logs/shared"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import { ApiError } from "@/lib/api/client"
import { useLogTurn } from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"
import { cn } from "@/lib/utils"

type Turn = Schemas["TurnDetail"]

export function TurnSheet({
  turnId,
  onOpenChange,
  onOpenGraph,
}: {
  turnId: string | null
  onOpenChange: (open: boolean) => void
  onOpenGraph: (turnId: string) => void
}) {
  const t = useT()
  const turn = useLogTurn(turnId)

  return (
    <Sheet open={turnId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{t.logs.turn.title}</SheetTitle>
          <SheetDescription>{t.logs.turn.description}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {turn.error ? (
            turn.error instanceof ApiError && turn.error.status === 404 ? (
              <p className="text-sm text-muted-foreground">{t.logs.turn.notFound}</p>
            ) : (
              <QueryError error={turn.error} onRetry={() => turn.refetch()} />
            )
          ) : !turn.data ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          ) : (
            <TurnBody turn={turn.data} onOpenGraph={onOpenGraph} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function TurnBody({ turn, onOpenGraph }: { turn: Turn; onOpenGraph: (turnId: string) => void }) {
  const t = useT()
  const f = useFormat()
  const waktu = useLogTime()
  const now = useNow()
  const [jawabanPenuh, setJawabanPenuh] = useState(false)

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        {turn.question ? (
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground">{t.logs.turn.question}</h3>
            <p className="border-l-2 pl-3 text-sm break-words">{turn.question}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.logs.turn.noText}</p>
        )}
        {turn.answer ? (
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground">{t.logs.turn.answer}</h3>
            <p
              className={cn(
                "text-sm whitespace-pre-wrap break-words",
                !jawabanPenuh && "line-clamp-6"
              )}
            >
              {turn.answer}
            </p>
            {turn.answer.length > 400 ? (
              <button
                type="button"
                onClick={() => setJawabanPenuh((b) => !b)}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {jawabanPenuh ? t.logs.turn.showLess : t.logs.turn.showMore}
              </button>
            ) : null}
          </div>
        ) : null}
        <Button variant="outline" size="sm" onClick={() => onOpenGraph(turn.turn_id)}>
          <WorkflowIcon data-icon="inline-start" />
          {t.logs.turn.openGraph}
        </Button>
      </section>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">{t.logs.turns.columns.time}</dt>
        <dd>{waktu.waktu(turn.timestamp, now)}</dd>

        <dt className="text-muted-foreground">{t.logs.turns.columns.result}</dt>
        <dd className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{kindLabel(t, turn.outcome)}</span>
          <TurnStatus status={turn.status} />
        </dd>

        <dt className="text-muted-foreground">{t.logs.turn.total}</dt>
        <dd className="tabular-nums">{turn.total_ms == null ? "—" : durasi(f, turn.total_ms)}</dd>

        {turn.ttft_ms != null ? (
          <>
            <dt className="text-muted-foreground" title={t.logs.turn.ttftHint}>
              {t.logs.turn.ttft}
            </dt>
            <dd className="tabular-nums">{durasi(f, turn.ttft_ms)}</dd>
          </>
        ) : null}

        <dt className="text-muted-foreground">{t.logs.turn.endpoint}</dt>
        <dd>
          {t.logs.endpoint[turn.endpoint as keyof Dict["logs"]["endpoint"]] ?? turn.endpoint}
          {turn.unit ? <span className="text-muted-foreground"> · {turn.unit}</span> : null}
        </dd>

        {turn.nim ? (
          <>
            <dt className="text-muted-foreground">{t.logs.turn.nim}</dt>
            <dd className="tabular-nums">{turn.nim}</dd>
          </>
        ) : null}

        {turn.message_id ? (
          <>
            <dt className="text-muted-foreground">{t.logs.turn.messageId}</dt>
            <dd className="min-w-0">
              <CopyValue value={turn.message_id} />
            </dd>
          </>
        ) : null}

        <dt className="text-muted-foreground">{t.logs.turn.runId}</dt>
        <dd className="min-w-0">
          {turn.langsmith_run_id ? (
            <CopyValue value={turn.langsmith_run_id} />
          ) : (
            <span className="text-muted-foreground">{t.logs.turn.noTrace}</span>
          )}
        </dd>
      </dl>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">{t.logs.turn.steps}</h3>
        <Waterfall turn={turn} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">{t.logs.turn.logs}</h3>
        {turn.logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.logs.turn.noLogs}</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {turn.logs.map((log) => (
              <li key={log.id} className="space-y-1 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <LevelLabel level={log.level} />
                  <code className="font-mono text-xs text-muted-foreground">{log.logger}</code>
                </div>
                <p className="break-words">{log.message}</p>
                {log.traceback ? (
                  <pre className="max-h-48 overflow-auto rounded bg-muted p-2 font-mono text-xs">
                    {log.traceback}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {turn.message_id || turn.langsmith_run_id ? (
        <p className="flex gap-2 text-xs text-pretty text-muted-foreground">
          <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            {turn.message_id ? `${t.logs.turn.messageIdHint} ` : ""}
            {turn.langsmith_run_id ? t.logs.turn.runIdHint : ""}
          </span>
        </p>
      ) : null}
    </div>
  )
}

/**
 * Waterfall: posisi batang = kapan langkah mulai relatif terhadap awal giliran,
 * lebarnya = durasinya. Langkah yang hanya satu milidetik tetap diberi lebar
 * minimum supaya terlihat ada; angkanya selalu tertulis di sampingnya.
 */
function Waterfall({ turn }: { turn: Turn }) {
  const t = useT()
  const f = useFormat()
  const awal = new Date(turn.timestamp).getTime()
  const akhir = turn.nodes.reduce(
    (max, n) => Math.max(max, new Date(n.started_at).getTime() - awal + n.duration_ms),
    turn.total_ms ?? 0
  )
  const skala = akhir > 0 ? akhir : 1

  return (
    <ul className="space-y-2.5">
      {turn.nodes.map((n) => {
        const mulai = Math.max(0, new Date(n.started_at).getTime() - awal)
        const kiri = Math.min((mulai / skala) * 100, 99.5)
        const lebar = Math.max((n.duration_ms / skala) * 100, 0.5)
        const gagal = n.status === "error"
        return (
          <li key={`${n.position}-${n.node}`} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={cn("truncate", gagal && "text-status-critical")}>
                {nodeLabel(t, n.node)}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {durasi(f, n.duration_ms)}
              </span>
            </div>
            <div className="relative h-2 rounded-[2px] bg-muted" aria-hidden>
              <div
                className={cn(
                  "absolute inset-y-0 rounded-[2px]",
                  gagal ? "bg-status-critical" : "bg-series-1"
                )}
                style={{ left: `${kiri}%`, width: `${Math.min(lebar, 100 - kiri)}%` }}
              />
            </div>
            <NodeDetail node={n} />
          </li>
        )
      })}
    </ul>
  )
}
