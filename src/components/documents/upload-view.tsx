"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CopyIcon,
  FileTextIcon,
  LoaderCircleIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common"
import { DateField } from "@/components/date-field"
import { StatusLabel } from "@/components/status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { UnitField } from "@/components/unit-field"
import { ApiError, type Schemas } from "@/lib/api/client"
import { useMe, useUnits } from "@/lib/api/queries"
import { uploadDocument } from "@/lib/api/upload"
import { useNow } from "@/hooks/use-now"
import { useFormat, useT } from "@/lib/i18n"
import { toDateInput } from "@/lib/format"
import { cn } from "@/lib/utils"

type Hasil = Schemas["IngestionResult"]

type Tahap =
  | { status: "siap" }
  | { status: "mengunggah"; progress: number }
  | { status: "memproses" }
  | { status: "selesai"; hasil: Hasil }
  | { status: "gagal"; pesan: string }

/** Satu PDF di daftar unggah, beserta isian dokumennya sendiri. */
type Berkas = {
  id: number
  file: File
  judul: string
  unit: string
  tahun: string
  validUntil: string
  tahap: Tahap
}

type Isian = Partial<Pick<Berkas, "judul" | "unit" | "tahun" | "validUntil">>

function pdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

/** Berkas yang sama terpilih dua kali akan menjadi dua dokumen kembar. */
function sama(a: File, b: File) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
}

function judulDariNama(nama: string) {
  return nama.replace(/\.pdf$/i, "").replace(/[_]+/g, " ").trim()
}

function tautanDetail(hasil: Hasil) {
  // Kalimat peringatannya ditampilkan dari respons; halaman detail hanya
  // menerima penandanya.
  return `/dokumen/${hasil.document_id}?baru=1${hasil.warnings?.length ? "&tipis=1" : ""}`
}

