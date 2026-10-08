"use client"

import { ChevronLeftIcon, ChevronRightIcon, WorkflowIcon } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"

import { EmptyState, QueryError } from "@/components/common"
import {
  END,
  edgeKey,
  PipelineDiagram,
  START,
  type EndStub,
  type NodeView,
} from "@/components/logs/pipeline-diagram"
import { durasi, kindLabel, nodeLabel, TurnStatus, useLogTime } from "@/components/logs/shared"
import { NodePanel, routeText } from "@/components/logs/trace-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  useLogSummary,
  useLogTrace,
  useLogTurn,
  useLogTurns,
  usePipelineGraph,
  type LogRange,
} from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"
import { cn } from "@/lib/utils"

type Graph = Schemas["PipelineGraph"]
type Turn = Schemas["TurnDetail"]
type Trace = Schemas["TurnTrace"]
type Summary = Schemas["LogSummary"]
type Format = ReturnType<typeof useFormat>

/** Nilai pemilih giliran untuk mode ringkasan (semua giliran sekaligus). */
export const RINGKASAN = "ringkasan"

/** Panjang pertanyaan di pemilih giliran sebelum dipotong. */
const POTONG_PERTANYAAN = 70

/**
 * Tab Graf: alur pipeline chat sebagai diagram, dengan input/output setiap
 * langkah dan panggilan di dalamnya (LLM, retriever, tool, JEV) dari rekaman
 * SQLite -- pengganti tampilan trace LangSmith (`logs.md` tahap 4).
 *
 * `turnId` null berarti giliran terbaru; `RINGKASAN` berarti angka agregat
 * rentang ini di setiap langkah.
 */
