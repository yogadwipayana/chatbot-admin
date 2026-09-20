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
import { addDays, toDateInput } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"
import { cn } from "@/lib/utils"

type Item = Schemas["FeedbackItem"]
type Tab = "tidak" | "membantu" | "semua"

const PAGE_SIZE = 20

const PERIODE = ["7", "30", "90", "semua"] as const

/** Nilai `kind` yang belum dikenal kamus tetap ditampilkan apa adanya:
    lebih baik terbaca mentah daripada hilang dari daftar. */
function kindLabel(t: Dict, kind: string | null | undefined): string | null {
  if (!kind) return null
  return t.labels.kind[kind as Schemas["OutcomeKind"]] ?? kind
}

export function FeedbackView() {
  const t = useT()
  const f = useFormat()
  const periodeLabel = {
    "7": t.labels.periods.d7,
    "30": t.labels.periods.d30,
    "90": t.labels.periods.d90,
    semua: t.labels.periods.all,
  }
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
    return data ? ` (${f.number(n)})` : ""
  }

  return (
    <>
      <PageHeader
        title={t.feedback.title}
        description={t.feedback.description}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => ganti(() => setTab(v as Tab))}>
          <TabsList>
            <TabsTrigger value="tidak">
              {t.feedback.tabs.unhelpful}
              {jumlah(negatif)}
            </TabsTrigger>
            <TabsTrigger value="membantu">
              {t.feedback.tabs.helpful}
              {jumlah(positif)}
            </TabsTrigger>
            <TabsTrigger value="semua">
              {t.feedback.tabs.all}
              {jumlah(positif + negatif)}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={periode} onValueChange={(v) => ganti(() => setPeriode(v))}>
          <SelectTrigger className="w-full sm:w-48" aria-label={t.labels.periods.label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODE.map((p) => (
              <SelectItem key={p} value={p}>
                {periodeLabel[p]}
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
          title={tab === "tidak" ? t.feedback.emptyUnhelpful : t.feedback.empty}
          description={
            tab === "tidak" ? t.feedback.emptyUnhelpfulBody : t.feedback.emptyBody
          }
        />
      ) : (
        <div className={cn("space-y-3 transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground">
            {t.feedback.summary(f.number(positif + negatif))}
            {positif + negatif > 0
              ? t.feedback.summaryPositive(f.percent(positif / (positif + negatif)))
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
                {t.documents.range(
                  f.number(page * PAGE_SIZE + 1),
                  f.number(Math.min((page + 1) * PAGE_SIZE, total)),
                  f.number(total)
                )}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  {t.documents.previous}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= halamanTerakhir}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t.documents.next}
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}

          <p className="flex gap-2 pt-2 text-xs text-pretty text-muted-foreground">
            <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>{t.feedback.note}</span>
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
  const t = useT()
  const f = useFormat()
  const Icon = item.helpful ? ThumbsUpIcon : ThumbsDownIcon
  const jenis = kindLabel(t, item.kind)
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
        <span className="sr-only">
          {item.helpful ? t.feedback.helpful : t.feedback.unhelpful}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-medium break-words">
          {item.pertanyaan ? (
            `“${item.pertanyaan}”`
          ) : (
            <span className="text-muted-foreground">{t.feedback.questionGone}</span>
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
            {terbuka ? t.feedback.collapse : t.feedback.expand}
          </Button>
        ) : null}

        {item.catatan ? (
          <p className="rounded-md border-l-2 border-l-series-1 bg-muted/50 px-3 py-2 text-sm break-words">
            {item.catatan}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {f.relative(item.created_at, now)}
          {jenis ? ` · ${jenis}` : null}
          {item.top_score != null ? t.feedback.score(f.score(item.top_score)) : null}
        </p>
      </div>

      {item.pertanyaan ? (
        <div className="shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/uji-coba?q=${encodeURIComponent(item.pertanyaan)}`}>
              <FlaskConicalIcon data-icon="inline-start" />
              {t.labels.testQuery}
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
