"use client"

import { LoaderCircleIcon, RotateCwIcon, type LucideIcon } from "lucide-react"
import { useEffect } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
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
