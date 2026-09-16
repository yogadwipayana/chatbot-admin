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
import { formatNumber } from "@/lib/format"

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
  const remove = useDeleteDocument()
  const update = useUpdateDocument()
  const sibuk = remove.isPending || update.isPending

  function hapus() {
    if (!doc) return
    remove.mutate(doc.id, {
      onSuccess: () => {
        toast.success("Dokumen dihapus", { description: doc.judul })
        onClose()
        onDeleted?.()
      },
      onError: (error) => toast.error("Gagal menghapus", { description: error.message }),
    })
  }

  function nonaktifkan() {
    if (!doc) return
    update.mutate(
      { id: doc.id, body: { is_active: false } },
      {
        onSuccess: () => {
          toast.success("Dokumen dinonaktifkan", {
            description: "Chatbot berhenti memakainya. Dokumen dapat diaktifkan kembali kapan saja.",
          })
          onClose()
        },
        onError: (error) => toast.error("Gagal menyimpan", { description: error.message }),
      }
    )
  }

  return (
    <AlertDialog open={doc !== null} onOpenChange={(open) => !open && !sibuk && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus dokumen secara permanen?</AlertDialogTitle>
          <AlertDialogDescription>
            “{doc?.judul}” beserta {formatNumber(doc?.jumlah_chunk ?? 0)} potongannya akan dihapus
            dan tidak dapat dikembalikan. Kartu sitasi pada percakapan lama yang menunjuk
            dokumen ini tidak akan bisa dibuka lagi.
            {doc?.is_active
              ? " Bila hanya ingin menghentikan pemakaiannya, pilih Nonaktifkan saja."
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={sibuk}>Batal</AlertDialogCancel>
          {doc?.is_active ? (
            <Button variant="outline" disabled={sibuk} onClick={nonaktifkan}>
              Nonaktifkan saja
            </Button>
          ) : null}
          <Button variant="destructive" disabled={sibuk} onClick={hapus}>
            {remove.isPending ? "Menghapus…" : "Hapus permanen"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