export function UploadView() {
  const t = useT()
  const router = useRouter()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const nomor = useRef(0)
  const toastTerapkan = useRef<string | number | null>(null)
  // Antrean yang sedang berjalan berhenti bila halaman ditinggalkan lewat
  // navigasi di dalam dashboard (`beforeunload` tidak menangkapnya). Tanpa ini
  // sisa berkas terus terkirim tanpa ada yang melihat hasil atau galatnya.
  const terpasangDiLayar = useRef(true)
  const hariIni = toDateInput(new Date(useNow()))

  const [daftar, setDaftar] = useState<Berkas[]>([])
  const [ditolak, setDitolak] = useState<string[]>([])
  // Urutan berkas yang sedang dikirim dari seluruh antrean; null bila diam.
  const [giliran, setGiliran] = useState<{ ke: number; dari: number } | null>(null)
  const [menyeret, setMenyeret] = useState(false)

  // Staf/dosen hanya boleh mengunggah untuk unitnya: kolom unit dikunci.
  // Server tetap menolak unit lain; ini supaya penolakan itu tidak pernah terjadi.
  const me = useMe().data
  const unitTerkunci = me?.role === "staf" ? (me.unit ?? "") : null
  const units = useUnits()

  const sibuk = giliran !== null
  const antre = daftar.filter((b) => b.tahap.status !== "selesai")
  const adaSelesai = antre.length < daftar.length

  useEffect(() => {
    terpasangDiLayar.current = true
    return () => {
      terpasangDiLayar.current = false
    }
  }, [])

  useEffect(() => {
    if (!sibuk) return
    const cegah = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", cegah)
    return () => window.removeEventListener("beforeunload", cegah)
  }, [sibuk])

  function ubah(id: number, perubahan: Isian | { tahap: Tahap }) {
    setDaftar((lama) => lama.map((b) => (b.id === id ? { ...b, ...perubahan } : b)))
  }

  /** Nama resmi unit yang diketik, atau null bila belum cocok dengan daftar. */
  function unitResmi(ketikan: string) {
    const kunci = ketikan.trim().toLowerCase()
    return units.find((u) => u.toLowerCase() === kunci) ?? null
  }

  // Tawarkan hanya bila ada gunanya: unitnya sudah resmi (bukan sisa ketikan
  // penyaring) dan setidaknya satu berkas lain yang belum terpasang berbeda.
  function bisaTerapkanUnit(sumber: Berkas) {
    const unit = unitResmi(sumber.unit)
    return (
      unitTerkunci === null &&
      unit !== null &&
      antre.some((b) => b.id !== sumber.id && unitResmi(b.unit) !== unit)
    )
  }

  function terapkanUnit(sumber: Berkas) {
    const unit = unitResmi(sumber.unit)
    if (!unit) return
    // Satu klik menimpa unit yang mungkin sudah dipilih satu per satu, jadi
    // sediakan jalan kembali.
    const sebelumnya = new Map(antre.map((b) => [b.id, b.unit]))
    setDaftar((lama) =>
      lama.map((b) => (b.tahap.status === "selesai" ? b : { ...b, unit }))
    )
    toastTerapkan.current = toast.success(t.upload.unitApplied(unit, antre.length), {
      action: {
        label: t.upload.undoApply,
        onClick: () =>
          setDaftar((lama) =>
            lama.map((b) => {
              const unitLama = sebelumnya.get(b.id)
              return unitLama === undefined ? b : { ...b, unit: unitLama }
            })
          ),
      },
    })
  }

  function tambah(files: FileList | null | undefined) {
    if (!files || files.length === 0) return
    const baru: Berkas[] = []
    const tolak: string[] = []
    for (const file of Array.from(files)) {
      if (!pdf(file)) tolak.push(t.upload.notPdf(file.name))
      else if ([...daftar, ...baru].some((b) => sama(b.file, file)))
        tolak.push(t.upload.duplicate(file.name))
      else
        baru.push({
          id: ++nomor.current,
          file,
          judul: judulDariNama(file.name),
          unit: "",
          tahun: "",
          validUntil: "",
          tahap: { status: "siap" },
        })
    }
    setDitolak(tolak)
    if (baru.length > 0) setDaftar((lama) => [...lama, ...baru])
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setMenyeret(false)
    if (!sibuk) tambah(event.dataTransfer.files)
  }

  async function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (antre.length === 0) return
    setDitolak([])
    // Urungkan setelah pengiriman dimulai hanya akan mengubah tampilan, bukan
    // unit yang sudah terkirim.
    if (toastTerapkan.current !== null) toast.dismiss(toastTerapkan.current)

    const terpasang: { judul: string; hasil: Hasil }[] = []
    let gagal = 0
    // Bergiliran, bukan paralel: tiap unggahan langsung meng-embed seluruh
    // isinya, dan beberapa sekaligus membuat layanan embedding kewalahan
    // sampai semuanya kehabisan waktu.
    for (const [i, berkas] of antre.entries()) {
      if (!terpasangDiLayar.current) return
      setGiliran({ ke: i + 1, dari: antre.length })
      ubah(berkas.id, { tahap: { status: "mengunggah", progress: 0 } })
      try {
        const hasil = await uploadDocument(
          {
            file: berkas.file,
            title: berkas.judul.trim(),
            unit: (unitTerkunci ?? berkas.unit).trim(),
            effective_year: berkas.tahun ? Number(berkas.tahun) : undefined,
            valid_until: berkas.validUntil || undefined,
          },
          {
            onUploadProgress: (progress) =>
              ubah(berkas.id, { tahap: { status: "mengunggah", progress } }),
            onUploaded: () => ubah(berkas.id, { tahap: { status: "memproses" } }),
          }
        )
        ubah(berkas.id, { tahap: { status: "selesai", hasil } })
        terpasang.push({ judul: berkas.judul.trim(), hasil })
      } catch (error) {
        gagal++
        ubah(berkas.id, {
          tahap: {
            status: "gagal",
            pesan: error instanceof Error ? error.message : t.upload.failedGeneric,
          },
        })
        // Sesi habis: berkas berikutnya pasti ditolak juga. Sisanya tetap di
        // daftar dan dapat dikirim lagi setelah masuk ulang.
        if (error instanceof ApiError && error.status === 401) break
      }
    }
    setGiliran(null)

    if (terpasang.length > 0) await queryClient.invalidateQueries({ queryKey: ["documents"] })
    for (const { judul, hasil } of terpasang)
      for (const pesan of hasil.warnings ?? [])
        toast.warning(daftar.length > 1 ? t.upload.thinWarningOf(judul) : t.upload.thinWarning, {
          description: pesan,
          duration: 12000,
        })

    if (gagal > 0) {
      // Satu berkas saja: galatnya sudah tampil di barisnya.
      if (antre.length > 1)
        toast.error(t.upload.partialTitle(gagal, antre.length), {
          description: t.upload.partialBody,
        })
      return
    }
    if (daftar.length === 1) {
      const { hasil } = terpasang[0]
      toast.success(t.upload.installed, {
        description: t.upload.installedBody(hasil.page_count, hasil.chunk_count),
      })
      router.push(tautanDetail(hasil))
    } else {
      toast.success(t.upload.installedMany(daftar.length), {
        description: t.upload.installedManyBody,
      })
      router.push("/dokumen")
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
      <PageHeader title={t.upload.title} description={t.upload.description} />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={kirim} className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.upload.fileCard}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                role="button"
                tabIndex={sibuk ? -1 : 0}
                aria-disabled={sibuk}
                onClick={() => {
                  if (!sibuk) inputRef.current?.click()
                }}
                onKeyDown={(e) => {
                  if (!sibuk && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (!sibuk) setMenyeret(true)
                }}
                onDragLeave={() => setMenyeret(false)}
                onDrop={onDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 text-center transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                  daftar.length > 0 ? "py-6" : "py-10",
                  menyeret && "border-primary bg-muted/50",
                  sibuk && "cursor-not-allowed opacity-50 hover:bg-transparent"
                )}
              >
                <UploadIcon className="size-6 text-muted-foreground" aria-hidden />
                <p className="font-medium">{t.upload.dropzone}</p>
                <p className="text-xs text-muted-foreground">{t.upload.dropzoneHint}</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="application/pdf,.pdf"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  tambah(e.target.files)
                  e.target.value = ""
                }}
              />
              {ditolak.length > 0 ? (
                <Alert variant="destructive">
                  <AlertTitle>{t.upload.rejectedTitle}</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {ditolak.map((pesan, i) => (
                        <li key={i}>{pesan}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          {daftar.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t.upload.infoCard}</CardTitle>
                <CardDescription>{t.upload.infoCardHint}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daftar.map((berkas) => (
                  <IsianBerkas
                    key={berkas.id}
                    berkas={berkas}
                    units={units}
                    unitTerkunci={unitTerkunci}
                    hariIni={hariIni}
                    sibuk={sibuk}
                    onUbah={(isian) => ubah(berkas.id, isian)}
                    onTerapkanUnit={
                      bisaTerapkanUnit(berkas) ? () => terapkanUnit(berkas) : undefined
                    }
                    onKeluarkan={() => setDaftar((lama) => lama.filter((b) => b.id !== berkas.id))}
                  />
                ))}
                <p className="text-xs text-pretty text-muted-foreground">{t.upload.expiryHint}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/dokumen" aria-disabled={sibuk}>
                {adaSelesai ? t.docDetail.backToList : t.common.cancel}
              </Link>
            </Button>
            <Button type="submit" disabled={antre.length === 0 || sibuk}>
              {giliran
                ? giliran.dari > 1
                  ? t.upload.processingOf(giliran.ke, giliran.dari)
                  : t.upload.processing
                : antre.length > 1
                  ? t.upload.submitMany(antre.length)
                  : t.upload.submit}
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

/**
 * Satu berkas di daftar: kepala berkas, keadaan unggahannya, dan isian
 * dokumennya. Setelah terpasang isiannya disembunyikan -- dokumennya sudah
 * ada, perubahan berikutnya lewat halaman detail.
 */
function IsianBerkas({
  berkas,
  units,
  unitTerkunci,
  hariIni,
  sibuk,
  onUbah,
  onTerapkanUnit,
  onKeluarkan,
}: {
  berkas: Berkas
  units: string[]
  unitTerkunci: string | null
  hariIni: string
  sibuk: boolean
  onUbah: (isian: Isian) => void
  /** Salin unit berkas ini ke semua berkas yang belum terpasang. */
  onTerapkanUnit?: () => void
  onKeluarkan: () => void
}) {
  const t = useT()
  const f = useFormat()
  const { file, tahap } = berkas
  const id = (kolom: string) => `${kolom}-${berkas.id}`

  return (
    <section aria-label={file.name} className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <FileTextIcon className="size-8 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{f.bytes(file.size)}</p>
        </div>
        {tahap.status === "selesai" ? null : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={sibuk}
            onClick={onKeluarkan}
            aria-label={t.upload.removeFile(file.name)}
          >
            <XIcon />
          </Button>
        )}
      </div>

      {tahap.status === "selesai" ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusLabel level={tahap.hasil.warnings?.length ? "warning" : "good"}>
              {t.upload.done(tahap.hasil.page_count, tahap.hasil.chunk_count)}
            </StatusLabel>
            <Button variant="outline" size="sm" asChild>
              <Link href={tautanDetail(tahap.hasil)}>
                {t.upload.checkPreview}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          {tahap.hasil.warnings?.map((pesan) => (
            <p key={pesan} className="text-xs text-pretty text-muted-foreground">
              {pesan}
            </p>
          ))}
        </div>
      ) : (
        <>
          {tahap.status === "siap" && sibuk ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {t.upload.waiting}
            </p>
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

          {tahap.status === "gagal" ? (
            <Alert variant="destructive">
              <AlertTitle>{t.upload.failedTitle}</AlertTitle>
              <AlertDescription>{tahap.pesan}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={id("judul")}>{t.upload.judul}</Label>
              <Input
                id={id("judul")}
                required
                minLength={3}
                maxLength={500}
                placeholder={t.upload.judulPlaceholder}
                value={berkas.judul}
                disabled={sibuk}
                onChange={(e) => onUbah({ judul: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={id("unit")}>{t.upload.unit}</Label>
              <UnitField
                id={id("unit")}
                required
                units={units}
                value={unitTerkunci ?? berkas.unit}
                readOnly={unitTerkunci !== null}
                disabled={sibuk}
                onChange={(unit) => onUbah({ unit })}
              />
              {unitTerkunci !== null ? (
                <p className="text-xs text-muted-foreground">{t.upload.unitLocked}</p>
              ) : null}
              {onTerapkanUnit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="-ml-2"
                  disabled={sibuk}
                  onClick={onTerapkanUnit}
                >
                  <CopyIcon data-icon="inline-start" />
                  {t.upload.applyUnitToAll}
                </Button>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={id("tahun")}>
                {t.upload.tahun}{" "}
                <span className="font-normal text-muted-foreground">{t.upload.optional}</span>
              </Label>
              <Input
                id={id("tahun")}
                type="number"
                inputMode="numeric"
                min={2000}
                max={2100}
                placeholder="2026"
                value={berkas.tahun}
                disabled={sibuk}
                onChange={(e) => onUbah({ tahun: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={id("valid-until")}>
                {t.upload.validUntil}{" "}
                <span className="font-normal text-muted-foreground">{t.upload.optional}</span>
              </Label>
              <DateField
                id={id("valid-until")}
                min={hariIni}
                spanFrom={hariIni}
                value={berkas.validUntil}
                disabled={sibuk}
                onChange={(validUntil) => onUbah({ validUntil })}
                placeholder={t.upload.noExpiry}
                clearLabel={t.upload.clearExpiry}
              />
            </div>
          </div>
        </>
      )}
    </section>
  )
}
