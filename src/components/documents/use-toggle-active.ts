"use client"

import { toast } from "sonner"

import { useUpdateDocument } from "@/lib/api/queries"
import { isExpired, type Doc } from "@/lib/documents"

/** Aktifkan/nonaktifkan dengan satu klik. Dapat dibatalkan, jadi tanpa dialog konfirmasi. */
export function useToggleActive() {
  const update = useUpdateDocument()

  function toggle(doc: Doc, now: number) {
    const aktifkan = !doc.is_active
    update.mutate(
      { id: doc.id, body: { is_active: aktifkan } },
      {
        onSuccess: () =>
          toast.success(aktifkan ? "Dokumen diaktifkan" : "Dokumen dinonaktifkan", {
            description: aktifkan
              ? isExpired(doc, now)
                ? "Masa berlakunya sudah habis, jadi chatbot belum memakainya sampai tanggal berlaku diperbarui."
                : "Chatbot kembali memakai dokumen ini mulai pertanyaan berikutnya."
              : "Chatbot berhenti memakai dokumen ini mulai pertanyaan berikutnya. Potongannya tidak dihapus.",
            action: {
              label: "Batalkan",
              onClick: () => update.mutate({ id: doc.id, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error("Gagal menyimpan", { description: error.message }),
      }
    )
  }

  return { toggle, pendingId: update.isPending ? update.variables?.id : undefined }
}
