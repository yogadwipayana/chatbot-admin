"use client"

import { EyeOffIcon } from "lucide-react"

import { StatusLabel } from "@/components/status"
import { isExpired, type Doc } from "@/lib/documents"
import { useT } from "@/lib/i18n"

/** Dipakai juga oleh entri tanya jawab: statusnya ditentukan oleh kolom yang sama. */
export function DocumentStatus({
  doc,
  now,
}: {
  doc: Pick<Doc, "is_active" | "valid_until" | "stale">
  now: number
}) {
  const t = useT()
  const expired = isExpired(doc, now)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {!doc.is_active ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <EyeOffIcon className="size-4" aria-hidden />
          {t.docStatus.inactive}
        </span>
      ) : expired ? (
        <StatusLabel level="serious">{t.docStatus.expired}</StatusLabel>
      ) : (
        <StatusLabel level="good">{t.docStatus.served}</StatusLabel>
      )}
      {doc.is_active && doc.stale && !expired ? (
        <StatusLabel level="warning">{t.docStatus.needsReview}</StatusLabel>
      ) : null}
    </div>
  )
}
