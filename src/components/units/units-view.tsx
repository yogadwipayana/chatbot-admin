"use client"

import {
  Building2Icon,
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { StatusLabel } from "@/components/status"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import type { Schemas } from "@/lib/api/client"
import { useAdminUnits, useCreateUnit, useUpdateUnit } from "@/lib/api/queries"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Unit = Schemas["AdminUnit"]
type FormState = { mode: "buat" } | { mode: "ubah"; unit: Unit }

export function UnitsView() {
  const t = useT()
  const units = useAdminUnits()
  const update = useUpdateUnit()
  const [form, setForm] = useState<FormState | null>(null)

  function alihAktif(unit: Unit) {
    const aktifkan = !unit.is_active
    update.mutate(
      { nama: unit.nama, body: { is_active: aktifkan } },
      {
        onSuccess: () =>
          toast.success(aktifkan ? t.units.activated : t.units.deactivated, {
            description: aktifkan
              ? t.units.activatedBody(unit.nama)
              : t.units.deactivatedBody(unit.nama),
            action: {
              label: t.common.undo,
              onClick: () =>
                update.mutate({ nama: unit.nama, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title={t.units.title}
        description={t.units.description}
        actions={
          <Button onClick={() => setForm({ mode: "buat" })}>
            <PlusIcon data-icon="inline-start" />
            {t.units.add}
          </Button>
        }
      />

      {units.error ? (
        <QueryError error={units.error} onRetry={() => units.refetch()} />
      ) : !units.data ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : units.data.length === 0 ? (
        <EmptyState icon={Building2Icon} title={t.units.empty} />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 pl-4">{t.units.columns.order}</TableHead>
                <TableHead className="min-w-56">{t.units.columns.unit}</TableHead>
                <TableHead className="text-right">{t.units.columns.documents}</TableHead>
                <TableHead className="text-right">{t.units.columns.accounts}</TableHead>
                <TableHead>{t.units.columns.status}</TableHead>
                <TableHead className="w-12 pr-4">
                  <span className="sr-only">{t.documents.columns.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.data.map((unit) => (
                <TableRow
                  key={unit.nama}
                  className={cn(!unit.is_active && "text-muted-foreground")}
                >
                  <TableCell className="pl-4 tabular-nums">{unit.urutan}</TableCell>
                  <TableCell className="whitespace-normal">
                    <p className="font-medium text-foreground">{unit.nama}</p>
                    {unit.deskripsi ? (
                      <p className="text-xs text-muted-foreground">{unit.deskripsi}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{unit.jumlah_dokumen}</TableCell>
                  <TableCell className="text-right tabular-nums">{unit.jumlah_akun}</TableCell>
                  <TableCell>
                    {unit.is_active ? (
                      <StatusLabel level="good">{t.units.active}</StatusLabel>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <EyeOffIcon className="size-4" aria-hidden />
                        {t.units.inactive}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t.units.rowActions(unit.nama)}
                        >
                          <EllipsisIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setForm({ mode: "ubah", unit })}>
                          <PencilIcon /> {t.units.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => alihAktif(unit)}>
                          {unit.is_active ? (
                            <>
                              <EyeOffIcon /> {t.units.deactivate}
                            </>
                          ) : (
                            <>
                              <EyeIcon /> {t.units.activate}
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {form ? (
        <UnitFormDialog
          key={form.mode === "ubah" ? form.unit.nama : "baru"}
          state={form}
          onClose={() => setForm(null)}
        />
      ) : null}
    </>
  )
}

function UnitFormDialog({ state, onClose }: { state: FormState; onClose: () => void }) {
  const t = useT()
  const editing = state.mode === "ubah" ? state.unit : null
  const create = useCreateUnit()
  const update = useUpdateUnit()

  const [nama, setNama] = useState(editing?.nama ?? "")
  const [deskripsi, setDeskripsi] = useState(editing?.deskripsi ?? "")
  const [urutan, setUrutan] = useState(editing ? String(editing.urutan) : "")
  const [galat, setGalat] = useState<string | null>(null)

  const sibuk = create.isPending || update.isPending
  const ganti = !!editing && nama.trim() !== "" && nama.trim() !== editing.nama

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGalat(null)
    const angka = urutan.trim() === "" ? null : Number(urutan)

    if (!editing) {
      create.mutate(
        { nama: nama.trim(), deskripsi: deskripsi.trim() || null, urutan: angka },
        {
          onSuccess: (data) => {
            toast.success(t.units.form.created, { description: data.nama })
            onClose()
          },
          onError: (error) => setGalat(error.message),
        }
      )
      return
    }

    const body: Schemas["AdminUnitUpdate"] = {}
    if (nama.trim() !== editing.nama) body.nama = nama.trim()
    if (deskripsi.trim() !== (editing.deskripsi ?? "")) body.deskripsi = deskripsi.trim() || null
    if (angka !== null && angka !== editing.urutan) body.urutan = angka
    if (Object.keys(body).length === 0) {
      onClose()
      return
    }
    update.mutate(
      { nama: editing.nama, body },
      {
        onSuccess: (data) => {
          toast.success(t.units.form.updated, { description: data.nama })
          onClose()
        },
        onError: (error) => setGalat(error.message),
      }
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !sibuk && onClose()}>
      <DialogContent>
        <form onSubmit={simpan} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{editing ? t.units.form.editTitle : t.units.form.addTitle}</DialogTitle>
            <DialogDescription>
              {editing ? editing.nama : t.units.form.addDescription}
            </DialogDescription>
          </DialogHeader>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="unit-nama">{t.units.form.name}</Label>
            <Input
              id="unit-nama"
              required
              autoFocus={!editing}
              autoComplete="off"
              maxLength={200}
              pattern="[^/]+"
              placeholder={t.units.form.namePlaceholder}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <p className="text-xs text-pretty text-muted-foreground">{t.units.form.nameHint}</p>
            {ganti && editing ? (
              <Alert>
                <AlertDescription>
                  {t.units.form.renameWarning(editing.jumlah_dokumen, editing.jumlah_akun)}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-deskripsi">
              {t.units.form.description}{" "}
              <span className="font-normal text-muted-foreground">{t.units.form.optional}</span>
            </Label>
            <Input
              id="unit-deskripsi"
              autoComplete="off"
              maxLength={500}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
            <p className="text-xs text-pretty text-muted-foreground">
              {t.units.form.descriptionHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-urutan">
              {t.units.form.order}{" "}
              {editing ? null : (
                <span className="font-normal text-muted-foreground">{t.units.form.optional}</span>
              )}
            </Label>
            <Input
              id="unit-urutan"
              type="number"
              inputMode="numeric"
              min={0}
              max={10000}
              step={1}
              required={!!editing}
              className="w-32"
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
            />
            <p className="text-xs text-pretty text-muted-foreground">{t.units.form.orderHint}</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sibuk}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={sibuk}>
              {sibuk ? t.common.saving : editing ? t.common.save : t.units.form.submitCreate}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
