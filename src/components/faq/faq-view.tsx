"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  MessagesSquareIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { DateField } from "@/components/date-field"
import { DocumentStatus } from "@/components/documents/document-status"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { UnitField } from "@/components/unit-field"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import {
  useCreateFaq,
  useDeleteFaq,
  useFaq,
  useMe,
  useUnits,
  useUpdateFaq,
} from "@/lib/api/queries"
import { isExpired, staleReason } from "@/lib/documents"
import { formatDate, formatNumber, formatRelative, toDateInput, truncate } from "@/lib/format"
import { cn } from "@/lib/utils"

type Faq = Schemas["FaqEntry"]
type FormState = { mode: "buat" } | { mode: "ubah"; entry: Faq }

const PAGE_SIZE = 20
const MAKS_JAWABAN = 5000

export function FaqView() {
  const now = useNow()
  const me = useMe().data
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(0)
  const [form, setForm] = useState<FormState | null>(null)
  const [hapus, setHapus] = useState<Faq | null>(null)
  const update = useUpdateFaq()

  const query = useFaq({
    include_inactive: includeInactive,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })
  const data = query.data
  const total = data?.total ?? 0
  const halamanTerakhir = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  /** Dapat dibatalkan lewat toast, jadi tanpa dialog konfirmasi. */
  function alihAktif(entry: Faq) {
    const aktifkan = !entry.is_active
    update.mutate(
      { id: entry.id, body: { is_active: aktifkan } },
      {
        onSuccess: () =>
          toast.success(aktifkan ? "Diaktifkan kembali" : "Dinonaktifkan", {
            description: aktifkan
              ? isExpired(entry, now)
                ? "Masa berlakunya sudah habis, jadi chatbot belum memakainya sampai tanggal berlaku diperbarui."
                : "Chatbot kembali memakainya mulai pertanyaan berikutnya."
              : "Chatbot berhenti memakainya mulai pertanyaan berikutnya. Isinya tidak dihapus.",
            action: {
              label: "Batalkan",
              onClick: () => update.mutate({ id: entry.id, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error("Gagal menyimpan", { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title="Tanya jawab"
        description={
          me?.role === "staf"
            ? `Jawaban siap pakai untuk unit ${me.unit}, tanpa perlu dokumen PDF. Chatbot memakainya persis seperti dokumen resmi, lengkap dengan kartu sumber.`
            : "Jawaban siap pakai yang Anda tulis sendiri, tanpa perlu dokumen PDF. Chatbot memakainya persis seperti dokumen resmi, lengkap dengan kartu sumber."
        }
        actions={
          <Button onClick={() => setForm({ mode: "buat" })}>
            <PlusIcon data-icon="inline-start" />
            Tambah tanya jawab
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
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

      {query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={MessagesSquareIcon}
          title="Belum ada tanya jawab"
          description="Tulis pertanyaan yang sering masuk beserta jawabannya. Begitu tersimpan, chatbot langsung memakainya — tidak perlu menunggu dokumen resmi terbit."
          action={<Button onClick={() => setForm({ mode: "buat" })}>Tambah yang pertama</Button>}
        />
      ) : (
        <div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-80 pl-4">Pertanyaan dan jawaban</TableHead>
                  <TableHead className="min-w-32">Unit</TableHead>
                  <TableHead className="min-w-44">Status</TableHead>
                  <TableHead>Berlaku sampai</TableHead>
                  <TableHead>Diperbarui</TableHead>
                  <TableHead className="w-12 pr-4">
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((entry) => {
                  const alasan = staleReason(entry, now)
                  return (
                    <TableRow
                      key={entry.id}
                      className={cn(!entry.is_active && "text-muted-foreground")}
                    >
                      <TableCell className="max-w-xl pl-4 whitespace-normal">
                        <button
                          type="button"
                          className="text-left font-medium text-foreground underline-offset-4 hover:underline"
                          onClick={() => setForm({ mode: "ubah", entry })}
                        >
                          {entry.pertanyaan}
                        </button>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {entry.jawaban}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-normal">{entry.unit}</TableCell>
                      <TableCell className="whitespace-normal">
                        <DocumentStatus doc={entry} now={now} />
                        {entry.is_active && alasan ? (
                          <p className="mt-1 max-w-56 text-xs text-muted-foreground">{alasan}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {entry.valid_until ? formatDate(entry.valid_until) : "Tanpa batas"}
                      </TableCell>
                      <TableCell title={formatDate(entry.updated_at)}>
                        {formatRelative(entry.updated_at, now)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={update.isPending && update.variables?.id === entry.id}
                              aria-label={`Aksi untuk ${truncate(entry.pertanyaan, 50)}`}
                            >
                              <EllipsisIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setForm({ mode: "ubah", entry })}>
                              <PencilIcon /> Ubah
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => alihAktif(entry)}>
                              {entry.is_active ? (
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
                            <DropdownMenuItem variant="destructive" onSelect={() => setHapus(entry)}>
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

      {form ? (
        <FaqFormDialog
          key={form.mode === "ubah" ? form.entry.id : "baru"}
          state={form}
          onClose={() => setForm(null)}
        />
      ) : null}
      <DeleteFaqDialog entry={hapus} onClose={() => setHapus(null)} />
    </>
  )
}

function FaqFormDialog({ state, onClose }: { state: FormState; onClose: () => void }) {
  const editing = state.mode === "ubah" ? state.entry : null
  const hariIni = toDateInput(new Date(useNow()))
  const create = useCreateFaq()
  const update = useUpdateFaq()

  // Unit dikunci untuk staf/dosen: server menolak unit lain, dan penolakan itu
  // sebaiknya tidak pernah sampai terjadi.
  const me = useMe().data
  const unitTerkunci = me?.role === "staf" ? (me.unit ?? "") : null

  const units = useUnits()

  const [pertanyaan, setPertanyaan] = useState(editing?.pertanyaan ?? "")
  const [jawaban, setJawaban] = useState(editing?.jawaban ?? "")
  const [unit, setUnit] = useState(editing?.unit ?? unitTerkunci ?? "")
  const [validUntil, setValidUntil] = useState(editing?.valid_until ?? "")
  const [galat, setGalat] = useState<string | null>(null)

  const unitDipakai = unitTerkunci ?? unit
  const sibuk = create.isPending || update.isPending

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGalat(null)

    if (!editing) {
      create.mutate(
        {
          pertanyaan: pertanyaan.trim(),
          jawaban: jawaban.trim(),
          unit: unitDipakai.trim(),
          valid_until: validUntil || null,
        },
        {
          onSuccess: (entry) => {
            toast.success("Tanya jawab ditambahkan", {
              description:
                entry.jumlah_chunk > 1
                  ? `Jawaban dipecah menjadi ${entry.jumlah_chunk} potongan dan langsung dipakai chatbot.`
                  : "Chatbot langsung memakainya untuk pertanyaan berikutnya.",
            })
            onClose()
          },
          onError: (error) => setGalat(error.message),
        }
      )
      return
    }

    const body: Schemas["FaqEntryUpdate"] = {}
    if (pertanyaan.trim() !== editing.pertanyaan) body.pertanyaan = pertanyaan.trim()
    if (jawaban.trim() !== editing.jawaban) body.jawaban = jawaban.trim()
    if (unitDipakai.trim() !== editing.unit) body.unit = unitDipakai.trim()
    if ((validUntil || null) !== (editing.valid_until ?? null)) body.valid_until = validUntil || null
    if (Object.keys(body).length === 0) {
      onClose()
      return
    }
    update.mutate(
      { id: editing.id, body },
      {
        onSuccess: () => {
          toast.success("Tersimpan", {
            description:
              body.pertanyaan || body.jawaban
                ? "Isinya diindeks ulang, jadi chatbot memakai versi baru mulai pertanyaan berikutnya."
                : undefined,
          })
          onClose()
        },
        onError: (error) => setGalat(error.message),
      }
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !sibuk && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={simpan} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah tanya jawab" : "Tambah tanya jawab"}</DialogTitle>
            <DialogDescription>
              Pertanyaannya ikut tampil sebagai judul sumber pada jawaban yang dibaca mahasiswa,
              jadi tulis seperti mereka menanyakannya.
            </DialogDescription>
          </DialogHeader>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="faq-pertanyaan">Pertanyaan</Label>
            <Textarea
              id="faq-pertanyaan"
              required
              autoFocus
              rows={2}
              minLength={5}
              maxLength={500}
              placeholder="Bagaimana cara mengurus KTM yang hilang?"
              value={pertanyaan}
              disabled={sibuk}
              onChange={(e) => setPertanyaan(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-jawaban">Jawaban</Label>
            <Textarea
              id="faq-jawaban"
              required
              rows={7}
              minLength={10}
              maxLength={MAKS_JAWABAN}
              placeholder="Laporkan kehilangan ke kepolisian, lalu bawa surat kehilangan beserta fotokopi KTP ke loket 3."
              value={jawaban}
              disabled={sibuk}
              onChange={(e) => setJawaban(e.target.value)}
            />
            <p className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span className="text-pretty">
                Tulis lengkap dalam kalimat utuh. Chatbot hanya boleh menjawab dari yang tertulis di
                sini, dan tidak akan menyimpulkan sendiri.
              </span>
              <span className="shrink-0 tabular-nums">
                {formatNumber(jawaban.length)}/{formatNumber(MAKS_JAWABAN)}
              </span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="faq-unit">Unit</Label>
              <UnitField
                id="faq-unit"
                required
                units={units}
                value={unitDipakai}
                readOnly={unitTerkunci !== null}
                disabled={sibuk}
                onChange={setUnit}
              />
              <p className="text-xs text-pretty text-muted-foreground">
                {unitTerkunci !== null
                  ? "Akun Staf/Dosen hanya dapat mengelola isi unitnya sendiri."
                  : "Unit yang bertanggung jawab atas jawaban ini."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-valid-until">
                Berlaku sampai <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <DateField
                id="faq-valid-until"
                min={hariIni}
                spanFrom={hariIni}
                value={validUntil}
                disabled={sibuk}
                onChange={setValidUntil}
                placeholder="Tanpa batas"
                clearLabel="Jadikan tanpa batas"
              />
              <p className="text-xs text-pretty text-muted-foreground">
                Setelah tanggal ini chatbot otomatis berhenti memakainya. Kosongkan bila berlaku
                tanpa batas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sibuk}>
              Batal
            </Button>
            <Button type="submit" disabled={sibuk}>
              {sibuk ? "Menyimpan…" : editing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteFaqDialog({ entry, onClose }: { entry: Faq | null; onClose: () => void }) {
  const remove = useDeleteFaq()

  function hapus() {
    if (!entry) return
    remove.mutate(entry.id, {
      onSuccess: () => {
        toast.success("Tanya jawab dihapus", { description: `“${truncate(entry.pertanyaan, 70)}”` })
        onClose()
      },
      onError: (error) => toast.error("Gagal menghapus", { description: error.message }),
    })
  }

  return (
    <AlertDialog
      open={entry !== null}
      onOpenChange={(open) => !open && !remove.isPending && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus tanya jawab ini?</AlertDialogTitle>
          <AlertDialogDescription>
            “{entry ? truncate(entry.pertanyaan, 100) : ""}” dihapus permanen beserta indeksnya dan
            tidak dapat dikembalikan. Untuk sekadar menghentikan pemakaiannya, pilih Nonaktifkan
            saja.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Batal</AlertDialogCancel>
          <Button variant="destructive" onClick={hapus} disabled={remove.isPending}>
            {remove.isPending ? "Menghapus…" : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
