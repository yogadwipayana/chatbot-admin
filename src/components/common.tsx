"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  RotateCwIcon,
  type LucideIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Fragment, useEffect } from "react"

import { findNav } from "@/components/layout/nav"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { setDocumentTitle } from "@/lib/document-title"
import { useFormat, useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/**
 * Judul tab peramban.
 *
 * `export const metadata` di tiap `page.tsx` dibangkitkan di server, jadi ia
 * tidak dapat ikut bahasa yang tersimpan di peramban. Judulnya ditimpa dari
 * sini -- satu tempat, karena setiap halaman memakai `PageHeader`.
 */
function useDocumentTitle(judul: string | undefined) {
  const t = useT()
  useEffect(() => {
    if (judul) setDocumentTitle(`${judul} | ${t.app.name}`)
  }, [judul, t])
}

export function PageHeader({
  title,
  description,
  actions,
  documentTitle,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Untuk judul yang bukan teks biasa; bawaannya `title` bila ia sebuah string. */
  documentTitle?: string
}) {
  useDocumentTitle(documentTitle ?? (typeof title === "string" ? title : undefined))
  // Ikon menu yang sama dengan di sidebar, supaya halaman langsung dikenali.
  const Icon = findNav(usePathname())?.item.icon
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {Icon ? (
          <div aria-hidden className="icon-tile mt-0.5 hidden size-11 shadow-surface sm:flex">
            <Icon className="size-5" />
          </div>
        ) : null}
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-[1.625rem] leading-tight font-bold text-balance">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm/relaxed text-pretty text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function QueryError({
  error,
  onRetry,
  title,
}: {
  error: Error
  onRetry?: () => void
  title?: string
}) {
  const t = useT()
  return (
    <Alert variant="destructive">
      <AlertTitle>{title ?? t.common.loadFailed}</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            <RotateCwIcon data-icon="inline-start" />
            {t.common.retry}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-input/80 bg-card/50 px-6 py-14 text-center",
        className
      )}
    >
      <div className="icon-tile size-12 rounded-2xl shadow-surface">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="mx-auto max-w-md text-sm text-pretty text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

/**
 * Kartu angka utama (Statistik, Log). Ikon di pojok hanya penanda; arti
 * baik/buruk tetap dibawa `StatusLabel` di bawah angkanya.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string
  value: string
  icon?: LucideIcon
  children?: React.ReactNode
}) {
  return (
    <Card className="relative">
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <div aria-hidden className="icon-tile -mt-0.5 size-8 rounded-lg">
              <Icon className="size-4" />
            </div>
          ) : null}
        </div>
        <p className="text-[2rem] leading-none font-bold tracking-tight tabular-nums">{value}</p>
        {children ? <div className="space-y-1 pt-1 text-xs text-muted-foreground">{children}</div> : null}
      </CardContent>
    </Card>
  )
}

export function Spinner({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
      {label}
    </span>
  )
}

export function Pagination({
  page,
  total,
  pageSize,
  last,
  onPage,
}: {
  page: number
  total: number
  pageSize: number
  last: number
  onPage: (page: number) => void
}) {
  const t = useT()
  const f = useFormat()
  return (
    <div className="flex items-center justify-between gap-4 pt-1 text-sm text-muted-foreground">
      <span>
        {t.documents.range(
          f.number(page * pageSize + 1),
          f.number(Math.min((page + 1) * pageSize, total)),
          f.number(total)
        )}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
          <ChevronLeftIcon data-icon="inline-start" />
          {t.documents.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= last}
          onClick={() => onPage(page + 1)}
        >
          {t.documents.next}
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Jawaban chatbot, ditampilkan sama seperti yang dibaca mahasiswa di widget.
 *
 * Model kadang menulis penekanan Markdown: tebal (`**Rp675.000**`), miring
 * (`*Artificial Intelligence*`), dan kode sebaris
 * (`` `TRANSFER NomorVA NOMINAL` ``). Widget hanya menerjemahkan tiga itu;
 * sisanya -- termasuk sitasi `[Judul, hal. 12]` -- tampil apa adanya. Admin
 * yang menelusuri keluhan harus melihat hal yang sama, bukan tanda bintang
 * atau backtick mentah. Pembungkusnya tetap `whitespace-pre-wrap` supaya baris
 * dan daftar bernomor tidak menyatu.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {potongMarkdown(text).map(({ jenis, isi }, index) =>
        jenis === "teks" ? (
          <Fragment key={index}>{isi}</Fragment>
        ) : jenis === "kode" ? (
          <code key={index} className="rounded border bg-muted px-1 font-mono text-[0.9em]">
            {isi}
          </code>
        ) : jenis === "tebal" ? (
          <strong key={index}>
            <RichText text={isi} />
          </strong>
        ) : (
          <em key={index}>
            <RichText text={isi} />
          </em>
        )
      )}
    </>
  )
}

/**
 * Salinan `potongMarkdown` widget (`client/src/components/chat/markdown.ts`);
 * ubah keduanya bersamaan. Miring hanya di batas kata, satu baris, tanpa spasi
 * tepat di dalam bintang, jadi `2*3*4` dan butir `* teks` tetap apa adanya.
 */
const PENANDA_MARKDOWN =
  /\*\*\*[^\s*][^*\n]*?\*\*\*|\*\*[\s\S]+?\*\*|`[^`\n]+`|\*[^\s*](?:[^*\n]*?[^\s*])?\*(?![\w*])/g
const KARAKTER_KATA = /[\w*]/

type PotonganMarkdown = { jenis: "teks" | "tebal" | "kode" | "miring"; isi: string }

function potongMarkdown(text: string): PotonganMarkdown[] {
  const hasil: PotonganMarkdown[] = []
  let awal = 0
  for (const cocok of text.matchAll(PENANDA_MARKDOWN)) {
    const penanda = cocok[0]
    const posisi = cocok.index
    const jenis = penanda.startsWith("**") ? "tebal" : penanda.startsWith("`") ? "kode" : "miring"
    if (jenis === "miring" && posisi > 0 && KARAKTER_KATA.test(text[posisi - 1])) continue
    if (posisi > awal) hasil.push({ jenis: "teks", isi: text.slice(awal, posisi) })
    const lebar = jenis === "tebal" ? 2 : 1
    hasil.push({ jenis, isi: penanda.slice(lebar, -lebar) })
    awal = posisi + penanda.length
  }
  if (awal < text.length) hasil.push({ jenis: "teks", isi: text.slice(awal) })
  return hasil
}
