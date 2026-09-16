"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  FileUpIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { DeleteDocumentDialog } from "@/components/documents/delete-document-dialog"
import { DocumentStatus } from "@/components/documents/document-status"
import { useToggleActive } from "@/components/documents/use-toggle-active"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNow } from "@/hooks/use-now"
import { useDocuments, useMe } from "@/lib/api/queries"
import { documentFileUrl, isServed, staleReason, type Doc } from "@/lib/documents"
import { formatDate, formatNumber, formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

export function DocumentsView() {
  const now = useNow()
  const [includeInactive, setIncludeInactive] = useState(false)
  const [onlyStale, setOnlyStale] = useState(false)
  const [page, setPage] = useState(0)
  const [hapus, setHapus] = useState<Doc | null>(null)
  const { toggle, pendingId } = useToggleActive()
  const me = useMe().data

  const query = useDocuments({
    include_inactive: includeInactive,
    only_stale: onlyStale,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })
  const data = query.data
  const total = data?.total ?? 0
  const halamanTerakhir = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  return (
    <>
      <PageHeader
        title="Dokumen sumber"
        description={
          me?.role === "staf"
            ? `Dokumen unit ${me.unit}. Akun Staf/Dosen hanya dapat melihat dan mengelola dokumen unitnya sendiri. Dokumen yang lewat masa berlaku otomatis berhenti dipakai.`
            : "Dokumen resmi yang menjadi satu-satunya sumber jawaban chatbot. Dokumen yang lewat masa berlaku otomatis berhenti dipakai."
        }
        actions={
          <Button asChild>
            <Link href="/dokumen/unggah">
              <FileUpIcon data-icon="inline-start" />
              Unggah dokumen
            </Link>
          </Button>
        }
      />

      {data && data.jumlah_stale > 0 && !onlyStale ? (
        <Alert className="mb-4">
          <TriangleAlertIcon className="text-status-warning" />
          <AlertTitle>
            {formatNumber(data.jumlah_stale)} dokumen aktif perlu ditinjau
          </AlertTitle>
          <AlertDescription>
            Lebih dari 6 bulan tidak diperbarui atau sudah lewat masa berlaku. Dokumen usang
            membuat chatbot menyebarkan informasi lama atas nama kampus.
          </AlertDescription>
          <AlertAction>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOnlyStale(true)
                setPage(0)
              }}
            >
              Tampilkan
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="hanya-usang"
            checked={onlyStale}
            onCheckedChange={(v) => {
              setOnlyStale(v)
              setPage(0)
            }}
          />
          <Label htmlFor="hanya-usang">Hanya yang perlu ditinjau</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="nonaktif"
            checked={includeInactive}
            onCheckedChange={(v) => {
              setIncludeInactive(v)
              setPage(0)
            }}
          />
          <Label htmlFor="nonaktif">Tampilkan yang nonaktif</Label>
        </div>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !data || data.items.length === 0 ? (
        onlyStale || includeInactive ? (
          <EmptyState
            icon={FileTextIcon}
            title="Tidak ada dokumen yang cocok"
            description="Ubah filter di atas untuk melihat dokumen lain."
          />
        ) : (
          <EmptyState
            icon={FileTextIcon}
            title="Belum ada dokumen"
            description="Chatbot belum dapat menjawab apa pun sampai dokumen resmi diunggah."
            action={
              <Button asChild>
                <Link href="/dokumen/unggah">Unggah dokumen pertama</Link>
              </Button>
            }
          />
        )
      ) : (
        <div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-64 pl-4">Dokumen</TableHead>
                  <TableHead className="min-w-44">Status</TableHead>
                  <TableHead>Berlaku sampai</TableHead>
                  <TableHead>Diperbarui</TableHead>
                  <TableHead className="text-right">Potongan</TableHead>
                  <TableHead className="w-12 pr-4">
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((doc) => {
                  const alasan = staleReason(doc, now)
                  return (
                    <TableRow key={doc.id} className={cn(!doc.is_active && "text-muted-foreground")}>
                      <TableCell className="pl-4 whitespace-normal">
                        <Link
                          href={`/dokumen/${doc.id}`}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {doc.judul}
                        </Link>
                        <p className="text-xs text-muted-foreground">{doc.unit}</p>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <DocumentStatus doc={doc} now={now} />
                        {doc.is_active && alasan ? (
                          <p className="mt-1 max-w-56 text-xs text-muted-foreground">{alasan}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {doc.valid_until ? formatDate(doc.valid_until) : "Tanpa batas"}
                      </TableCell>
                      <TableCell title={formatDate(doc.updated_at)}>
                        {formatRelative(doc.updated_at, now)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(doc.jumlah_chunk)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={pendingId === doc.id}
                              aria-label={`Aksi untuk ${doc.judul}`}
                            >
                              <EllipsisIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dokumen/${doc.id}`}>
                                <EyeIcon /> Detail dan pratinjau
                              </Link>
                            </DropdownMenuItem>
                            {isServed(doc, now) ? (
                              <DropdownMenuItem asChild>
                                <a href={documentFileUrl(doc.id)} target="_blank" rel="noreferrer">
                                  <ExternalLinkIcon /> Buka PDF
                                </a>
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem onSelect={() => toggle(doc, now)}>
                              {doc.is_active ? (
                                <>
                                  <EyeOffIcon /> Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <EyeIcon /> Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setHapus(doc)}>
                              <Trash2Icon /> Hapus permanen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {total > PAGE_SIZE ? (
            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <span>
                {formatNumber(page * PAGE_SIZE + 1)}–
                {formatNumber(Math.min((page + 1) * PAGE_SIZE, total))} dari {formatNumber(total)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= halamanTerakhir}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <DeleteDocumentDialog doc={hapus} onClose={() => setHapus(null)} />
    </>
  )
}
