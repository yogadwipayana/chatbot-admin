import { EyeOffIcon } from "lucide-react"

import { StatusLabel } from "@/components/status"
import { isExpired, type Doc } from "@/lib/documents"

export function DocumentStatus({ doc, now }: { doc: Doc; now: number }) {
  const expired = isExpired(doc, now)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {!doc.is_active ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <EyeOffIcon className="size-4" aria-hidden />
          Nonaktif
        </span>
      ) : expired ? (
        <StatusLabel level="serious">Kedaluwarsa</StatusLabel>
      ) : (
        <StatusLabel level="good">Dipakai chatbot</StatusLabel>
      )}
      {doc.is_active && doc.stale && !expired ? (
        <StatusLabel level="warning">Perlu ditinjau</StatusLabel>
      ) : null}
    </div>
  )
}
