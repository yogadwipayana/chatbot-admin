"use client"

import { toast } from "sonner"

import { useUpdateDocument } from "@/lib/api/queries"
import { isExpired, type Doc } from "@/lib/documents"
import { useT } from "@/lib/i18n"

/** Aktifkan/nonaktifkan dengan satu klik. Dapat dibatalkan, jadi tanpa dialog konfirmasi. */
export function useToggleActive() {
  const t = useT()
  const update = useUpdateDocument()

  function toggle(doc: Doc, now: number) {
    const aktifkan = !doc.is_active
    const pesan = t.docStatus.toggle
    update.mutate(
      { id: doc.id, body: { is_active: aktifkan } },
      {
        onSuccess: () =>
          toast.success(aktifkan ? pesan.activated : pesan.deactivated, {
            description: aktifkan
              ? isExpired(doc, now)
                ? pesan.activatedExpired
                : pesan.activatedDetail
              : pesan.deactivatedDetail,
            action: {
              label: t.common.undo,
              onClick: () => update.mutate({ id: doc.id, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return { toggle, pendingId: update.isPending ? update.variables?.id : undefined }
}