export function GraphTab({
  range,
  turnId,
  onTurnChange,
  onOpenTurn,
}: {
  range: LogRange
  turnId: string | null
  onTurnChange: (turnId: string) => void
  onOpenTurn: (turnId: string) => void
}) {
  const t = useT()
  const now = useNow()
  const waktu = useLogTime()
  const graph = usePipelineGraph()
  const daftar = useLogTurns({ range, limit: 50, offset: 0 })
  const items = useMemo(() => daftar.data?.items ?? [], [daftar.data])
  const ringkasan = turnId === RINGKASAN
  const aktif = ringkasan ? null : (turnId ?? items[0]?.turn_id ?? null)
  const turn = useLogTurn(aktif)
  const trace = useLogTrace(aktif && turn.data?.has_trace ? aktif : null)
  const summary = useLogSummary(range)

  const [nodePilih, setNodePilih] = useState<string | null>(null)
  // Ganti giliran: pilihan langkah kembali ke bawaan. Disetel saat render,
  // bukan di effect, supaya tidak ada satu render dengan langkah yang basi.
  const [aktifSebelum, setAktifSebelum] = useState(aktif)
  if (aktif !== aktifSebelum) {
    setAktifSebelum(aktif)
    setNodePilih(null)
  }

  if (graph.error) return <QueryError error={graph.error} onRetry={() => graph.refetch()} />
  if (daftar.error) return <QueryError error={daftar.error} onRetry={() => daftar.refetch()} />
  if (!graph.data || daftar.isLoading) return <Skeleton className="h-[36rem] rounded-xl" />
  if (items.length === 0 && !turnId) {
    return (
      <EmptyState icon={WorkflowIcon} title={t.logs.graph.empty} description={t.logs.graph.emptyBody} />
    )
  }

  const indeks = aktif ? items.findIndex((i) => i.turn_id === aktif) : -1
  const lebihBaru = indeks > 0 ? items[indeks - 1] : null
  const lebihLama = indeks >= 0 && indeks < items.length - 1 ? items[indeks + 1] : null
  // Giliran yang dibuka dari luar daftar (uji coba, giliran lama) tetap punya opsi.
  const diLuarDaftar = aktif && indeks < 0 && turn.data ? turn.data : null

  const labelOpsi = (i: {
    timestamp: string
    outcome?: string | null
    question?: string | null
    unit?: string | null
    endpoint: string
  }) => {
    const tanya = i.question
      ? i.question.length > POTONG_PERTANYAAN
        ? `${i.question.slice(0, POTONG_PERTANYAAN)}…`
        : i.question
      : (i.unit ?? "")
    const uji = i.endpoint === "uji_coba" ? ` · ${t.logs.turns.testBadge}` : ""
    return `${waktu.waktu(i.timestamp, now)} · ${kindLabel(t, i.outcome)}${uji}${tanya ? ` · ${tanya}` : ""}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={ringkasan ? RINGKASAN : (aktif ?? RINGKASAN)}
          onValueChange={(v) => onTurnChange(v)}
        >
          <SelectTrigger className="w-full sm:w-[32rem]" aria-label={t.logs.graph.picker}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RINGKASAN}>{t.logs.graph.summary}</SelectItem>
            {diLuarDaftar ? (
              <SelectItem value={diLuarDaftar.turn_id}>{labelOpsi(diLuarDaftar)}</SelectItem>
            ) : null}
            {items.map((i) => (
              <SelectItem key={i.turn_id} value={i.turn_id}>
                {labelOpsi(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={!lebihBaru}
            onClick={() => lebihBaru && onTurnChange(lebihBaru.turn_id)}
            aria-label={t.logs.graph.newer}
            title={t.logs.graph.newer}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!lebihLama}
            onClick={() => lebihLama && onTurnChange(lebihLama.turn_id)}
            aria-label={t.logs.graph.older}
            title={t.logs.graph.older}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      {ringkasan ? (
        <ModeRingkasan
          graph={graph.data}
          summary={summary.data}
          nodePilih={nodePilih}
          onSelect={setNodePilih}
        />
      ) : turn.error ? (
        <QueryError error={turn.error} onRetry={() => turn.refetch()} />
      ) : !turn.data ? (
        <Skeleton className="h-[36rem] rounded-xl" />
      ) : (
        <ModeGiliran
          graph={graph.data}
          turn={turn.data}
          trace={trace.data}
          traceMemuat={trace.isLoading}
          nodePilih={nodePilih}
          onSelect={setNodePilih}
          onOpenTurn={onOpenTurn}
        />
      )}
    </div>
  )
}

function ModeGiliran({
  graph,
  turn,
  trace,
  traceMemuat,
  nodePilih,
  onSelect,
  onOpenTurn,
}: {
  graph: Graph
  turn: Turn
  trace: Trace | undefined
  traceMemuat: boolean
  nodePilih: string | null
  onSelect: (id: string) => void
  onOpenTurn: (turnId: string) => void
}) {
  const t = useT()
  const f = useFormat()
  const { views, taken, stubs } = useMemo(
    () => tampilanGiliran(graph, turn, trace, t, f),
    [graph, turn, trace, t, f]
  )
  const jalan = new Map(turn.nodes.map((n) => [n.node, n]))
  const terpilih =
    nodePilih ?? (jalan.has("generate") ? "generate" : (turn.last_node ?? "sanitize"))
  const run = jalan.get(terpilih)
  const io = trace?.nodes.find((n) => n.node === terpilih)
  const calls = run ? (trace?.calls.filter((c) => c.position === run.position) ?? []) : []
  const rekaman = turn.has_trace ? (trace ? "ada" : traceMemuat ? "memuat" : "tidak-ada") : "tidak-ada"

  return (
    <div className="space-y-4">
      <InfoGiliran turn={turn} onOpenTurn={onOpenTurn} />
      <TataLetak
        diagram={
          <PipelineDiagram
            graph={graph}
            label={(id) => nodeLabel(t, id)}
            views={views}
            taken={taken}
            stubs={stubs}
            selected={terpilih}
            onSelect={onSelect}
            ariaLabel={t.logs.graph.diagram}
            startLabel={t.logs.graph.start}
            endLabel={t.logs.graph.end}
            groupLabel={(g) => labelKelompok(t, g)}
          />
        }
        panel={
          <NodePanel
            node={terpilih}
            run={run}
            io={io}
            calls={calls}
            rekaman={rekaman}
            routeLabel={routeText(t, io?.route, (id) => nodeLabel(t, id))}
          />
        }
      />
    </div>
  )
}

function ModeRingkasan({
  graph,
  summary,
  nodePilih,
  onSelect,
}: {
  graph: Graph
  summary: Summary | undefined
  nodePilih: string | null
  onSelect: (id: string) => void
}) {
  const t = useT()
  const f = useFormat()
  const { views, taken, stubs } = useMemo(
    () => tampilanRingkasan(graph, summary, t, f),
    [graph, summary, t, f]
  )
  const stat = nodePilih ? summary?.per_node.find((n) => n.node === nodePilih) : undefined

  return (
    <TataLetak
      diagram={
        <PipelineDiagram
          graph={graph}
          label={(id) => nodeLabel(t, id)}
          views={views}
          taken={taken}
          stubs={stubs}
          selected={nodePilih}
          onSelect={onSelect}
          ariaLabel={t.logs.graph.diagram}
          startLabel={t.logs.graph.start}
          endLabel={t.logs.graph.end}
          groupLabel={(g) => labelKelompok(t, g)}
        />
      }
      panel={
        <div className="space-y-3 text-sm">
          {nodePilih ? (
            <>
              <h3 className="text-base font-medium">
                {nodeLabel(t, nodePilih)}{" "}
                <code className="font-mono text-xs font-normal text-muted-foreground">{nodePilih}</code>
              </h3>
              <p>
                {stat
                  ? t.logs.graph.stats(
                      f.number(stat.count),
                      stat.p50_ms == null ? "—" : durasi(f, stat.p50_ms),
                      stat.p95_ms == null ? "—" : durasi(f, stat.p95_ms)
                    )
                  : t.logs.graph.skipped}
                {stat && stat.error > 0 ? ` ${t.logs.graph.statsErrors(f.number(stat.error))}` : ""}
              </p>
            </>
          ) : null}
          <p className="text-pretty text-muted-foreground">{t.logs.graph.summaryHint}</p>
        </div>
      }
    />
  )
}

function TataLetak({ diagram, panel }: { diagram: ReactNode; panel: ReactNode }) {
  const t = useT()
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
      {/* Sticky: panel prompt LLM bisa sepanjang beberapa layar, dan diagram
          tetap terlihat untuk berpindah langkah tanpa menggulung balik. */}
      <div className="space-y-3 self-start rounded-xl border bg-card p-4 lg:sticky lg:top-20">
        <div className="flex justify-center">{diagram}</div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <Legenda className="border-series-1 bg-series-1/15">{t.logs.graph.legend.ran}</Legenda>
          <Legenda className="border-status-critical bg-status-critical/15">
            {t.logs.graph.legend.error}
          </Legenda>
          <Legenda className="border-dashed border-border">{t.logs.graph.legend.skipped}</Legenda>
        </ul>
      </div>
      <div className="min-w-0 rounded-xl border bg-card p-4">{panel}</div>
    </div>
  )
}

function Legenda({ className, children }: { className: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden className={cn("inline-block size-3 rounded-[3px] border", className)} />
      {children}
    </li>
  )
}

function InfoGiliran({ turn, onOpenTurn }: { turn: Turn; onOpenTurn: (turnId: string) => void }) {
  const t = useT()
  const f = useFormat()
  const now = useNow()
  const waktu = useLogTime()
  const [jawabanPenuh, setJawabanPenuh] = useState(false)
  const jalur = t.logs.endpoint[turn.endpoint as keyof Dict["logs"]["endpoint"]] ?? turn.endpoint

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
        <span className="tabular-nums">{waktu.waktu(turn.timestamp, now)}</span>
        <span>{kindLabel(t, turn.outcome)}</span>
        <TurnStatus status={turn.status} />
        <span className="text-muted-foreground tabular-nums">
          {turn.total_ms == null ? "—" : durasi(f, turn.total_ms)}
        </span>
        {turn.endpoint === "uji_coba" ? (
          <Badge variant="secondary">{jalur}</Badge>
        ) : (
          <span className="text-muted-foreground">{jalur}</span>
        )}
        {turn.unit ? <span className="text-muted-foreground">{turn.unit}</span> : null}
        {turn.nim ? (
          <span className="text-muted-foreground">
            {t.logs.turn.nim} <span className="text-foreground tabular-nums">{turn.nim}</span>
          </span>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => onOpenTurn(turn.turn_id)}
        >
          {t.logs.graph.openDetail}
        </Button>
      </div>
      {turn.question ? (
        <p className="border-l-2 pl-3 text-sm text-pretty break-words">{turn.question}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{t.logs.turn.noText}</p>
      )}
      {turn.answer ? (
        <div className="space-y-1">
          <p
            className={cn(
              "text-sm whitespace-pre-wrap break-words text-muted-foreground",
              !jawabanPenuh && "line-clamp-3"
            )}
          >
            {turn.answer}
          </p>
          {turn.answer.length > 240 ? (
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
    </div>
  )
}

function labelKelompok(t: Dict, group: string): string {
  return t.logs.graph.group[group as keyof Dict["logs"]["graph"]["group"]] ?? group
}

// --- Keadaan diagram ---------------------------------------------------------

function stubKosong(graph: Graph): Record<string, EndStub> {
  const stubs: Record<string, EndStub> = {}
  for (const e of graph.edges) {
    if (e.target === END && e.conditional) stubs[e.source] = { taken: false }
  }
  return stubs
}

/** Pesan yang dihentikan gerbang JEV berakhir lewat `validate_context`: titik
    temu itu yang mengarahkannya ke `selesai`, walau penentunya JEV. */
function nodeKeluar(node: string): string {
  return node === "jev_gate" ? "validate_context" : node
}

function tampilanGiliran(graph: Graph, turn: Turn, trace: Trace | undefined, t: Dict, f: Format) {
  const jalan = new Map(turn.nodes.map((n) => [n.node, n]))
  const views: Record<string, NodeView> = {}
  for (const n of graph.nodes) {
    if (n.id === START || n.id === END) continue
    const r = jalan.get(n.id)
    views[n.id] = r
      ? { status: r.status === "error" ? "error" : "ok", sub: durasi(f, r.duration_ms) }
      : { status: "skipped", sub: t.logs.graph.skipped }
  }

  const stubs = stubKosong(graph)
  const taken = new Set<string>()
  const kelompok = new Map(graph.nodes.map((n) => [n.id, n.group ?? null]))
  const rute = new Map((trace?.nodes ?? []).map((n) => [n.node, n.route]))
  const selesai = turn.status === "ok"

  for (const e of graph.edges) {
    if (e.target === END && e.conditional) continue
    const r = rute.get(e.source)
    if (e.conditional && r !== undefined && r !== null) {
      // Rute dari rekaman: tepat seperti yang dipilih router. "cari" adalah
      // subgraph, jadi dicocokkan ke kelompok tujuan sisi itu.
      const tujuan = Array.isArray(r) ? r.map(String) : [String(r)]
      if (tujuan.some((x) => x === e.target || kelompok.get(e.target) === x)) {
        taken.add(edgeKey(e.source, e.target))
      }
      continue
    }
    const dari = e.source === START || jalan.has(e.source)
    const ke = e.target === END ? selesai : jalan.has(e.target)
    if (dari && ke) taken.add(edgeKey(e.source, e.target))
  }

  if (trace) {
    for (const [node, r] of rute) if (r === "selesai" && stubs[node]) stubs[node].taken = true
  } else if (selesai && turn.last_node && !["refuse", "generate"].includes(turn.last_node)) {
    const keluar = nodeKeluar(turn.last_node)
    if (stubs[keluar]) stubs[keluar].taken = true
  }
  return { views, taken, stubs }
}

function tampilanRingkasan(graph: Graph, summary: Summary | undefined, t: Dict, f: Format) {
  const per = new Map((summary?.per_node ?? []).map((n) => [n.node, n]))
  const views: Record<string, NodeView> = {}
  for (const n of graph.nodes) {
    if (n.id === START || n.id === END) continue
    const s = per.get(n.id)
    views[n.id] =
      s && s.count > 0
        ? {
            status: "idle",
            sub: t.logs.graph.runs(f.number(s.count), s.p50_ms == null ? "—" : durasi(f, s.p50_ms)),
          }
        : { status: "skipped", sub: t.logs.graph.skipped }
  }

  const stubs = stubKosong(graph)
  const keluarPerNode = new Map<string, number>()
  for (const keluar of summary?.exit_points ?? []) {
    const node = nodeKeluar(keluar.node)
    keluarPerNode.set(node, (keluarPerNode.get(node) ?? 0) + keluar.count)
  }
  for (const [node, jumlah] of keluarPerNode) {
    if (stubs[node] && jumlah > 0) {
      stubs[node] = { taken: true, sub: t.logs.graph.exits(f.number(jumlah)) }
    }
  }

  const berjalan = (id: string) => id === START || id === END || (per.get(id)?.count ?? 0) > 0
  const taken = new Set<string>()
  for (const e of graph.edges) {
    if (e.target === END && e.conditional) continue
    if (berjalan(e.source) && berjalan(e.target)) taken.add(edgeKey(e.source, e.target))
  }
  return { views, taken, stubs }
}
