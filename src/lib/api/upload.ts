import { clearToken, readToken } from "@/lib/auth/token"

import { API_BASE_URL, ApiError, errorMessage, gagalTerhubung, type Schemas } from "./client"

export type UploadInput = {
  file: File
  judul: string
  unit: string
  tahun_berlaku?: number
  valid_until?: string
}

type UploadCallbacks = {
  /** 0..1 selama berkas terkirim. */
  onUploadProgress?: (fraction: number) => void
  /** Berkas sudah sampai; server mulai mengekstrak dan mengindeks. */
  onUploaded?: () => void
}

/**
 * Unggah dokumen (AD-3) lewat XMLHttpRequest, bukan fetch.
 *
 * fetch tidak melaporkan kemajuan unggahan. Tanpa itu admin hanya melihat
 * tombol berputar selama PDF puluhan megabita terkirim, lalu terus berputar
 * selama server memproses -- dan tidak bisa membedakan "masih mengirim" dari
 * "sedang diproses" dari "macet".
 */
export function uploadDocument(
  input: UploadInput,
  { onUploadProgress, onUploaded }: UploadCallbacks = {}
): Promise<Schemas["IngestionResult"]> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_BASE_URL}/api/admin/documents`)
    xhr.responseType = "json"

    const token = readToken()
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onUploadProgress?.(event.loaded / event.total)
    }
    xhr.upload.onload = () => onUploaded?.()

    xhr.onload = () => {
      if (xhr.status === 201) {
        resolve(xhr.response as Schemas["IngestionResult"])
        return
      }
      if (xhr.status === 401) clearToken()
      reject(new ApiError(xhr.status, errorMessage(xhr.status, xhr.response)))
    }
    xhr.onerror = () => reject(new ApiError(0, gagalTerhubung()))

    const form = new FormData()
    form.append("file", input.file)
    form.append("judul", input.judul)
    form.append("unit", input.unit)
    // Field opsional dikirim hanya bila diisi: string kosong ditolak validasi
    // bilangan/tanggal di server.
    if (input.tahun_berlaku !== undefined) form.append("tahun_berlaku", String(input.tahun_berlaku))
    if (input.valid_until) form.append("valid_until", input.valid_until)
    xhr.send(form)
  })
}
