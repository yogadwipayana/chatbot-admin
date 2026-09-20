"use client"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteDocument, useUpdateDocument } from "@/lib/api/queries"
import type { Doc } from "@/lib/documents"
import { useFormat, useT } from "@/lib/i18n"

/**
 * Konfirmasi hapus permanen (PRD §9: semua aksi destruktif butuh konfirmasi).
 * Menawarkan "Nonaktifkan saja" sebagai jalan yang dapat dibatalkan.
 */
export function DeleteDocumentDialog({
  doc,
  onClose,
  onDeleted,
}: {
  doc: Doc | null
  onClose: () => void
  onDeleted?: () => void
}) {
  const t = useT()
  const f = useFormat()
  const remove = useDeleteDocument()
  const update = useUpdateDocument()
  const sibuk = remove.isPending || update.isPending

  function hapus() {
    if (!doc) return
    remove.mutate(doc.id, {
      onSuccess: () => {
        toast.success(t.deleteDocument.deleted, { description: doc.judul })
        onClose()
        onDeleted?.()
      },
      onError: (error) => toast.error(t.common.deleteFailed, { description: error.message }),
    })
  }

  function nonaktifkan() {
    if (!doc) return
    update.mutate(
      { id: doc.id, body: { is_active: false } },
      {
        onSuccess: () => {
          toast.success(t.deleteDocument.deactivated, {
            description: t.deleteDocument.deactivatedBody,
          })
          onClose()
        },
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <AlertDialog open={doc !== null} onOpenChange={(open) => !open && !sibuk && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteDocument.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteDocument.body(doc?.judul ?? "", f.number(doc?.jumlah_chunk ?? 0))}
            {doc?.is_active ? t.deleteDocument.suggestDeactivate : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={sibuk}>{t.common.cancel}</AlertDialogCancel>
          {doc?.is_active ? (
            <Button variant="outline" disabled={sibuk} onClick={nonaktifkan}>
              {t.deleteDocument.deactivateInstead}
            </Button>
          ) : null}
          <Button variant="destructive" disabled={sibuk} onClick={hapus}>
            {remove.isPending ? t.deleteDocument.deleting : t.documents.deletePermanently}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
