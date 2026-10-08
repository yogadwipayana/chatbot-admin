"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  RotateCwIcon,
  type LucideIcon,
} from "lucide-react"
import { useEffect } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
    if (judul) document.title = `${judul} · ${t.app.name}`
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
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-pretty text-muted-foreground">{description}</p>
        ) : null}
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
        "flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
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
 * Model kadang menulis penekanan Markdown: tebal (`**Rp675.000**`) dan kode
 * sebaris (`` `TRANSFER NomorVA NOMINAL` ``). Widget (`RichText` di
 * `client/src/components/chat/chat-message.tsx`) hanya menerjemahkan dua itu;
 * sisanya -- termasuk sitasi `[Judul, hal. 12]` -- tampil apa adanya. Admin
 * yang menelusuri keluhan harus melihat hal yang sama, bukan tanda bintang
 * atau backtick mentah. Pembungkusnya tetap `whitespace-pre-wrap` supaya baris
 * dan daftar bernomor tidak menyatu.
 */
export function RichText({ text }: { text: string }) {
  const bagian = text.split(/(\*\*[\s\S]+?\*\*|`[^`\n]+`)/g)
  return (
    <>
      {bagian.map((teks, index) =>
        index % 2 === 0 ? (
          teks
        ) : teks.startsWith("`") ? (
          <code key={index} className="rounded border bg-muted px-1 font-mono text-[0.9em]">
            {teks.slice(1, -1)}
          </code>
        ) : (
          <strong key={index}>
            <RichText text={teks.slice(2, -2)} />
          </strong>
        )
      )}
    </>
  )
}
