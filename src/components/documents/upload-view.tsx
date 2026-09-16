"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeftIcon, FileTextIcon, LoaderCircleIcon, UploadIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useDocuments, useMe } from "@/lib/api/queries"
import { uploadDocument } from "@/lib/api/upload"
import { formatBytes, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

type Tahap =
  | { status: "diam" }
  | { status: "mengunggah"; progress: number }
  | { status: "memproses" }
  | { status: "gagal"; pesan: string }

function pdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

export function UploadView() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const unitListId = useId()

  const [file, setFile] = useState<File | null>(null)
  const [judul, setJudul] = useState("")
  const [unit, setUnit] = useState("")
  // Staf/dosen hanya boleh mengunggah untuk unitnya: kolom unit dikunci.
  // Server tetap menolak unit lain; ini supaya penolakan itu tidak pernah terjadi.
  const me = useMe().data
  const unitTerkunci = me?.role === "staf" ? (me.unit ?? "") : null
  const unitDipakai = unitTerkunci ?? unit
  const [tahun, setTahun] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [tahap, setTahap] = useState<Tahap>({ status: "diam" })
  const [menyeret, setMenyeret] = useState(false)

  // Saran nama unit dari dokumen yang sudah ada, supaya "Biro Akademik" dan
  // "Biro Administrasi Akademik" tidak menjadi dua unit berbeda.
  const semua = useDocuments({ include_inactive: true, only_stale: false, limit: 200, offset: 0 })
  const units = [...new Set(semua.data?.items.map((d) => d.unit) ?? [])].sort()

  const sibuk = tahap.status === "mengunggah" || tahap.status === "memproses"

  useEffect(() => {
    if (!sibuk) return
    const cegah = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", cegah)
    return () => window.removeEventListener("beforeunload", cegah)
  }, [sibuk])

  function pilih(berkas: File | undefined) {
    if (!berkas) return
    if (!pdf(berkas)) {
      setTahap({
        status: "gagal",
        pesan: `'${berkas.name}' bukan berkas PDF. Unggah dokumen dalam format PDF.`,
      })
      return
    }
    setFile(berkas)
    setTahap({ status: "diam" })
    if (!judul.trim()) setJudul(berkas.name.replace(/\.pdf$/i, "").replace(/[_]+/g, " ").trim())
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setMenyeret(false)
    if (!sibuk) pilih(event.dataTransfer.files[0])
  }

  async function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return
    setTahap({ status: "mengunggah", progress: 0 })
    try {
      const hasil = await uploadDocument(
        {
          file,
          judul: judul.trim(),
          unit: unitDipakai.trim(),
          tahun_berlaku: tahun ? Number(tahun) : undefined,
          valid_until: validUntil || undefined,
        },
        {
          onUploadProgress: (progress) => setTahap({ status: "mengunggah", progress }),
          onUploaded: () => setTahap({ status: "memproses" }),
        }
      )
      await queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Dokumen terpasang", {
        description: `${hasil.jumlah_halaman} halaman menjadi ${hasil.jumlah_chunk} potongan dan langsung dipakai chatbot.`,
      })
      router.push(`/dokumen/${hasil.document_id}?baru=1`)
    } catch (error) {
      setTahap({
        status: "gagal",
        pesan: error instanceof Error ? error.message : "Unggahan gagal.",
      })
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link href="/dokumen">
          <ArrowLeftIcon data-icon="inline-start" />
          Dokumen
        </Link>
      </Button>
      <PageHeader
        title="Unggah dokumen"
        description="Setelah diunggah, dokumen dibaca, dipecah menjadi potongan pendek, dan diindeks. Chatbot langsung memakainya untuk pertanyaan berikutnya."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={kirim} className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Berkas PDF</CardTitle>
            </CardHeader>
            <CardContent>
              {file ? (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <FileTextIcon className="size-8 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={sibuk}
                    onClick={() => setFile(null)}
                    aria-label="Ganti berkas"
                  >
                    <XIcon />
                  </Button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      inputRef.current?.click()
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setMenyeret(true)
                  }}
                  onDragLeave={() => setMenyeret(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                    menyeret && "border-primary bg-muted/50"
                  )}
                >
                  <UploadIcon className="size-6 text-muted-foreground" aria-hidden />
                  <p className="font-medium">Seret PDF ke sini, atau klik untuk memilih</p>
                  <p className="text-xs text-muted-foreground">
                    Hanya PDF digital. PDF hasil scan tanpa lapisan teks akan ditolak.
                  </p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  pilih(e.target.files?.[0])
                  e.target.value = ""
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi dokumen</CardTitle>
              <CardDescription>
                Judul ditampilkan apa adanya pada kartu sumber yang dilihat mahasiswa.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="judul">Judul resmi</Label>
                <Input
                  id="judul"
                  required
                  minLength={3}
                  maxLength={500}
                  placeholder="Panduan Akademik 2026"
                  value={judul}
                  disabled={sibuk}
                  onChange={(e) => setJudul(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="unit">Unit penerbit</Label>
                <Input
                  id="unit"
                  required
                  minLength={2}
                  maxLength={200}
                  list={unitListId}
                  placeholder="Biro Administrasi Akademik"
                  value={unitDipakai}
                  readOnly={unitTerkunci !== null}
                  disabled={sibuk}
                  onChange={(e) => setUnit(e.target.value)}
                />
                <datalist id={unitListId}>
                  {units.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
                {unitTerkunci !== null ? (
                  <p className="text-xs text-muted-foreground">
                    Akun Staf/Dosen hanya dapat mengunggah dokumen untuk unitnya sendiri.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun">
                  Tahun berlaku <span className="font-normal text-muted-foreground">(opsional)</span>
                </Label>
                <Input
                  id="tahun"
                  type="number"
                  inputMode="numeric"
                  min={2000}
                  max={2100}
                  placeholder="2026"
                  value={tahun}
                  disabled={sibuk}
                  onChange={(e) => setTahun(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid-until">
                  Berlaku sampai <span className="font-normal text-muted-foreground">(opsional)</span>
                </Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={validUntil}
                  disabled={sibuk}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <p className="text-xs text-pretty text-muted-foreground sm:col-span-2">
                Setelah tanggal berlaku, chatbot otomatis berhenti memakai dokumen ini, tanpa perlu
                ada yang ingat menonaktifkannya. Kosongkan bila dokumen berlaku tanpa batas.
              </p>
            </CardContent>
          </Card>

          {tahap.status === "gagal" ? (
            <Alert variant="destructive">
              <AlertTitle>Dokumen tidak dapat dipasang</AlertTitle>
              <AlertDescription>{tahap.pesan}</AlertDescription>
            </Alert>
          ) : null}

          {tahap.status === "mengunggah" ? (
            <div className="space-y-2" aria-live="polite">
              <div className="flex justify-between text-sm">
                <span>Mengunggah berkas…</span>
                <span className="tabular-nums">{formatPercent(tahap.progress, 0)}</span>
              </div>
              <Progress value={tahap.progress * 100} />
            </div>
          ) : null}

          {tahap.status === "memproses" ? (
            <Alert aria-live="polite">
              <LoaderCircleIcon className="animate-spin" />
              <AlertTitle>Dokumen sedang diproses</AlertTitle>
              <AlertDescription>
                Membaca teks, memecah per halaman, dan mengindeks. Dokumen tebal bisa memakan waktu
                beberapa menit. Jangan tutup halaman ini.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/dokumen" aria-disabled={sibuk}>
                Batal
              </Link>
            </Button>
            <Button type="submit" disabled={!file || sibuk}>
              {sibuk ? "Memproses…" : "Unggah dan pasang"}
            </Button>
          </div>
        </form>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Sebelum mengunggah</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-3 pl-4 text-sm text-pretty text-muted-foreground">
              <li>
                Pakai <span className="text-foreground">PDF versi digital asli</span>, bukan hasil
                scan. PDF scan terlihat terpasang tetapi isinya tidak pernah bisa ditemukan.
              </li>
              <li>
                Tulis judul <span className="text-foreground">persis seperti dokumen resmi</span>,
                karena mahasiswa memakainya untuk memeriksa sumber jawaban.
              </li>
              <li>
                Mengganti dokumen lama? Unggah versi baru, lalu{" "}
                <span className="text-foreground">nonaktifkan versi lama</span> supaya dua aturan
                yang berbeda tidak dipakai bersamaan.
              </li>
              <li>
                Setelah terpasang, periksa pratinjau potongan: tabel atau daftar bernomor yang
                terpotong di tengah sering membuat jawaban tidak lengkap.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
