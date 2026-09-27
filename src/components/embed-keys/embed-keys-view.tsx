"use client"

import {
  CheckIcon,
  CodeXmlIcon,
  CopyIcon,
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { StatusLabel } from "@/components/status"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import {
  useCreateEmbedKey,
  useDeleteEmbedKey,
  useEmbedKeys,
  useUpdateEmbedKey,
} from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type EmbedKey = Schemas["EmbedKey"]
type FormState = { mode: "buat" } | { mode: "ubah"; kunci: EmbedKey }
type Kode = { kunci: EmbedKey; baru: boolean }

/** Situs yang tampil per baris; sisanya diringkas "+N" supaya baris tetap rendah. */
const SITUS_TAMPIL = 3

export function EmbedKeysView() {
  const t = useT()
  const f = useFormat()
  const now = useNow()
  const keys = useEmbedKeys()
  const update = useUpdateEmbedKey()

  const [form, setForm] = useState<FormState | null>(null)
  const [kode, setKode] = useState<Kode | null>(null)
  const [hapus, setHapus] = useState<EmbedKey | null>(null)

  /** Dapat dibatalkan lewat toast, jadi tanpa dialog konfirmasi. */
  function alihAktif(kunci: EmbedKey) {
    const aktifkan = !kunci.is_active
    update.mutate(
      { key: kunci.key, body: { is_active: aktifkan } },
      {
        onSuccess: () =>
          toast.success(aktifkan ? t.embedKeys.activated : t.embedKeys.deactivated, {
            description: aktifkan
              ? t.embedKeys.activatedBody(kunci.name)
              : t.embedKeys.deactivatedBody(kunci.name),
            action: {
              label: t.common.undo,
              onClick: () =>
                update.mutate({ key: kunci.key, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title={t.embedKeys.title}
        description={t.embedKeys.description}
        actions={
          <Button onClick={() => setForm({ mode: "buat" })}>
            <PlusIcon data-icon="inline-start" />
            {t.embedKeys.add}
          </Button>
        }
      />

      {keys.error ? (
        <QueryError error={keys.error} onRetry={() => keys.refetch()} />
      ) : !keys.data ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : keys.data.length === 0 ? (
        <EmptyState
          icon={CodeXmlIcon}
          title={t.embedKeys.empty}
          description={t.embedKeys.emptyBody}
          action={
            <Button onClick={() => setForm({ mode: "buat" })}>{t.embedKeys.add}</Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-56 pl-4">{t.embedKeys.columns.site}</TableHead>
                  <TableHead className="min-w-56">{t.embedKeys.columns.allowed}</TableHead>
                  <TableHead>{t.embedKeys.columns.status}</TableHead>
                  <TableHead className="text-right">{t.embedKeys.columns.questions}</TableHead>
                  <TableHead>{t.embedKeys.columns.lastUsed}</TableHead>
                  <TableHead className="w-12 pr-4">
                    <span className="sr-only">{t.embedKeys.columns.actions}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.data.map((kunci) => (
                  <TableRow
                    key={kunci.key}
                    className={cn(!kunci.is_active && "text-muted-foreground")}
                  >
                    <TableCell className="pl-4 whitespace-normal">
                      <p className="font-medium text-foreground">{kunci.name}</p>
                      <p className="font-mono text-xs break-all text-muted-foreground">
                        {kunci.key}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <DaftarSitus asal={kunci.allowed_origins} />
                    </TableCell>
                    <TableCell>
                      {kunci.is_active ? (
                        <StatusLabel level="good">{t.embedKeys.active}</StatusLabel>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <EyeOffIcon className="size-4" aria-hidden />
                          {t.embedKeys.inactive}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {f.number(kunci.questions_30d)}
                    </TableCell>
                    <TableCell
                      title={kunci.last_used_at ? f.dateTime(kunci.last_used_at) : undefined}
                    >
                      {kunci.last_used_at ? (
                        f.relative(kunci.last_used_at, now)
                      ) : (
                        <span className="text-muted-foreground">{t.embedKeys.neverUsed}</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={update.isPending && update.variables?.key === kunci.key}
                            aria-label={t.embedKeys.rowActions(kunci.name)}
                          >
                            <EllipsisIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setKode({ kunci, baru: false })}>
                            <CodeXmlIcon /> {t.embedKeys.copyCode}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setForm({ mode: "ubah", kunci })}>
                            <PencilIcon /> {t.embedKeys.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => alihAktif(kunci)}>
                            {kunci.is_active ? (
                              <>
                                <EyeOffIcon /> {t.embedKeys.deactivate}
                              </>
                            ) : (
                              <>
                                <EyeIcon /> {t.embedKeys.activate}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setHapus(kunci)}>
                            <Trash2Icon /> {t.embedKeys.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="flex gap-2 pt-1 text-xs text-pretty text-muted-foreground">
            <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>{t.embedKeys.notSecret}</span>
          </p>
        </div>
      )}

      {form ? (
        <EmbedKeyFormDialog
          key={form.mode === "ubah" ? form.kunci.key : "baru"}
          state={form}
          onClose={() => setForm(null)}
          onCreated={(kunci) => setKode({ kunci, baru: true })}
        />
      ) : null}
      {kode ? (
        <EmbedCodeDialog key={kode.kunci.key} value={kode} onClose={() => setKode(null)} />
      ) : null}
      <DeleteEmbedKeyDialog kunci={hapus} onClose={() => setHapus(null)} />
    </>
  )
}

/**
 * Daftar kosong berarti situs mana pun -- keadaan yang sah, tetapi tidak boleh
 * terlupa di produksi, jadi ditandai peringatan, bukan dibiarkan sel kosong.
 */
function DaftarSitus({ asal }: { asal: string[] }) {
  const t = useT()
  if (asal.length === 0) {
    return (
      <span title={t.embedKeys.anySiteHint}>
        <StatusLabel level="warning">{t.embedKeys.anySite}</StatusLabel>
        <span className="sr-only"> — {t.embedKeys.anySiteHint}</span>
      </span>
    )
  }
  const sisa = asal.length - SITUS_TAMPIL
  return (
    <ul className="space-y-0.5 text-sm">
      {asal.slice(0, SITUS_TAMPIL).map((a) => (
        <li key={a} className="break-all">
          {a}
        </li>
      ))}
      {sisa > 0 ? (
        <li className="text-xs text-muted-foreground" title={asal.slice(SITUS_TAMPIL).join("\n")}>
          +{sisa}
        </li>
      ) : null}
    </ul>
  )
}

function EmbedKeyFormDialog({
  state,
  onClose,
  onCreated,
}: {
  state: FormState
  onClose: () => void
  onCreated: (kunci: EmbedKey) => void
}) {
  const t = useT()
  const editing = state.mode === "ubah" ? state.kunci : null
  const create = useCreateEmbedKey()
  const update = useUpdateEmbedKey()

  const [nama, setNama] = useState(editing?.name ?? "")
  // Selalu ada satu baris isian, supaya jelas di mana domain diketik; baris
  // kosong dibuang saat dikirim.
  const [situs, setSitus] = useState<string[]>(
    editing && editing.allowed_origins.length > 0 ? editing.allowed_origins : [""]
  )
  const [galat, setGalat] = useState<string | null>(null)

  const sibuk = create.isPending || update.isPending
  const terisi = situs.map((s) => s.trim()).filter(Boolean)

  function ubahSitus(index: number, nilai: string) {
    setSitus((daftar) => daftar.map((s, i) => (i === index ? nilai : s)))
  }

  function hapusSitus(index: number) {
    setSitus((daftar) => (daftar.length === 1 ? [""] : daftar.filter((_, i) => i !== index)))
  }

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGalat(null)

    if (!editing) {
      create.mutate(
        { name: nama.trim(), allowed_origins: terisi },
        {
          onSuccess: (kunci) => {
            onClose()
            onCreated(kunci)
          },
          onError: (error) => setGalat(error.message),
        }
      )
      return
    }

    const body: Schemas["EmbedKeyUpdate"] = {}
    if (nama.trim() !== editing.name) body.name = nama.trim()
    if (terisi.join("\n") !== editing.allowed_origins.join("\n")) body.allowed_origins = terisi
    if (Object.keys(body).length === 0) {
      onClose()
      return
    }
    update.mutate(
      { key: editing.key, body },
      {
        onSuccess: (kunci) => {
          toast.success(t.embedKeys.form.updated, { description: kunci.name })
          onClose()
        },
        onError: (error) => setGalat(error.message),
      }
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !sibuk && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={simpan} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.embedKeys.form.editTitle : t.embedKeys.form.addTitle}
            </DialogTitle>
            <DialogDescription>
              {editing ? t.embedKeys.form.editDescription : t.embedKeys.form.addDescription}
            </DialogDescription>
          </DialogHeader>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="sematan-nama">{t.embedKeys.form.name}</Label>
            <Input
              id="sematan-nama"
              required
              autoFocus={!editing}
              autoComplete="off"
              maxLength={200}
              placeholder={t.embedKeys.form.namePlaceholder}
              value={nama}
              disabled={sibuk}
              onChange={(e) => setNama(e.target.value)}
            />
            <p className="text-xs text-pretty text-muted-foreground">{t.embedKeys.form.nameHint}</p>
          </div>

          <fieldset className="space-y-2" disabled={sibuk}>
            <legend className="mb-2 text-sm font-medium">
              {t.embedKeys.form.sites}{" "}
              <span className="font-normal text-muted-foreground">{t.embedKeys.form.optional}</span>
            </legend>
            {situs.map((nilai, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={255}
                  placeholder={t.embedKeys.form.sitePlaceholder}
                  aria-label={t.embedKeys.form.siteLabel(index + 1)}
                  value={nilai}
                  onChange={(e) => ubahSitus(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label={t.embedKeys.form.removeSite(nilai.trim())}
                  disabled={situs.length === 1 && !nilai}
                  onClick={() => hapusSitus(index)}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={situs.length >= 20}
              onClick={() => setSitus((daftar) => [...daftar, ""])}
            >
              <PlusIcon data-icon="inline-start" />
              {t.embedKeys.form.addSite}
            </Button>
            <p className="text-xs text-pretty text-muted-foreground">
              {t.embedKeys.form.sitesHint}
            </p>
            {terisi.length === 0 ? (
              <StatusLabel level="warning" className="text-xs">
                {t.embedKeys.form.sitesEmpty}
              </StatusLabel>
            ) : null}
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sibuk}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={sibuk}>
              {sibuk
                ? t.common.saving
                : editing
                  ? t.common.save
                  : t.embedKeys.form.submitCreate}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Kode sematan siap tempel. Kunci bukan rahasia, jadi -- tidak seperti kata
 * sandi sementara di halaman Admin -- dialog ini dapat dibuka lagi kapan saja
 * dari menu baris.
 */
function EmbedCodeDialog({ value, onClose }: { value: Kode; onClose: () => void }) {
  const t = useT()
  const [tersalin, setTersalin] = useState(false)
  const { kunci, baru } = value
  const kode =
    kunci.embed_code ??
    `<script src="https://<domain-portal>/embed.js" data-key="${kunci.key}" async></script>`

  async function salin() {
    try {
      await navigator.clipboard.writeText(kode)
      setTersalin(true)
    } catch {
      toast.error(t.embedKeys.code.copyFailed, { description: t.embedKeys.code.copyFailedBody })
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {baru ? t.embedKeys.code.createdTitle : t.embedKeys.code.title(kunci.name)}
          </DialogTitle>
          <DialogDescription>{t.embedKeys.code.description}</DialogDescription>
        </DialogHeader>

        {kunci.embed_code ? null : (
          <Alert>
            <TriangleAlertIcon className="text-status-warning" />
            <AlertTitle>{t.embedKeys.code.portalMissingTitle}</AlertTitle>
            <AlertDescription>{t.embedKeys.code.portalMissingBody}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="kode-sematan" className="sr-only">
            {t.embedKeys.code.label}
          </Label>
          <Textarea
            id="kode-sematan"
            readOnly
            rows={3}
            value={kode}
            className="resize-none font-mono text-xs break-all"
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={salin}>
              {tersalin ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <CopyIcon data-icon="inline-start" />
              )}
              {tersalin ? t.embedKeys.code.copied : t.embedKeys.code.copy}
            </Button>
          </div>
        </div>

        {kunci.allowed_origins.length === 0 ? (
          <StatusLabel level="warning" className="text-xs">
            {t.embedKeys.code.anySiteWarning}
          </StatusLabel>
        ) : null}
        <p className="text-xs text-pretty text-muted-foreground">{t.embedKeys.code.csp}</p>

        <DialogFooter>
          <Button onClick={onClose}>{t.embedKeys.code.done}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Konfirmasi hapus permanen, dengan "Nonaktifkan saja" sebagai jalan yang dapat dibatalkan. */
function DeleteEmbedKeyDialog({
  kunci,
  onClose,
}: {
  kunci: EmbedKey | null
  onClose: () => void
}) {
  const t = useT()
  const remove = useDeleteEmbedKey()
  const update = useUpdateEmbedKey()
  const sibuk = remove.isPending || update.isPending

  function hapus() {
    if (!kunci) return
    remove.mutate(kunci.key, {
      onSuccess: () => {
        toast.success(t.embedKeys.remove.deleted, { description: kunci.name })
        onClose()
      },
      onError: (error) => toast.error(t.common.deleteFailed, { description: error.message }),
    })
  }

  function nonaktifkan() {
    if (!kunci) return
    update.mutate(
      { key: kunci.key, body: { is_active: false } },
      {
        onSuccess: () => {
          toast.success(t.embedKeys.deactivated, {
            description: t.embedKeys.deactivatedBody(kunci.name),
          })
          onClose()
        },
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <AlertDialog open={kunci !== null} onOpenChange={(open) => !open && !sibuk && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.embedKeys.remove.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.embedKeys.remove.body(kunci?.name ?? "")}
            {kunci?.is_active ? t.embedKeys.remove.suggestDeactivate : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={sibuk}>{t.common.cancel}</AlertDialogCancel>
          {kunci?.is_active ? (
            <Button variant="outline" disabled={sibuk} onClick={nonaktifkan}>
              {t.embedKeys.remove.deactivateInstead}
            </Button>
          ) : null}
          <Button variant="destructive" disabled={sibuk} onClick={hapus}>
            {remove.isPending ? t.embedKeys.remove.deleting : t.embedKeys.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
