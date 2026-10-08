"use client"

import { useMemo } from "react"

import type { Schemas } from "@/lib/api/client"
import { cn } from "@/lib/utils"

type Graph = Schemas["PipelineGraph"]

export const START = "__start__"
export const END = "__end__"

/** Keadaan satu langkah di diagram. `idle` = mode ringkasan (tanpa giliran). */
export type NodeView = {
  status: "ok" | "error" | "skipped" | "idle"
  sub?: string
}

/** Cabang `selesai` ke END: digambar sebagai penanda pendek di kanan langkah. */
export type EndStub = { taken: boolean; sub?: string }

export function edgeKey(source: string, target: string): string {
  return `${source}->${target}`
}

const W = 168
const H = 46
const GAP_Y = 34
const GAP_X = 40
const TERMINAL_W = 76
const TERMINAL_H = 26
const STUB_GAP = 18
const STUB_W = 58
const STUB_H = 22
const PAD = 14
const GROUP_PAD = 10
const GROUP_LABEL = 16

type Pos = { x: number; y: number; w: number; h: number }

/**
 * Tata letak berlapis dari atas ke bawah. Lapisan = jalur terpanjang dari
 * START, jadi cabang paralel (gerbang JEV ∥ rewrite → retrieve) berdampingan
 * dan titik temunya (`validate_context`) turun di bawah keduanya. Posisi
 * mendatar = rata-rata induknya, lalu langkah selapis disebar di sekitarnya.
 *
 * Bentuk graf diambil dari API (LangGraph sendiri), bukan ditulis di sini,
 * supaya diagram tidak tertinggal saat node atau sisi berubah.
 */
function tataLetak(graph: Graph) {
  const urutan = new Map(graph.nodes.map((n, i) => [n.id, i]))
  const induk = new Map<string, string[]>()
  for (const n of graph.nodes) induk.set(n.id, [])
  for (const e of graph.edges) induk.get(e.target)?.push(e.source)

  const lapisan = new Map<string, number>()
  const hitung = (id: string, jejak: Set<string>): number => {
    const ada = lapisan.get(id)
    if (ada !== undefined) return ada
    if (jejak.has(id)) return 0 // siklus: tidak ada di graf ini, tetapi jangan macet
    jejak.add(id)
    const nilai = Math.max(-1, ...(induk.get(id) ?? []).map((p) => hitung(p, jejak))) + 1
    lapisan.set(id, nilai)
    return nilai
  }
  for (const n of graph.nodes) hitung(n.id, new Set())

  // Sisi bersyarat ke END tidak ikut menentukan posisi END: ia digambar sebagai
  // penanda pendek di samping langkahnya.
  const indukNyata = (id: string) =>
    graph.edges
      .filter((e) => e.target === id && !(id === END && e.conditional))
      .map((e) => e.source)

  const perLapisan = new Map<number, string[]>()
  for (const n of graph.nodes) {
    const l = lapisan.get(n.id) ?? 0
    perLapisan.set(l, [...(perLapisan.get(l) ?? []), n.id])
  }

  const group = new Map(graph.nodes.map((n) => [n.id, n.group ?? null]))
  const pos = new Map<string, Pos>()
  const tingkat = [...perLapisan.keys()].sort((a, b) => a - b)
  let y = 0
  for (const l of tingkat) {
    const ids = perLapisan.get(l) ?? []
    const ideal = (id: string) => {
      const xs = indukNyata(id)
        .map((p) => pos.get(p)?.x)
        .filter((x): x is number => x !== undefined)
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
    }
    // Langkah di dalam subgraph ke kanan, supaya kotak kelompoknya tidak
    // menimpa langkah lain selapis.
    const urut = [...ids].sort(
      (a, b) =>
        ideal(a) - ideal(b) ||
        Number(group.get(a) !== null) - Number(group.get(b) !== null) ||
        (urutan.get(a) ?? 0) - (urutan.get(b) ?? 0)
    )
    const tengah = urut.reduce((s, id) => s + ideal(id), 0) / urut.length
    const terminal = urut.every((id) => id === START || id === END)
    const tinggi = terminal ? TERMINAL_H : H
    urut.forEach((id, i) => {
      const x = tengah + (i - (urut.length - 1) / 2) * (W + GAP_X)
      const isTerminal = id === START || id === END
      pos.set(id, {
        x,
        y: y + tinggi / 2,
        w: isTerminal ? TERMINAL_W : W,
        h: isTerminal ? TERMINAL_H : H,
      })
    })
    y += tinggi + GAP_Y
  }
  return { pos, group }
}

