"use client"

import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { QueryError } from "@/components/common"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { Schemas } from "@/lib/api/client"
import {
  useCreateUnitContact,
  useDeleteUnitContact,
  useUnitContacts,
  useUpdateUnitContact,
} from "@/lib/api/queries"
import { useT } from "@/lib/i18n"

type Contact = Schemas["AdminUnitContact"]
type View = { mode: "daftar" } | { mode: "buat" } | { mode: "ubah"; kontak: Contact }

/**
 * Kontak PIC satu unit. Tampil di banner eskalasi dan teks penolakan widget
 * mahasiswa begitu disimpan; unit tanpa kontak memakai Front Office. Kontak
 * berkata kunci hanya tampil untuk pertanyaan yang menyebut salah satunya
 * (`pilih_kontak` di api/app/rag/risk.py).
 */
export function UnitContactsDialog({ unit, onClose }: { unit: string; onClose: () => void }) {
  const [view, setView] = useState<View>({ mode: "daftar" })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        {view.mode === "daftar" ? (
          <ContactList
            unit={unit}
            onAdd={() => setView({ mode: "buat" })}
            onEdit={(kontak) => setView({ mode: "ubah", kontak })}
            onClose={onClose}
          />
        ) : (
          <ContactForm
            key={view.mode === "ubah" ? view.kontak.id : "baru"}
            unit={unit}
            editing={view.mode === "ubah" ? view.kontak : null}
            onDone={() => setView({ mode: "daftar" })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ContactList({
  unit,
  onAdd,
  onEdit,
  onClose,
}: {
  unit: string
  onAdd: () => void
  onEdit: (kontak: Contact) => void
  onClose: () => void
}) {
  const t = useT()
  const contacts = useUnitContacts(unit)
  const create = useCreateUnitContact()
  const remove = useDeleteUnitContact()

  function hapus(kontak: Contact) {
    remove.mutate(
      { name: unit, id: kontak.id },
      {
        onSuccess: () =>
          toast.success(t.units.contacts.deleted, {
            description: t.units.contacts.deletedBody(kontak.label),
            action: {
              label: t.common.undo,
              onClick: () =>
                create.mutate(
                  {
                    name: unit,
                    body: {
                      label: kontak.label,
                      phone: kontak.phone ?? null,
                      whatsapp: kontak.whatsapp ?? null,
                      email: kontak.email ?? null,
                      service_hours: kontak.service_hours ?? null,
                      sort_order: kontak.sort_order,
                      keywords: kontak.keywords ?? [],
                    },
                  },
                  {
                    onError: (error) =>
                      toast.error(t.common.saveFailed, { description: error.message }),
                  }
                ),
            },
          }),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t.units.contacts.title(unit)}</DialogTitle>
        <DialogDescription>{t.units.contacts.description}</DialogDescription>
      </DialogHeader>

      {contacts.error ? (
        <QueryError error={contacts.error} onRetry={() => contacts.refetch()} />
      ) : !contacts.data ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : contacts.data.length === 0 ? (
        <Alert>
          <AlertDescription>{t.units.contacts.empty}</AlertDescription>
        </Alert>
      ) : (
        <ul className="max-h-[60vh] divide-y overflow-y-auto rounded-lg border">
          {contacts.data.map((kontak) => (
            <li key={kontak.id} className="flex items-start gap-3 p-3">
              <span className="w-6 pt-0.5 text-right text-xs text-muted-foreground tabular-nums">
                {kontak.sort_order}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-medium break-words">{kontak.label}</p>
                <p className="break-words">{kontak.display}</p>
                {kontak.service_hours ? (
                  <p className="text-xs text-muted-foreground">{kontak.service_hours}</p>
                ) : null}
                {kontak.keywords?.length ? (
                  <p className="text-xs break-words text-muted-foreground">
                    {t.units.contacts.keywordsOnly(kontak.keywords.join(", "))}
                  </p>
                ) : null}
                {kontak.updated_by ? (
                  <p className="text-xs text-muted-foreground">
                    {t.units.contacts.updatedBy(kontak.updated_by)}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.units.contacts.editAria(kontak.label)}
                onClick={() => onEdit(kontak)}
              >
                <PencilIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.units.contacts.deleteAria(kontak.label)}
                disabled={remove.isPending}
                onClick={() => hapus(kontak)}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t.units.contacts.close}
        </Button>
        <Button type="button" onClick={onAdd}>
          <PlusIcon data-icon="inline-start" />
          {t.units.contacts.add}
        </Button>
      </DialogFooter>
    </>
  )
}

/** Sama dengan `susun_kontak` di api/app/units.py: label kanal menentukan tautannya di widget. */
function teksKontak(telepon: string, whatsapp: string, email: string): string {
  return [
    telepon && `Telepon ${telepon}`,
    whatsapp && `WhatsApp ${whatsapp}`,
    email,
  ]
    .filter(Boolean)
    .join(" / ")
}

function rapikan(teks: string): string {
  return teks.split(/\s+/).filter(Boolean).join(" ")
}

/** "PLK, plk,  luar kampus" -> ["PLK", "luar kampus"]; aturannya sama dengan API. */
function daftarKataKunci(teks: string): string[] {
  const hasil: string[] = []
  for (const kata of teks.split(",").map(rapikan)) {
    if (kata && !hasil.some((k) => k.toLowerCase() === kata.toLowerCase())) hasil.push(kata)
  }
  return hasil
}

function ContactForm({
  unit,
  editing,
  onDone,
}: {
  unit: string
  editing: Contact | null
  onDone: () => void
}) {
  const t = useT()
  const f = t.units.contacts.form
  const create = useCreateUnitContact()
  const update = useUpdateUnitContact()

  const [label, setLabel] = useState(editing?.label ?? "")
  const [whatsapp, setWhatsapp] = useState(editing?.whatsapp ?? "")
  const [telepon, setTelepon] = useState(editing?.phone ?? "")
  const [email, setEmail] = useState(editing?.email ?? "")
  const [jam, setJam] = useState(editing?.service_hours ?? "")
  const [urutan, setUrutan] = useState(editing ? String(editing.sort_order) : "")
  const [kataKunci, setKataKunci] = useState((editing?.keywords ?? []).join(", "))
  const [galat, setGalat] = useState<string | null>(null)

  const sibuk = create.isPending || update.isPending
  const isian = {
    label: rapikan(label),
    whatsapp: rapikan(whatsapp),
    phone: rapikan(telepon),
    email: email.trim(),
    service_hours: rapikan(jam),
    keywords: daftarKataKunci(kataKunci),
  }
  const tampil = teksKontak(isian.phone, isian.whatsapp, isian.email)

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGalat(null)
    if (!tampil) {
      setGalat(f.needChannel)
      return
    }
    const angka = urutan.trim() === "" ? null : Number(urutan)

    if (!editing) {
      create.mutate(
        {
          name: unit,
          body: {
            label: isian.label,
            whatsapp: isian.whatsapp || null,
            phone: isian.phone || null,
            email: isian.email || null,
            service_hours: isian.service_hours || null,
            sort_order: angka,
            keywords: isian.keywords,
          },
        },
        {
          onSuccess: (data) => {
            toast.success(t.units.contacts.created, { description: data.label })
            onDone()
          },
          onError: (error) => setGalat(error.message),
        }
      )
      return
    }

    const body: Schemas["AdminUnitContactUpdate"] = {}
    if (isian.label !== editing.label) body.label = isian.label
    for (const kunci of ["whatsapp", "phone", "email", "service_hours"] as const) {
      if (isian[kunci] !== (editing[kunci] ?? "")) body[kunci] = isian[kunci] || null
    }
    if (angka !== null && angka !== editing.sort_order) body.sort_order = angka
    if (JSON.stringify(isian.keywords) !== JSON.stringify(editing.keywords ?? [])) {
      body.keywords = isian.keywords
    }
    if (Object.keys(body).length === 0) {
      onDone()
      return
    }
    update.mutate(
      { name: unit, id: editing.id, body },
      {
        onSuccess: (data) => {
          toast.success(t.units.contacts.updated, { description: data.label })
          onDone()
        },
        onError: (error) => setGalat(error.message),
      }
    )
  }

  return (
    <form onSubmit={simpan} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{editing ? f.editTitle : f.addTitle}</DialogTitle>
        <DialogDescription>{t.units.contacts.title(unit)}</DialogDescription>
      </DialogHeader>

      {galat ? (
        <Alert variant="destructive">
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="kontak-label">{f.label}</Label>
        <Input
          id="kontak-label"
          required
          autoFocus
          autoComplete="off"
          maxLength={200}
          placeholder={f.labelPlaceholder}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <p className="text-xs text-pretty text-muted-foreground">{f.labelHint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kontak-whatsapp">{f.whatsapp}</Label>
          <Input
            id="kontak-whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            maxLength={40}
            placeholder="+62 812-3456-7890"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kontak-telepon">{f.phone}</Label>
          <Input
            id="kontak-telepon"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            maxLength={40}
            placeholder="(0361) 256995"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="kontak-email">{f.email}</Label>
          <Input
            id="kontak-email"
            type="email"
            autoComplete="off"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <p className="text-xs text-pretty text-muted-foreground sm:col-span-2">
          {f.channelsHint}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="kontak-jam">
            {f.hours} <span className="font-normal text-muted-foreground">{f.optional}</span>
          </Label>
          <Input
            id="kontak-jam"
            autoComplete="off"
            maxLength={200}
            placeholder={f.hoursPlaceholder}
            value={jam}
            onChange={(e) => setJam(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kontak-urutan">
            {f.order}{" "}
            {editing ? null : (
              <span className="font-normal text-muted-foreground">{f.optional}</span>
            )}
          </Label>
          <Input
            id="kontak-urutan"
            type="number"
            inputMode="numeric"
            min={0}
            max={10000}
            step={1}
            required={!!editing}
            className="w-28"
            value={urutan}
            onChange={(e) => setUrutan(e.target.value)}
          />
        </div>
        <p className="text-xs text-pretty text-muted-foreground sm:col-span-2">{f.orderHint}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kontak-kata-kunci">
          {f.keywords} <span className="font-normal text-muted-foreground">{f.optional}</span>
        </Label>
        <Input
          id="kontak-kata-kunci"
          autoComplete="off"
          placeholder={f.keywordsPlaceholder}
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
        />
        <p className="text-xs text-pretty text-muted-foreground">{f.keywordsHint}</p>
      </div>

      {tampil && isian.label ? (
        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">{f.preview}</p>
          <p className="break-words">
            - {isian.label}
            {isian.service_hours ? ` (${isian.service_hours})` : ""}: {tampil}
          </p>
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={sibuk}>
          <ArrowLeftIcon data-icon="inline-start" />
          {t.units.contacts.back}
        </Button>
        <Button type="submit" disabled={sibuk}>
          {sibuk ? t.common.saving : editing ? t.common.save : f.submitCreate}
        </Button>
      </DialogFooter>
    </form>
  )
}
