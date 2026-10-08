"use client"

import { CheckIcon, ChevronRightIcon, CopyIcon } from "lucide-react"
import { useState, type ReactNode } from "react"

import { durasi, nodeLabel, NodeDetail } from "@/components/logs/shared"
import { StatusLabel } from "@/components/status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Schemas } from "@/lib/api/client"
import { formatUsdPrecise } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"
import { cn } from "@/lib/utils"

type NodeRun = Schemas["NodeRunOut"]
type NodeTrace = Schemas["NodeTrace"]
type CallTrace = Schemas["CallTrace"]

/**
 * Panel kanan tab Graf: satu langkah dari giliran terpilih -- seperti panel
 * Input/Output run di LangSmith. `io` undefined berarti giliran ini tidak
 * direkam (LOG_NODE_IO mati atau giliran lama); waktunya tetap dari `run`.
 */
export function NodePanel({
  node,
  run,
  io,
  calls,
  rekaman,
  routeLabel,
}: {
  node: string
  run: NodeRun | undefined
  io: NodeTrace | undefined
  calls: CallTrace[]
  rekaman: "ada" | "memuat" | "tidak-ada"
  routeLabel: string | null
}) {
  const t = useT()
  const f = useFormat()
  const tabAwal = calls.length > 0 ? "calls" : "output"

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-base font-medium">
            {nodeLabel(t, node)}{" "}
            <code className="font-mono text-xs font-normal text-muted-foreground">{node}</code>
          </h3>
          {run ? (
            <span className="flex items-center gap-3 text-sm tabular-nums">
              <StatusLabel level={run.status === "error" ? "critical" : "good"}>
                {durasi(f, run.duration_ms)}
              </StatusLabel>
            </span>
          ) : null}
        </div>
        {routeLabel ? (
          <p className="text-sm text-muted-foreground">
            {t.logs.graph.next}: <span className="text-foreground">{routeLabel}</span>
          </p>
        ) : null}
        {run ? <NodeDetail node={run} /> : null}
      </div>

      {!run ? (
        <p className="text-sm text-muted-foreground">{t.logs.graph.notRun}</p>
      ) : rekaman === "tidak-ada" ? (
        <p className="text-sm text-pretty text-muted-foreground">{t.logs.graph.noTrace}</p>
      ) : rekaman === "memuat" ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      ) : (
        <Tabs key={`${node}-${tabAwal}`} defaultValue={tabAwal} className="gap-3">
          <TabsList>
            <TabsTrigger value="input">{t.logs.graph.tabs.input}</TabsTrigger>
            <TabsTrigger value="output">{t.logs.graph.tabs.output}</TabsTrigger>
            <TabsTrigger value="calls">
              {t.logs.graph.tabs.calls}
              <span className="ml-1 text-muted-foreground tabular-nums">{calls.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="input">
            <JsonBlock value={io?.input} />
          </TabsContent>
          <TabsContent value="output">
            {io?.output === null || io?.output === undefined ? (
              <p className="text-sm text-muted-foreground">{t.logs.graph.noOutput}</p>
            ) : (
              <JsonBlock value={io.output} />
            )}
          </TabsContent>
          <TabsContent value="calls">
            {calls.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.logs.graph.noCalls}</p>
            ) : (
              <CallTree calls={calls} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

/** Panggilan di dalam satu langkah, bertingkat menurut `parent_id`. */
function CallTree({ calls }: { calls: CallTrace[] }) {
  const ids = new Set(calls.map((c) => c.id))
  const anak = new Map<string | null, CallTrace[]>()
  for (const c of calls) {
    const induk = c.parent_id && ids.has(c.parent_id) ? c.parent_id : null
    anak.set(induk, [...(anak.get(induk) ?? []), c])
  }
  const tampil = (induk: string | null, tingkat: number): ReactNode =>
    (anak.get(induk) ?? []).map((c) => (
      <li key={c.id} className="space-y-2">
        <CallItem call={c} />
        {anak.has(c.id) ? (
          <ul className={cn("space-y-2 border-l pl-3", tingkat > 3 && "pl-1")}>
            {tampil(c.id, tingkat + 1)}
          </ul>
        ) : null}
      </li>
    ))
  return <ul className="space-y-2">{tampil(null, 0)}</ul>
}

function CallItem({ call }: { call: CallTrace }) {
  const t = useT()
  const f = useFormat()
  const [buka, setBuka] = useState(call.kind === "llm" || call.kind === "tool")
  const masuk = call.usage?.input_tokens
  const keluar = call.usage?.output_tokens
  const gagal = call.status === "error"

  return (
    <div className={cn("rounded-lg border", gagal && "border-status-critical/50")}>
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg p-2.5 text-left text-sm hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ChevronRightIcon
          aria-hidden
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", buka && "rotate-90")}
        />
        <Badge variant="secondary">{t.logs.graph.kind[call.kind]}</Badge>
        <span className="font-medium break-all">{call.name}</span>
        {call.model ? (
          <code className="font-mono text-xs text-muted-foreground">{call.model}</code>
        ) : null}
        <span className="ml-auto flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground tabular-nums">
          {typeof masuk === "number" && typeof keluar === "number" ? (
            <span>{t.logs.graph.tokens(f.number(masuk), f.number(keluar))}</span>
          ) : null}
          {call.cost_usd != null ? <span>{formatUsdPrecise(call.cost_usd)}</span> : null}
          {call.status === "berjalan" ? (
            <StatusLabel level="warning">{t.logs.graph.cutOff}</StatusLabel>
          ) : call.duration_ms != null ? (
            <span className={cn(gagal && "text-status-critical")}>{durasi(f, call.duration_ms)}</span>
          ) : null}
        </span>
      </button>
      {buka ? (
        <div className="space-y-3 border-t p-2.5">
          {call.error ? (
            <p className="text-xs break-words text-status-critical">{call.error}</p>
          ) : null}
          <Bagian judul={t.logs.graph.tabs.input}>
            <JsonBlock value={call.input} />
          </Bagian>
          <Bagian judul={t.logs.graph.tabs.output}>
            {call.output === null || call.output === undefined ? (
              <p className="text-sm text-muted-foreground">{t.logs.graph.noOutput}</p>
            ) : (
              <JsonBlock value={call.output} />
            )}
          </Bagian>
        </div>
      ) : null}
    </div>
  )
}

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-medium text-muted-foreground">{judul}</h4>
      {children}
    </section>
  )
}

/** Nilai beserta tombol salin JSON-nya. */
function JsonBlock({ value }: { value: unknown }) {
  return (
    <div className="relative min-w-0">
      <div className="absolute top-0 right-0">
        <CopyJson value={value} />
      </div>
      <div className="min-w-0 pr-9">
        <ValueView value={value} depth={0} />
      </div>
    </div>
  )
}

function CopyJson({ value }: { value: unknown }) {
  const t = useT()
  const [tersalin, setTersalin] = useState(false)
  async function salin() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
      setTersalin(true)
      setTimeout(() => setTersalin(false), 1500)
    } catch {
      // Clipboard ditolak (bukan HTTPS): isinya tetap dapat diseleksi manual.
    }
  }
  const label = tersalin ? t.logs.turn.copied : t.logs.graph.copyJson
  return (
    <Button variant="ghost" size="icon-sm" onClick={salin} aria-label={label} title={label}>
      {tersalin ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

// --- Penampil nilai -----------------------------------------------------------

type Pesan = {
  role: string
  content: unknown
  tool_calls?: { name?: string; args?: unknown; id?: string }[]
  tool_call_id?: string
}
type Dokumen = { page_content: string; metadata: Record<string, unknown> }

function isObjek(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}
function isPesan(v: unknown): v is Pesan {
  return isObjek(v) && typeof v.role === "string" && "content" in v
}
function isDokumen(v: unknown): v is Dokumen {
  return isObjek(v) && typeof v.page_content === "string" && isObjek(v.metadata)
}

const BATAS_TEKS = 1500

/**
 * Penampil nilai rekaman. Bentuk yang paling sering dibaca diberi tampilan
 * sendiri: pesan LLM (peran + isi, seperti LangSmith) dan dokumen hasil
 * retrieval (judul, halaman, skor). Sisanya pohon JSON yang dapat dilipat.
 */
function ValueView({ value, depth }: { value: unknown; depth: number }) {
  const t = useT()
  if (value === null || value === undefined) {
    return <span className="font-mono text-xs text-muted-foreground">null</span>
  }
  if (typeof value === "string") return <Teks teks={value} />
  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="font-mono text-xs">{String(value)}</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-xs text-muted-foreground">{t.logs.graph.empty_value}</span>
    }
    if (value.every(isPesan)) return <DaftarPesan pesan={value} />
    if (value.every(isDokumen)) return <DaftarDokumen dokumen={value} />
    return (
      <Lipat ringkas={t.logs.graph.items(String(value.length))} terbuka={depth < 2}>
        <ol className="space-y-1.5">
          {value.map((v, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
                {i}
              </span>
              <div className="min-w-0 flex-1">
                <ValueView value={v} depth={depth + 1} />
              </div>
            </li>
          ))}
        </ol>
      </Lipat>
    )
  }
  if (isPesan(value)) return <DaftarPesan pesan={[value]} />
  if (isDokumen(value)) return <DaftarDokumen dokumen={[value]} />
  if (isObjek(value)) {
    const entri = Object.entries(value)
    if (entri.length === 0) {
      return <span className="text-xs text-muted-foreground">{t.logs.graph.empty_value}</span>
    }
    const isi = (
      <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-3 gap-y-1.5">
        {entri.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="pt-px font-mono text-xs break-all text-muted-foreground">{k}</dt>
            <dd className="min-w-0">
              <ValueView value={v} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    )
    return depth === 0 ? (
      isi
    ) : (
      <Lipat ringkas={t.logs.graph.keys(String(entri.length))} terbuka={depth < 2}>
        {isi}
      </Lipat>
    )
  }
  return <span className="font-mono text-xs">{String(value)}</span>
}

function Lipat({
  ringkas,
  terbuka,
  children,
}: {
  ringkas: string
  terbuka: boolean
  children: ReactNode
}) {
  return (
    <details open={terbuka} className="group/lipat min-w-0">
      <summary className="cursor-pointer text-xs text-muted-foreground select-none hover:text-foreground">
        {ringkas}
      </summary>
      <div className="mt-1.5 min-w-0 border-l pl-3">{children}</div>
    </details>
  )
}

function Teks({ teks }: { teks: string }) {
  const t = useT()
  const [semua, setSemua] = useState(false)
  if (teks === "") {
    return <span className="font-mono text-xs text-muted-foreground">{'""'}</span>
  }
  const pendek = teks.length <= 120 && !teks.includes("\n")
  if (pendek) return <span className="text-sm break-words">{teks}</span>
  const potong = !semua && teks.length > BATAS_TEKS
  return (
    <div className="space-y-1">
      <pre className="max-h-[28rem] overflow-auto rounded-md bg-muted/60 p-2 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
        {potong ? `${teks.slice(0, BATAS_TEKS)}…` : teks}
      </pre>
      {teks.length > BATAS_TEKS ? (
        <button
          type="button"
          onClick={() => setSemua((s) => !s)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {semua ? t.logs.turn.showLess : `${t.logs.turn.showMore} (${teks.length})`}
        </button>
      ) : null}
    </div>
  )
}

const WARNA_PERAN: Record<string, string> = {
  system: "bg-muted text-muted-foreground",
  human: "bg-series-1/10 text-series-1",
  ai: "bg-series-3/10 text-series-3",
  AIMessageChunk: "bg-series-3/10 text-series-3",
  tool: "bg-series-2/10 text-series-2",
}

function DaftarPesan({ pesan }: { pesan: Pesan[] }) {
  return (
    <ol className="space-y-2">
      {pesan.map((p, i) => (
        <li key={i} className="space-y-1.5 rounded-md border p-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[11px] font-medium",
                WARNA_PERAN[p.role] ?? "bg-muted text-muted-foreground"
              )}
            >
              {p.role === "AIMessageChunk" ? "ai" : p.role}
            </span>
            {p.tool_call_id ? (
              <code className="font-mono text-[11px] text-muted-foreground">{p.tool_call_id}</code>
            ) : null}
          </div>
          {typeof p.content === "string" ? (
            p.content ? (
              <Teks teks={p.content} />
            ) : null
          ) : (
            <ValueView value={p.content} depth={1} />
          )}
          {p.tool_calls?.length ? (
            <ul className="space-y-1">
              {p.tool_calls.map((tc, j) => (
                <li key={tc.id ?? j} className="rounded bg-muted/60 p-1.5 font-mono text-xs break-words">
                  {tc.name}({JSON.stringify(tc.args)})
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

function DaftarDokumen({ dokumen }: { dokumen: Dokumen[] }) {
  const t = useT()
  const f = useFormat()
  return (
    <ol className="space-y-2">
      {dokumen.map((d, i) => {
        const m = d.metadata
        const judul = typeof m.judul === "string" ? m.judul : ""
        const skor = typeof m.rrf_score === "number" ? m.rrf_score : null
        return (
          <li key={i} className="space-y-1 rounded-md border p-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
              <span className="font-medium">{judul || "—"}</span>
              {typeof m.halaman === "number" && m.halaman > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {t.logs.graph.page} {m.halaman}
                </span>
              ) : null}
              {skor !== null ? (
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  RRF {f.score(skor)}
                </span>
              ) : null}
            </div>
            <Teks teks={d.page_content} />
            <Lipat ringkas="metadata" terbuka={false}>
              <ValueView value={m} depth={0} />
            </Lipat>
          </li>
        )
      })}
    </ol>
  )
}

export function routeText(
  t: Dict,
  route: unknown,
  nama: (id: string) => string
): string | null {
  if (route === null || route === undefined) return null
  if (route === "selesai") return t.logs.graph.end
  if (typeof route === "string") return nama(route)
  if (Array.isArray(route)) {
    return `${route.map((r) => nama(String(r))).join(" + ")} (${t.logs.graph.parallel})`
  }
  return null
}