function jalurSisi(a: Pos, b: Pos): string {
  const x1 = a.x
  const y1 = a.y + a.h / 2
  const x2 = b.x
  const y2 = b.y - b.h / 2 - 3
  const tengah = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${tengah}, ${x2} ${tengah}, ${x2} ${y2}`
}

export function PipelineDiagram({
  graph,
  label,
  views,
  taken,
  stubs,
  selected,
  onSelect,
  ariaLabel,
  startLabel,
  endLabel,
  groupLabel,
}: {
  graph: Graph
  label: (id: string) => string
  views: Record<string, NodeView>
  taken: Set<string>
  stubs: Record<string, EndStub>
  selected: string | null
  onSelect: (id: string) => void
  ariaLabel: string
  startLabel: string
  endLabel: string
  groupLabel: (group: string) => string
}) {
  const { pos, group } = useMemo(() => tataLetak(graph), [graph])

  const kelompok = useMemo(() => {
    const kotak = new Map<string, { x1: number; y1: number; x2: number; y2: number }>()
    for (const [id, g] of group) {
      const p = pos.get(id)
      if (!g || !p) continue
      const lama = kotak.get(g)
      const baru = {
        x1: p.x - p.w / 2 - GROUP_PAD,
        y1: p.y - p.h / 2 - GROUP_PAD,
        x2: p.x + p.w / 2 + GROUP_PAD,
        y2: p.y + p.h / 2 + GROUP_PAD + GROUP_LABEL,
      }
      kotak.set(
        g,
        lama
          ? {
              x1: Math.min(lama.x1, baru.x1),
              y1: Math.min(lama.y1, baru.y1),
              x2: Math.max(lama.x2, baru.x2),
              y2: Math.max(lama.y2, baru.y2),
            }
          : baru
      )
    }
    return kotak
  }, [group, pos])

  const semua = [...pos.values()]
  const adaStub = (id: string) => id in stubs
  const minX = Math.min(...semua.map((p) => p.x - p.w / 2), ...[...kelompok.values()].map((k) => k.x1))
  const maxX = Math.max(
    ...[...pos.entries()].map(([id, p]) => p.x + p.w / 2 + (adaStub(id) ? STUB_GAP + STUB_W : 0)),
    ...[...kelompok.values()].map((k) => k.x2)
  )
  const maxY = Math.max(...semua.map((p) => p.y + p.h / 2))
  const vb = `${minX - PAD} ${-PAD} ${maxX - minX + PAD * 2} ${maxY + PAD * 2}`

  const sisi = graph.edges.filter((e) => !(e.target === END && e.conditional))

  return (
    <svg
      viewBox={vb}
      role="group"
      aria-label={ariaLabel}
      className="h-auto w-full select-none"
      style={{ maxWidth: maxX - minX + PAD * 2 }}
    >
      <defs>
        <marker id="panah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" className="fill-muted-foreground/60" />
        </marker>
        <marker id="panah-aktif" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" className="fill-series-1" />
        </marker>
      </defs>

      {[...kelompok.entries()].map(([g, k]) => (
        <g key={g} aria-hidden>
          <rect
            x={k.x1}
            y={k.y1}
            width={k.x2 - k.x1}
            height={k.y2 - k.y1}
            rx={10}
            className="fill-muted/40 stroke-border"
            strokeDasharray="4 3"
          />
          {/* Pojok kanan bawah: sisi masuk datang dari atas dan sisi keluar
              berbelok ke titik temu di kiri bawah, jadi pojok ini selalu kosong. */}
          <text
            x={k.x2 - 8}
            y={k.y2 - 7}
            textAnchor="end"
            className="fill-muted-foreground text-[10px]"
          >
            {groupLabel(g)}
          </text>
        </g>
      ))}

      {sisi.map((e) => {
        const a = pos.get(e.source)
        const b = pos.get(e.target)
        if (!a || !b) return null
        const aktif = taken.has(edgeKey(e.source, e.target))
        return (
          <path
            key={edgeKey(e.source, e.target)}
            d={jalurSisi(a, b)}
            fill="none"
            aria-hidden
            className={aktif ? "stroke-series-1" : "stroke-muted-foreground/35"}
            strokeWidth={aktif ? 2 : 1.25}
            strokeDasharray={e.conditional && !aktif ? "4 3" : undefined}
            markerEnd={aktif ? "url(#panah-aktif)" : "url(#panah)"}
          />
        )
      })}

      {Object.entries(stubs).map(([id, stub]) => {
        const p = pos.get(id)
        if (!p) return null
        const x1 = p.x + p.w / 2
        const x2 = x1 + STUB_GAP
        return (
          <g key={`stub-${id}`} aria-hidden>
            <line
              x1={x1}
              y1={p.y}
              x2={x2 - 2}
              y2={p.y}
              className={stub.taken ? "stroke-series-1" : "stroke-muted-foreground/35"}
              strokeWidth={stub.taken ? 2 : 1.25}
              strokeDasharray={stub.taken ? undefined : "3 3"}
            />
            <rect
              x={x2}
              y={p.y - STUB_H / 2}
              width={STUB_W}
              height={STUB_H}
              rx={STUB_H / 2}
              className={cn(
                stub.taken ? "fill-series-1/15 stroke-series-1" : "fill-transparent stroke-border"
              )}
            />
            <text
              x={x2 + STUB_W / 2}
              y={p.y + 3.5}
              textAnchor="middle"
              className={cn(
                "text-[10px]",
                stub.taken ? "fill-foreground font-medium" : "fill-muted-foreground"
              )}
            >
              {stub.sub ? `${endLabel} ${stub.sub}` : endLabel}
            </text>
          </g>
        )
      })}

      {[...pos.entries()].map(([id, p]) => {
        if (id === START || id === END) {
          return (
            <g key={id} aria-hidden>
              <rect
                x={p.x - p.w / 2}
                y={p.y - p.h / 2}
                width={p.w}
                height={p.h}
                rx={p.h / 2}
                className="fill-muted stroke-border"
              />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {id === START ? startLabel : endLabel}
              </text>
            </g>
          )
        }
        const v = views[id] ?? { status: "skipped" }
        const pilih = selected === id
        const judul = label(id)
        return (
          <g
            key={id}
            role="button"
            tabIndex={0}
            aria-pressed={pilih}
            aria-label={v.sub ? `${judul}, ${v.sub}` : judul}
            className="group cursor-pointer outline-none"
            onClick={() => onSelect(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(id)
              }
            }}
          >
            <rect
              x={p.x - p.w / 2}
              y={p.y - p.h / 2}
              width={p.w}
              height={p.h}
              rx={8}
              strokeWidth={pilih ? 2.5 : 1.25}
              strokeDasharray={v.status === "skipped" ? "4 3" : undefined}
              className={cn(
                "transition-[stroke-width]",
                v.status === "ok" && "fill-series-1/12 stroke-series-1",
                v.status === "error" && "fill-status-critical/12 stroke-status-critical",
                v.status === "skipped" && "fill-card stroke-border",
                v.status === "idle" && "fill-card stroke-muted-foreground/50",
                pilih && "stroke-foreground",
                "group-focus-visible:stroke-ring group-focus-visible:[stroke-width:3]"
              )}
            />
            <text
              x={p.x}
              y={v.sub ? p.y - 3 : p.y + 4}
              textAnchor="middle"
              className={cn(
                "text-[12.5px] font-medium",
                v.status === "skipped" ? "fill-muted-foreground" : "fill-foreground"
              )}
            >
              {judul}
            </text>
            {v.sub ? (
              <text
                x={p.x}
                y={p.y + 13}
                textAnchor="middle"
                className={cn(
                  "text-[11px] tabular-nums",
                  v.status === "error" ? "fill-status-critical" : "fill-muted-foreground"
                )}
              >
                {v.sub}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
