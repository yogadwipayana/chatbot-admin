"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeftIcon, FileTextIcon, LoaderCircleIcon, UploadIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common"
import { DateField } from "@/components/date-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { UnitField } from "@/components/unit-field"
import { useMe, useUnits } from "@/lib/api/queries"
import { uploadDocument } from "@/lib/api/upload"
import { useNow } from "@/hooks/use-now"
import { useFormat, useT } from "@/lib/i18n"
import { toDateInput } from "@/lib/format"
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
  const t = useT()
  const f = useFormat()
  const router = useRouter()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const hariIni = toDateInput(new Date(useNow()))

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

  const units = useUnits()

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
      setTahap({ status: "gagal", pesan: t.upload.notPdf(berkas.name) })
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
      toast.success(t.upload.installed, {
        description: t.upload.installedBody(hasil.jumlah_halaman, hasil.jumlah_chunk),
      })
      // Kalimat lengkapnya dari server, ditampilkan selagi responsnya masih ada;
      // halaman detail hanya menerima penandanya (lihat `tipis` di URL).
      const peringatan = hasil.peringatan ?? []
      for (const pesan of peringatan)
        toast.warning(t.upload.thinWarning, {
          description: pesan,
          duration: 12000,
        })
      router.push(`/dokumen/${hasil.document_id}?baru=1${peringatan.length ? "&tipis=1" : ""}`)
    } catch (error) {
      setTahap({
        status: "gagal",
        pesan: error instanceof Error ? error.message : t.upload.failedGeneric,
      })
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link href="/dokumen">
          <ArrowLeftIcon data-icon="inline-start" />
          {t.upload.back}
        </Link>
      </Button>
      <PageHeader
        title={t.upload.title}
        description={t.upload.description}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={kirim} className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.upload.fileCard}</CardTitle>
            </CardHeader>
            <CardContent>
              {file ? (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <FileTextIcon className="size-8 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{f.bytes(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={sibuk}
                    onClick={() => setFile(null)}
                    aria-label={t.upload.replaceFile}
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
                  <p className="font-medium">{t.upload.dropzone}</p>
                  <p className="text-xs text-muted-foreground">{t.upload.dropzoneHint}</p>
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
              <CardTitle>{t.upload.infoCard}</CardTitle>
              <CardDescription>{t.upload.infoCardHint}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="judul">{t.upload.judul}</Label>
                <Input
                  id="judul"
                  required
                  minLength={3}
                  maxLength={500}
                  placeholder={t.upload.judulPlaceholder}
                  value={judul}
                  disabled={sibuk}
                  onChange={(e) => setJudul(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="unit">{t.upload.unit}</Label>
                <UnitField
                  id="unit"
                  required
                  units={units}
                  value={unitDipakai}
                  readOnly={unitTerkunci !== null}
                  disabled={sibuk}
                  onChange={setUnit}
                />
                {unitTerkunci !== null ? (
                  <p className="text-xs text-muted-foreground">{t.upload.unitLocked}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun">
                  {t.upload.tahun}{" "}
                  <span className="font-normal text-muted-foreground">{t.upload.optional}</span>
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
                  {t.upload.validUntil}{" "}
                  <span className="font-normal text-muted-foreground">{t.upload.optional}</span>
                </Label>
                <DateField
                  id="valid-until"
                  min={hariIni}
                  spanFrom={hariIni}
                  value={validUntil}
                  disabled={sibuk}
                  onChange={setValidUntil}
                  placeholder={t.upload.noExpiry}
                  clearLabel={t.upload.clearExpiry}
                />
              </div>
              <p className="text-xs text-pretty text-muted-foreground sm:col-span-2">
                {t.upload.expiryHint}
              </p>
            </CardContent>
          </Card>

          {tahap.status === "gagal" ? (
            <Alert variant="destructive">
              <AlertTitle>{t.upload.failedTitle}</AlertTitle>
              <AlertDescription>{tahap.pesan}</AlertDescription>
            </Alert>
          ) : null}

          {tahap.status === "mengunggah" ? (
            <div className="space-y-2" aria-live="polite">
              <div className="flex justify-between text-sm">
                <span>{t.upload.uploading}</span>
                <span className="tabular-nums">{f.percent(tahap.progress, 0)}</span>
              </div>
              <Progress value={tahap.progress * 100} />
            </div>
          ) : null}

          {tahap.status === "memproses" ? (
            <Alert aria-live="polite">
              <LoaderCircleIcon className="animate-spin" />
              <AlertTitle>{t.upload.processingTitle}</AlertTitle>
              <AlertDescription>{t.upload.processingBody}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/dokumen" aria-disabled={sibuk}>
                {t.common.cancel}
              </Link>
            </Button>
            <Button type="submit" disabled={!file || sibuk}>
              {sibuk ? t.upload.processing : t.upload.submit}
            </Button>
          </div>
        </form>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t.upload.checklistTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-3 pl-4 text-sm text-pretty text-muted-foreground">
              <li>
                {t.upload.checklist.digitalLead}
                <span className="text-foreground">{t.upload.checklist.digitalStrong}</span>
                {t.upload.checklist.digital}
              </li>
              <li>
                {t.upload.checklist.titleLead}
                <span className="text-foreground">{t.upload.checklist.titleStrong}</span>
                {t.upload.checklist.titleTail}
              </li>
              <li>
                {t.upload.checklist.replaceLead}
                <span className="text-foreground">{t.upload.checklist.replaceStrong}</span>
                {t.upload.checklist.replaceTail}
              </li>
              <li>{t.upload.checklist.preview}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
