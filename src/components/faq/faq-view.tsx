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
import { toDateInput, truncate } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Faq = Schemas["FaqEntry"]
type FormState = { mode: "buat" } | { mode: "ubah"; entry: Faq }

const PAGE_SIZE = 20
const MAKS_JAWABAN = 5000

export function FaqView() {
  const t = useT()
  const f = useFormat()
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
          toast.success(aktifkan ? t.faq.activated : t.faq.deactivated, {
            description: aktifkan
              ? isExpired(entry, now)
                ? t.faq.activatedExpired
                : t.faq.activatedDetail
              : t.faq.deactivatedDetail,
            action: {
              label: t.common.undo,
              onClick: () => update.mutate({ id: entry.id, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title={t.faq.title}
        description={
          me?.role === "staf" ? t.faq.descriptionStaff(me.unit ?? "") : t.faq.description
        }
        actions={
          <Button onClick={() => setForm({ mode: "buat" })}>
            <PlusIcon data-icon="inline-start" />
            {t.faq.add}
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
        <Label htmlFor="nonaktif">{t.documents.showInactive}</Label>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={MessagesSquareIcon}
          title={t.faq.empty}
          description={t.faq.emptyBody}
          action={<Button onClick={() => setForm({ mode: "buat" })}>{t.faq.emptyAction}</Button>}
        />
      ) : (
        <div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-80 pl-4">{t.faq.columns.entry}</TableHead>
                  <TableHead className="min-w-32">{t.faq.columns.unit}</TableHead>
                  <TableHead className="min-w-44">{t.documents.columns.status}</TableHead>
                  <TableHead>{t.documents.columns.validUntil}</TableHead>
                  <TableHead>{t.documents.columns.updated}</TableHead>
                  <TableHead className="w-12 pr-4">
                    <span className="sr-only">{t.documents.columns.actions}</span>
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
                          <p className="mt-1 max-w-56 text-xs text-muted-foreground">
                            {t.docStatus.stale[alasan]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {entry.valid_until ? f.date(entry.valid_until) : t.documents.noExpiry}
                      </TableCell>
                      <TableCell title={f.date(entry.updated_at)}>
                        {f.relative(entry.updated_at, now)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={update.isPending && update.variables?.id === entry.id}
                              aria-label={t.faq.rowActions(truncate(entry.pertanyaan, 50))}
                            >
                              <EllipsisIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setForm({ mode: "ubah", entry })}>
                              <PencilIcon /> {t.faq.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => alihAktif(entry)}>
                              {entry.is_active ? (
                                <>
                                  <EyeOffIcon /> {t.documents.deactivate}
                                </>
                              ) : (
                                <>
                                  <EyeIcon /> {t.documents.activate}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setHapus(entry)}>
                              <Trash2Icon /> {t.documents.deletePermanently}
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
                {t.documents.range(
                  f.number(page * PAGE_SIZE + 1),
                  f.number(Math.min((page + 1) * PAGE_SIZE, total)),
                  f.number(total)
                )}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  {t.documents.previous}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= halamanTerakhir}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t.documents.next}
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
  const t = useT()
  const f = useFormat()
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
            toast.success(t.faq.form.added, {
              description:
                entry.jumlah_chunk > 1
                  ? t.faq.form.addedChunks(entry.jumlah_chunk)
                  : t.faq.form.addedSingle,
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
          toast.success(t.faq.form.saved, {
            description:
              body.pertanyaan || body.jawaban ? t.faq.form.savedReindexed : undefined,
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
            <DialogTitle>{editing ? t.faq.form.editTitle : t.faq.form.addTitle}</DialogTitle>
            <DialogDescription>{t.faq.form.description}</DialogDescription>
          </DialogHeader>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="faq-pertanyaan">{t.faq.form.question}</Label>
            <Textarea
              id="faq-pertanyaan"
              required
              autoFocus
              rows={2}
              minLength={5}
              maxLength={500}
              placeholder={t.faq.form.questionPlaceholder}
              value={pertanyaan}
              disabled={sibuk}
              onChange={(e) => setPertanyaan(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-jawaban">{t.faq.form.answer}</Label>
            <Textarea
              id="faq-jawaban"
              required
              rows={7}
              minLength={10}
              maxLength={MAKS_JAWABAN}
              placeholder={t.faq.form.answerPlaceholder}
              value={jawaban}
              disabled={sibuk}
              onChange={(e) => setJawaban(e.target.value)}
            />
            <p className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span className="text-pretty">{t.faq.form.answerHint}</span>
              <span className="shrink-0 tabular-nums">
                {f.number(jawaban.length)}/{f.number(MAKS_JAWABAN)}
              </span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="faq-unit">{t.faq.columns.unit}</Label>
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
                {unitTerkunci !== null ? t.faq.form.unitLocked : t.faq.form.unitHint}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-valid-until">
                {t.upload.validUntil}{" "}
                <span className="font-normal text-muted-foreground">{t.upload.optional}</span>
              </Label>
              <DateField
                id="faq-valid-until"
                min={hariIni}
                spanFrom={hariIni}
                value={validUntil}
                disabled={sibuk}
                onChange={setValidUntil}
                placeholder={t.upload.noExpiry}
                clearLabel={t.upload.clearExpiry}
              />
              <p className="text-xs text-pretty text-muted-foreground">{t.faq.form.expiryHint}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sibuk}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={sibuk}>
              {sibuk ? t.common.saving : editing ? t.common.save : t.faq.form.submitAdd}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteFaqDialog({ entry, onClose }: { entry: Faq | null; onClose: () => void }) {
  const t = useT()
  const remove = useDeleteFaq()

  function hapus() {
    if (!entry) return
    remove.mutate(entry.id, {
      onSuccess: () => {
        toast.success(t.faq.remove.deleted, {
          description: `“${truncate(entry.pertanyaan, 70)}”`,
        })
        onClose()
      },
      onError: (error) => toast.error(t.common.deleteFailed, { description: error.message }),
    })
  }

  return (
    <AlertDialog
      open={entry !== null}
      onOpenChange={(open) => !open && !remove.isPending && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.faq.remove.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.faq.remove.body(entry ? truncate(entry.pertanyaan, 100) : "")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>{t.common.cancel}</AlertDialogCancel>
          <Button variant="destructive" onClick={hapus} disabled={remove.isPending}>
            {remove.isPending ? t.faq.remove.deleting : t.faq.remove.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
