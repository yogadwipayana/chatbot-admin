"use client"

import {
  FlaskConicalIcon,
  InfoIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  UndoIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { PageHeader, QueryError } from "@/components/common"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { Schemas } from "@/lib/api/client"
import {
  useResetRuntimeConfig,
  useRuntimeConfig,
  useUpdateRuntimeConfig,
} from "@/lib/api/queries"
import { formatDateTime } from "@/lib/format"

type Config = Schemas["RuntimeConfig"]
type Values = Schemas["RuntimeConfigValues"]
type Key = keyof Values
type Draft = Partial<Record<Key, string>>

type Field = {
  key: Key
  label: string
  help: string
  min: number
  max: number
  step: number
}

/**
 * Batas di sini harus sama dengan `RuntimeConfigUpdate` di `api/api.yaml`.
 * Yang menegakkan tetap server: ini hanya supaya isian yang jelas keliru
 * ketahuan sebelum dikirim, bukan setelah ditolak.
 */
const PENCARIAN: Field[] = [
  {
    key: "retrieval_candidates",
    label: "Kandidat per sumber",
    help: "Berapa potongan yang diambil pencarian makna dan pencarian kata sebelum digabungkan. Makin besar makin lengkap, tetapi makin lambat.",
    min: 1,
    max: 100,
    step: 1,
  },
  {
    key: "retrieval_top_n",
    label: "Potongan yang dibaca model",
    help: "Berapa potongan teratas yang dikirim ke model untuk menyusun jawaban. Tidak boleh melebihi kandidat per sumber.",
    min: 1,
    max: 50,
    step: 1,
  },
  {
    key: "rrf_weight_vector",
    label: "Bobot pencarian makna",
    help: "Pencocokan berdasarkan kemiripan arti kalimat. Isi 0 untuk mematikan sumber ini.",
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: "rrf_weight_fulltext",
    label: "Bobot pencarian kata",
    help: "Pencocokan kata persis; menolong untuk istilah, singkatan, dan nomor aturan. Isi 0 untuk mematikan sumber ini.",
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: "rrf_k",
    label: "Peredam peringkat",
    help: "Makin besar nilainya, makin kecil bedanya antara peringkat pertama dan peringkat kesepuluh saat kedua sumber digabungkan.",
    min: 1,
    max: 1000,
    step: 1,
  },
]

const AMBANG: Field[] = [
  {
    key: "vector_threshold",
    label: "Ambang kemiripan makna",
    help: "Di bawah nilai ini chatbot menolak menjawab dan mengarahkan mahasiswa ke unit terkait. Menaikkannya membuat chatbot lebih berhati-hati, menurunkannya membuatnya lebih berani menebak.",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "lexical_threshold",
    label: "Ambang kecocokan kata",
    help: "Kecocokan kata yang cukup kuat boleh lolos walaupun kemiripan maknanya lemah.",
    min: 0,
    max: 1,
    step: 0.01,
  },
]

const POTONGAN: Field[] = [
  {
    key: "chunk_size",
    label: "Panjang potongan maksimum",
    help: "Pagar atas panjang satu potongan. Batas yang sebenarnya mengikuti judul bagian di dalam dokumen; nilai ini hanya memotong bagian yang kepanjangan.",
    min: 200,
    max: 4000,
    step: 10,
  },
  {
    key: "chunk_overlap",
    label: "Tumpang tindih antar potongan",
    help: "Bagian akhir potongan yang diulang di potongan berikutnya, supaya kalimat yang terpotong tidak kehilangan konteks. Harus lebih kecil dari panjang potongan.",
    min: 0,
    max: 1000,
    step: 5,
  },
]

const SEMUA = [...PENCARIAN, ...AMBANG, ...POTONGAN]

export function ConfigView() {
  const config = useRuntimeConfig()
  const simpan = useUpdateRuntimeConfig()
  const kembalikan = useResetRuntimeConfig()
  const [draft, setDraft] = useState<Draft>({})
  const [konfirmasi, setKonfirmasi] = useState(false)

  const data = config.data
  const sibuk = simpan.isPending || kembalikan.isPending

  function nilai(key: Key): string {
    return draft[key] ?? (data ? String(data.nilai[key]) : "")
  }

  const berubah = data ? SEMUA.filter((f) => nilai(f.key) !== String(data.nilai[f.key])) : []
  const keluhan: Partial<Record<Key, string>> = data ? periksa(nilai) : {}
  const adaKeluhan = Object.keys(keluhan).length > 0

  function kirim() {
    if (!data || berubah.length === 0 || adaKeluhan) return
    const body = Object.fromEntries(
      berubah.map((f) => [f.key, Number(nilai(f.key))])
    ) as Schemas["RuntimeConfigUpdate"]
    simpan.mutate(body, {
      onSuccess: () => {
        setDraft({})
        toast.success("Konfigurasi disimpan", {
          description: "Berlaku untuk pertanyaan berikutnya, tanpa menjalankan ulang server.",
        })
      },
      onError: (error) => toast.error("Gagal menyimpan", { description: error.message }),
    })
  }

  function kembalikanSemua() {
    kembalikan.mutate(undefined, {
      onSuccess: () => {
        setDraft({})
        setKonfirmasi(false)
        toast.success("Semua setelan kembali ke nilai server")
      },
      onError: (error) => toast.error("Gagal mengembalikan", { description: error.message }),
    })
  }

  return (
    <>
      <PageHeader
        title="Konfigurasi"
        description="Setelan pencarian dokumen dan pemecahan dokumen yang dipakai chatbot. Perubahan langsung berlaku tanpa menjalankan ulang server, dan selalu dapat dikembalikan ke nilai yang tertulis di server."
        actions={
          data ? (
            <>
              <Button
                variant="outline"
                disabled={sibuk || data.diubah.length === 0}
                onClick={() => setKonfirmasi(true)}
              >
                <RotateCcwIcon data-icon="inline-start" />
                Kembalikan semua
              </Button>
              <Button disabled={sibuk || berubah.length === 0 || adaKeluhan} onClick={kirim}>
                {simpan.isPending
                  ? "Menyimpan…"
                  : berubah.length > 0
                    ? `Simpan ${berubah.length} perubahan`
                    : "Simpan perubahan"}
              </Button>
            </>
          ) : null
        }
      />

      {config.error ? (
        <QueryError error={config.error} onRetry={() => config.refetch()} />
      ) : !data ? (
        <Skeleton className="h-96 w-full max-w-3xl rounded-xl" />
      ) : (
        <div className="grid max-w-3xl gap-6">
          {data.peringatan ? (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Setelan tersimpan sedang tidak dipakai</AlertTitle>
              <AlertDescription>
                <p>
                  {data.peringatan} Sementara ini chatbot memakai nilai yang tertulis di server.
                  Perbaiki nilainya, atau kembalikan semua setelan.
                </p>
              </AlertDescription>
            </Alert>
          ) : null}

          <Kelompok
            judul="Pencarian dokumen"
            keterangan="Menentukan potongan dokumen mana yang dibaca model saat menyusun jawaban."
            fields={PENCARIAN}
            data={data}
            nilai={nilai}
            keluhan={keluhan}
            disabled={sibuk}
            onChange={(key, v) => setDraft((d) => ({ ...d, [key]: v }))}
          />

          <Kelompok
            judul="Ambang menjawab"
            keterangan="Batas “dokumennya cukup relevan atau tidak”. Di bawah ambang, chatbot menolak menjawab alih-alih menebak."
            fields={AMBANG}
            data={data}
            nilai={nilai}
            keluhan={keluhan}
            disabled={sibuk}
            onChange={(key, v) => setDraft((d) => ({ ...d, [key]: v }))}
            catatan={
              <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <FlaskConicalIcon className="size-4 shrink-0" aria-hidden />
                Setelah mengubah ambang, buktikan hasilnya di{" "}
                <Link href="/uji-coba" className="font-medium text-foreground underline">
                  Uji coba jawaban
                </Link>
                .
              </p>
            }
          />

          <Kelompok
            judul="Pemecahan dokumen"
            keterangan="Cara PDF dan entri tanya jawab dipecah menjadi potongan sebelum diindeks."
            fields={POTONGAN}
            data={data}
            nilai={nilai}
            keluhan={keluhan}
            disabled={sibuk}
            onChange={(key, v) => setDraft((d) => ({ ...d, [key]: v }))}
            catatan={
              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                Hanya berlaku untuk dokumen yang diproses setelah ini. Dokumen yang sudah ada
                baru mengikuti setelan baru bila diunggah ulang.
              </p>
            }
          />

          <ModelCard data={data} />

          {data.diperbarui_at ? (
            <p className="text-sm text-muted-foreground">
              Terakhir diubah {formatDateTime(data.diperbarui_at)}
              {data.diperbarui_oleh ? ` oleh ${data.diperbarui_oleh}` : ""}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Semua setelan masih mengikuti nilai yang tertulis di server.
            </p>
          )}
        </div>
      )}

      <AlertDialog open={konfirmasi} onOpenChange={(open) => !open && !sibuk && setKonfirmasi(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kembalikan semua setelan?</AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh nilai yang pernah diubah dari dashboard dihapus dan chatbot kembali memakai
              nilai yang tertulis di server. Penyetelan yang sudah dilakukan tidak dapat
              dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sibuk}>Batal</AlertDialogCancel>
            <Button variant="destructive" disabled={sibuk} onClick={kembalikanSemua}>
              {kembalikan.isPending ? "Mengembalikan…" : "Ya, kembalikan"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Kelompok({
  judul,
  keterangan,
  fields,
  data,
  nilai,
  keluhan,
  disabled,
  onChange,
  catatan,
}: {
  judul: string
  keterangan: string
  fields: Field[]
  data: Config
  nilai: (key: Key) => string
  keluhan: Partial<Record<Key, string>>
  disabled: boolean
  onChange: (key: Key, value: string) => void
  catatan?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{judul}</CardTitle>
        <CardDescription>{keterangan}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field) => (
          <Baris
            key={field.key}
            field={field}
            data={data}
            value={nilai(field.key)}
            keluhan={keluhan[field.key]}
            disabled={disabled}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
        {catatan}
      </CardContent>
    </Card>
  )
}

function Baris({
  field,
  data,
  value,
  keluhan,
  disabled,
  onChange,
}: {
  field: Field
  data: Config
  value: string
  keluhan?: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  const id = `konfigurasi-${field.key}`
  const nilaiServer = String(data.nilai_env[field.key])
  const ditimpa = data.diubah.includes(field.key)

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="flex flex-wrap items-center gap-2">
          {field.label}
          {ditimpa ? <Badge variant="secondary">Diubah</Badge> : null}
        </Label>
        <p className="text-sm text-pretty text-muted-foreground">{field.help}</p>
        {value !== nilaiServer ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 text-muted-foreground"
            disabled={disabled}
            onClick={() => onChange(nilaiServer)}
          >
            <UndoIcon data-icon="inline-start" />
            Nilai server: {nilaiServer}
          </Button>
        ) : null}
      </div>
      <div className="space-y-1 sm:w-32">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          className="tabular-nums"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          disabled={disabled}
          aria-invalid={keluhan ? true : undefined}
          aria-describedby={keluhan ? `${id}-galat` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {keluhan ? (
          <p id={`${id}-galat`} className="text-xs text-destructive">
            {keluhan}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function ModelCard({ data }: { data: Config }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model AI</CardTitle>
        <CardDescription>
          Hanya dapat diubah di berkas <code className="text-foreground">.env</code> server lalu
          menjalankan ulang API. Mengganti model penelusuran mengharuskan seluruh dokumen diproses
          ulang, jadi ia sengaja tidak dapat diubah dari dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Model penyusun jawaban</dt>
          <dd className="min-w-0 font-medium break-words">{data.chat_model}</dd>
          <dt className="text-muted-foreground">Model penelusuran</dt>
          <dd className="min-w-0 font-medium break-words">{data.embed_model}</dd>
          <dt className="text-muted-foreground">Endpoint</dt>
          <dd className="min-w-0 break-words">{data.base_url || "OpenAI resmi"}</dd>
          <dt className="text-muted-foreground">Kunci API</dt>
          <dd>
            {data.api_key_terisi ? (
              <Badge variant="outline">Terisi</Badge>
            ) : (
              <Badge variant="destructive">Belum diisi</Badge>
            )}
          </dd>
        </dl>
      </CardContent>
    </Card>
  )
}

/** Isian yang jelas keliru, sebelum dikirim. Server memeriksa ulang semuanya. */
function periksa(nilai: (key: Key) => string): Partial<Record<Key, string>> {
  const hasil: Partial<Record<Key, string>> = {}
  const angka = {} as Record<Key, number>

  for (const field of SEMUA) {
    const teks = nilai(field.key).trim()
    const n = Number(teks)
    if (teks === "" || Number.isNaN(n)) {
      hasil[field.key] = "Harus diisi angka."
      continue
    }
    if (n < field.min || n > field.max) {
      hasil[field.key] = `Isi antara ${field.min} dan ${field.max}.`
      continue
    }
    if (field.step === 1 && !Number.isInteger(n)) {
      hasil[field.key] = "Harus bilangan bulat."
      continue
    }
    angka[field.key] = n
  }

  if (
    angka.retrieval_top_n !== undefined &&
    angka.retrieval_candidates !== undefined &&
    angka.retrieval_top_n > angka.retrieval_candidates
  ) {
    hasil.retrieval_top_n = `Tidak boleh melebihi kandidat per sumber (${angka.retrieval_candidates}).`
  }
  if (
    angka.chunk_overlap !== undefined &&
    angka.chunk_size !== undefined &&
    angka.chunk_overlap >= angka.chunk_size
  ) {
    hasil.chunk_overlap = `Harus lebih kecil dari panjang potongan (${angka.chunk_size}).`
  }

  return hasil
}
