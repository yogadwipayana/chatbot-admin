"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FlaskConicalIcon,
  InfoIcon,
  MessageSquareHeartIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import { useFeedback } from "@/lib/api/queries"
import {
  addDays,
  formatNumber,
  formatPercent,
  formatRelative,
  formatScore,
  toDateInput,
} from "@/lib/format"
import { KIND_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"

type Item = Schemas["FeedbackItem"]
type Tab = "tidak" | "membantu" | "semua"

const PAGE_SIZE = 20

const PERIODE = [
  { value: "7", label: "7 hari terakhir" },
  { value: "30", label: "30 hari terakhir" },
  { value: "90", label: "90 hari terakhir" },
  { value: "semua", label: "Semua waktu" },
] as const

function kindLabel(kind: string | null | undefined): string | null {
  if (!kind) return null
  return KIND_LABELS[kind as Schemas["OutcomeKind"]] ?? kind
}

export function FeedbackView() {
  const now = useNow()
  // Jempol ke bawah lebih dulu: itu yang menuntut tindakan, sama seperti AD-4.
  const [tab, setTab] = useState<Tab>("tidak")
  const [periode, setPeriode] = useState<string>("30")
  const [page, setPage] = useState(0)
  const [terbuka, setTerbuka] = useState<string | null>(null)

  const sejak =
    periode === "semua" ? undefined : toDateInput(addDays(new Date(now), -(Number(periode) - 1)))
  const query = useFeedback({
    helpful: tab === "semua" ? undefined : tab === "membantu",
    sejak,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })

  const data = query.data
  const total = data?.total ?? 0
  const positif = data?.jumlah_positif ?? 0
  const negatif = data?.jumlah_negatif ?? 0
  const halamanTerakhir = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  function ganti(ubah: () => void) {
    ubah()
    setPage(0)
  }

  /** Angka pada tab baru ditulis setelah datanya ada -- "(0)" saat memuat
      terbaca sebagai "tidak ada", padahal belum diketahui. */
  function jumlah(n: number): string {
    return data ? ` (${formatNumber(n)})` : ""
  }

  return (
    <>
      <PageHeader
        title="Umpan balik"
        description="Penilaian mahasiswa atas jawaban chatbot. Rasio kepuasan di Statistik memberi tahu ada yang salah; halaman ini memberi tahu apanya — pertanyaan yang memicunya, jawaban yang diberikan, dan catatan mahasiswa bila ada. Telusuri jawaban yang ditandai tidak membantu, lalu uji ulang setelah dokumennya diperbaiki."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => ganti(() => setTab(v as Tab))}>
          <TabsList>
            <TabsTrigger value="tidak">Tidak membantu{jumlah(negatif)}</TabsTrigger>
            <TabsTrigger value="membantu">Membantu{jumlah(positif)}</TabsTrigger>
            <TabsTrigger value="semua">Semua{jumlah(positif + negatif)}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={periode} onValueChange={(v) => ganti(() => setPeriode(v))}>
          <SelectTrigger className="w-full sm:w-48" aria-label="Periode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODE.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <ListSkeleton />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={MessageSquareHeartIcon}
          title={
            tab === "tidak"
              ? "Tidak ada jawaban yang ditandai tidak membantu"
              : "Belum ada umpan balik"
          }
          description={
            tab === "tidak"
              ? "Pada periode ini tidak ada mahasiswa yang menandai jawaban chatbot tidak membantu."
              : "Umpan balik dikirim mahasiswa dengan satu klik 👍/👎 di bawah jawaban chatbot. Belum ada yang masuk pada periode ini."
          }
        />
      ) : (
        <div className={cn("space-y-3 transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground">
            {formatNumber(positif + negatif)} umpan balik pada periode ini
            {positif + negatif > 0
              ? ` · ${formatPercent(positif / (positif + negatif))} menilai jawaban membantu`
              : null}
          </p>

          <ul className="divide-y rounded-xl border bg-card">
            {data?.items.map((item) => (
              <Baris
                key={item.id}
                item={item}
                now={now}
                terbuka={terbuka === item.id}
                onToggle={() => setTerbuka((id) => (id === item.id ? null : item.id))}
              />
            ))}
          </ul>

          {total > PAGE_SIZE ? (
            <div className="flex items-center justify-between gap-4 pt-1 text-sm text-muted-foreground">
              <span>
                {formatNumber(page * PAGE_SIZE + 1)}–
                {formatNumber(Math.min((page + 1) * PAGE_SIZE, total))} dari {formatNumber(total)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= halamanTerakhir}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}

          <p className="flex gap-2 pt-2 text-xs text-pretty text-muted-foreground">
            <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>
              Umpan balik dikirim satu klik tanpa kotak isian wajib, jadi sebagian besar tidak
              disertai catatan. Pertanyaan sensitif tidak pernah disimpan apa adanya: yang tampil
              adalah penanda tetap, dan jawabannya memang berupa pengalihan ke layanan konseling.
            </span>
          </p>
        </div>
      )}
    </>
  )
}

function Baris({
  item,
  now,
  terbuka,
  onToggle,
}: {
  item: Item
  now: number
  terbuka: boolean
  onToggle: () => void
}) {
  const Icon = item.helpful ? ThumbsUpIcon : ThumbsDownIcon
  const jenis = kindLabel(item.kind)
  // Jawaban pendek muat seluruhnya; tombol ringkas/panjang untuk itu hanya derau.
  const panjang = item.jawaban.length > 200

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          item.helpful ? "bg-status-good/10" : "bg-status-serious/10"
        )}
      >
        <Icon
          className={cn(
            "size-4",
            item.helpful ? "text-status-good" : "text-status-serious"
          )}
          aria-hidden
        />
        <span className="sr-only">{item.helpful ? "Membantu" : "Tidak membantu"}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-medium break-words">
          {item.pertanyaan ? (
            `“${item.pertanyaan}”`
          ) : (
            <span className="text-muted-foreground">Pertanyaannya sudah tidak ada di log</span>
          )}
        </p>

        <p
          className={cn(
            "text-sm break-words whitespace-pre-wrap text-muted-foreground",
            panjang && !terbuka && "line-clamp-3"
          )}
        >
          {item.jawaban}
        </p>
        {panjang ? (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={onToggle}
            aria-expanded={terbuka}
          >
            {terbuka ? "Ringkas jawaban" : "Lihat jawaban lengkap"}
          </Button>
        ) : null}

        {item.catatan ? (
          <p className="rounded-md border-l-2 border-l-series-1 bg-muted/50 px-3 py-2 text-sm break-words">
            {item.catatan}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {formatRelative(item.created_at, now)}
          {jenis ? ` · ${jenis}` : null}
          {item.top_score != null ? ` · Skor kemiripan ${formatScore(item.top_score)}` : null}
        </p>
      </div>

      {item.pertanyaan ? (
        <div className="shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/uji-coba?q=${encodeURIComponent(item.pertanyaan)}`}>
              <FlaskConicalIcon data-icon="inline-start" />
              Uji coba
            </Link>
          </Button>
        </div>
      ) : null}
    </li>
  )
}

function ListSkeleton() {
  return (
    <div className="divide-y rounded-xl border">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  )
}
