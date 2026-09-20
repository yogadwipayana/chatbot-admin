"use client"

import {
  ArrowLeftIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FileQuestionIcon,
  LockIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { DateField } from "@/components/date-field"
import { DeleteDocumentDialog } from "@/components/documents/delete-document-dialog"
import { DocumentStatus } from "@/components/documents/document-status"
import { useToggleActive } from "@/components/documents/use-toggle-active"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { UnitField } from "@/components/unit-field"
import { useNow } from "@/hooks/use-now"
import { ApiError, type Schemas } from "@/lib/api/client"
import { useChunks, useDocument, useMe, useUnits, useUpdateDocument } from "@/lib/api/queries"
import { documentFileUrl, isServed, staleReason, type Doc } from "@/lib/documents"
import { toDateInput } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"

export function DocumentDetailView({
  id,
  isNew,
  teksTipis = false,
}: {
  id: string
  isNew: boolean
  /** Ekstraksi hanya menemukan sedikit teks -- isinya diduga berupa gambar. */
  teksTipis?: boolean
}) {
  const t = useT()
  const now = useNow()
  const router = useRouter()
  const query = useDocument(id)
  const { toggle, pendingId } = useToggleActive()
  const [hapus, setHapus] = useState<Doc | null>(null)

  const kembali = (
    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
      <Link href="/dokumen">
        <ArrowLeftIcon data-icon="inline-start" />
        {t.upload.back}
      </Link>
    </Button>
  )

  if (query.error) {
    const hilang =
      query.error instanceof ApiError && (query.error.status === 404 || query.error.status === 422)
    const unitLain = query.error instanceof ApiError && query.error.status === 403
    return (
      <>
        {kembali}
        {unitLain ? (
          <EmptyState
            icon={LockIcon}
            title={t.docDetail.otherUnit}
            description={query.error.message}
            action={
              <Button asChild variant="outline">
                <Link href="/dokumen">{t.docDetail.backToList}</Link>
              </Button>
            }
          />
        ) : hilang ? (
          <EmptyState
            icon={FileQuestionIcon}
            title={t.docDetail.notFound}
            description={t.docDetail.notFoundBody}
            action={
              <Button asChild variant="outline">
                <Link href="/dokumen">{t.docDetail.backToList}</Link>
              </Button>
            }
          />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        )}
      </>
    )
  }

  if (!query.data) {
    return (
      <>
        {kembali}
        <Skeleton className="mb-6 h-10 w-2/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      </>
    )
  }

  const doc = query.data
  const alasanUsang = doc.is_active ? staleReason(doc, now) : null

  return (
    <>
      {kembali}
      <PageHeader
        title={doc.judul}
        description={doc.unit}
        actions={
          <>
            {isServed(doc, now) ? (
              <Button variant="outline" asChild>
                <a href={documentFileUrl(doc.id)} target="_blank" rel="noreferrer">
                  <ExternalLinkIcon data-icon="inline-start" />
                  {t.documents.openPdf}
                </a>
              </Button>
            ) : null}
            <Button
              variant="outline"
              disabled={pendingId === doc.id}
              onClick={() => toggle(doc, now)}
            >
              {doc.is_active ? (
                <>
                  <EyeOffIcon data-icon="inline-start" />
                  {t.documents.deactivate}
                </>
              ) : (
                <>
                  <EyeIcon data-icon="inline-start" />
                  {t.documents.activate}
                </>
              )}
            </Button>
            <Button variant="destructive" onClick={() => setHapus(doc)}>
              <Trash2Icon data-icon="inline-start" />
              {t.docDetail.delete}
            </Button>
          </>
        }
      />

      <div className="-mt-3 mb-6">
        <DocumentStatus doc={doc} now={now} />
      </div>

      <div className="space-y-4">
        {isNew ? (
          <Alert>
            <CircleCheckIcon className="text-status-good" />
            <AlertTitle>{t.docDetail.installedTitle}</AlertTitle>
            <AlertDescription>{t.docDetail.installedBody}</AlertDescription>
          </Alert>
        ) : null}
        {teksTipis ? (
          <Alert>
            <TriangleAlertIcon className="text-status-warning" />
            <AlertTitle>{t.docDetail.thinTitle}</AlertTitle>
            <AlertDescription>{t.docDetail.thinBody}</AlertDescription>
          </Alert>
        ) : null}
        {alasanUsang ? (
          <Alert>
            <TriangleAlertIcon className="text-status-warning" />
            <AlertTitle>{t.docStatus.needsReview}</AlertTitle>
            <AlertDescription>{t.docStatus.stale[alasanUsang]}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <MetadataCard key={doc.updated_at} doc={doc} />
        <ChunksCard id={doc.id} total={doc.jumlah_chunk} />
      </div>

      <DeleteDocumentDialog
        doc={hapus}
        onClose={() => setHapus(null)}
        onDeleted={() => router.replace("/dokumen")}
      />
    </>
  )
}

/** Di-remount lewat `key={updated_at}` setelah tersimpan, jadi isian selalu mulai dari data terbaru. */
function MetadataCard({ doc }: { doc: Doc }) {
  const t = useT()
  const f = useFormat()
  const update = useUpdateDocument()
  // Staf/dosen tidak dapat memindahkan dokumen ke unit lain.
  const unitTerkunci = useMe().data?.role === "staf"
  const hariIni = toDateInput(new Date(useNow()))
  const units = useUnits()
  const [judul, setJudul] = useState(doc.judul)
  const [unit, setUnit] = useState(doc.unit)
  const [tahun, setTahun] = useState(doc.tahun_berlaku?.toString() ?? "")
  const [validUntil, setValidUntil] = useState(doc.valid_until ?? "")

  const perubahan: Schemas["DocumentUpdate"] = {}
  if (judul.trim() !== doc.judul) perubahan.judul = judul.trim()
  if (unit.trim() !== doc.unit) perubahan.unit = unit.trim()
  const tahunBaru = tahun === "" ? null : Number(tahun)
  if (tahunBaru !== (doc.tahun_berlaku ?? null)) perubahan.tahun_berlaku = tahunBaru
  const berlakuBaru = validUntil === "" ? null : validUntil
  if (berlakuBaru !== (doc.valid_until ?? null)) perubahan.valid_until = berlakuBaru
  const berubah = Object.keys(perubahan).length > 0

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    update.mutate(
      { id: doc.id, body: perubahan },
      {
        onSuccess: () => toast.success(t.docDetail.saved),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  function reset() {
    setJudul(doc.judul)
    setUnit(doc.unit)
    setTahun(doc.tahun_berlaku?.toString() ?? "")
    setValidUntil(doc.valid_until ?? "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.docDetail.infoCard}</CardTitle>
        <CardDescription>{t.docDetail.infoCardHint}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={simpan} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judul">{t.upload.judul}</Label>
            <Input
              id="judul"
              required
              minLength={3}
              maxLength={500}
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">{t.upload.unit}</Label>
            <UnitField
              id="unit"
              required
              units={units}
              value={unit}
              readOnly={unitTerkunci}
              onChange={setUnit}
            />
            {unitTerkunci ? (
              <p className="text-xs text-muted-foreground">{t.docDetail.unitLocked}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahun">{t.upload.tahun}</Label>
            <Input
              id="tahun"
              type="number"
              inputMode="numeric"
              min={2000}
              max={2100}
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="valid-until">{t.upload.validUntil}</Label>
              {validUntil ? (
                <Button type="button" variant="link" size="xs" onClick={() => setValidUntil("")}>
                  {t.upload.clearExpiry}
                </Button>
              ) : null}
            </div>
            <DateField
              id="valid-until"
              min={hariIni}
              spanFrom={hariIni}
              value={validUntil}
              onChange={setValidUntil}
              placeholder={t.upload.noExpiry}
            />
            <p className="text-xs text-muted-foreground">
              {validUntil ? t.docDetail.expiryOn : t.docDetail.expiryOff}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={!berubah || update.isPending} onClick={reset}>
              {t.docDetail.revert}
            </Button>
            <Button type="submit" disabled={!berubah || update.isPending}>
              {update.isPending ? t.common.saving : t.common.save}
            </Button>
          </div>
        </form>

        <Separator className="my-5" />

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{t.docDetail.uploadedBy}</dt>
          <dd className="min-w-0 break-words">{doc.uploaded_by ?? t.docDetail.notRecorded}</dd>
          <dt className="text-muted-foreground">{t.docDetail.updated}</dt>
          <dd>{f.dateTime(doc.updated_at)}</dd>
          <dt className="text-muted-foreground">{t.docDetail.chunks}</dt>
          <dd className="tabular-nums">{f.number(doc.jumlah_chunk)}</dd>
        </dl>
      </CardContent>
    </Card>
  )
}

function ChunksCard({ id, total }: { id: string; total: number }) {
  const t = useT()
  const f = useFormat()
  const chunks = useChunks(id)
  const items = chunks.data?.pages.flat() ?? []

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t.docDetail.previewTitle}</CardTitle>
        <CardDescription>{t.docDetail.previewHint}</CardDescription>
      </CardHeader>
      <CardContent>
        {chunks.error ? (
          <QueryError error={chunks.error} onRetry={() => chunks.refetch()} />
        ) : chunks.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.docDetail.noChunks}</p>
        ) : (
          <div className="space-y-3">
            {items.map((chunk) => (
              <article key={chunk.id} className="rounded-lg border p-3">
                <header className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {t.docDetail.chunkLabel(chunk.urutan + 1)}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{t.docDetail.pageLabel(chunk.halaman)}</span>
                </header>
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {chunk.konten}
                </p>
              </article>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm text-muted-foreground">
              <span>{t.docDetail.showing(f.number(items.length), f.number(total))}</span>
              {chunks.hasNextPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={chunks.isFetchingNextPage}
                  onClick={() => chunks.fetchNextPage()}
                >
                  {chunks.isFetchingNextPage ? t.docDetail.loading : t.docDetail.loadMore}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
