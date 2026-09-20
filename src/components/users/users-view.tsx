"use client"

import {
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  PencilIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersRoundIcon,
} from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { StatusLabel } from "@/components/status"
import { UnitField } from "@/components/unit-field"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import {
  useCreateUser,
  useDeleteUser,
  useMe,
  useResetPassword,
  useUnits,
  useUpdateUser,
  useUsers,
} from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"
import { ROLES, type Role } from "@/lib/roles"
import { cn } from "@/lib/utils"

type User = Schemas["AdminUser"]
type FormState = { mode: "buat" } | { mode: "ubah"; user: User }
type Sandi = { email: string; password: string; baru: boolean }

const ROLE_BADGE: Record<Role, "default" | "secondary" | "outline"> = {
  superadmin: "default",
  admin: "secondary",
  staf: "outline",
}

export function UsersView() {
  const t = useT()
  const f = useFormat()
  const now = useNow()
  const me = useMe().data
  const users = useUsers()
  const update = useUpdateUser()

  const [form, setForm] = useState<FormState | null>(null)
  const [reset, setReset] = useState<User | null>(null)
  const [hapus, setHapus] = useState<User | null>(null)
  const [sandi, setSandi] = useState<Sandi | null>(null)

  function alihAktif(user: User) {
    const aktifkan = !user.is_active
    update.mutate(
      { id: user.id, body: { is_active: aktifkan } },
      {
        onSuccess: () =>
          toast.success(aktifkan ? t.users.activated : t.users.deactivated, {
            description: aktifkan
              ? t.users.activatedBody(user.email)
              : t.users.deactivatedBody(user.email),
            action: {
              label: t.common.undo,
              onClick: () => update.mutate({ id: user.id, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title={t.users.title}
        description={t.users.description}
        actions={
          <Button onClick={() => setForm({ mode: "buat" })}>
            <UserPlusIcon data-icon="inline-start" />
            {t.users.add}
          </Button>
        }
      />

      <RoleGuide />

      {users.error ? (
        <QueryError error={users.error} onRetry={() => users.refetch()} />
      ) : !users.data ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : users.data.length === 0 ? (
        <EmptyState icon={UsersRoundIcon} title={t.users.empty} />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56 pl-4">{t.users.columns.account}</TableHead>
                <TableHead>{t.users.columns.level}</TableHead>
                <TableHead>{t.users.columns.unit}</TableHead>
                <TableHead>{t.users.columns.status}</TableHead>
                <TableHead>{t.users.columns.lastLogin}</TableHead>
                <TableHead className="w-12 pr-4">
                  <span className="sr-only">{t.documents.columns.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.map((user) => {
                const diri = user.id === me?.id
                return (
                  <TableRow key={user.id} className={cn(!user.is_active && "text-muted-foreground")}>
                    <TableCell className="pl-4 whitespace-normal">
                      <p className="font-medium text-foreground">
                        {user.nama || user.email}
                        {diri ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {t.users.you}
                          </span>
                        ) : null}
                      </p>
                      {user.nama ? (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_BADGE[user.role]}>{t.roles.labels[user.role]}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {user.unit ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <StatusLabel level="good">{t.users.active}</StatusLabel>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <EyeOffIcon className="size-4" aria-hidden />
                          {t.users.inactive}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.last_login_at ? (
                        f.relative(user.last_login_at, now)
                      ) : (
                        <span className="text-muted-foreground">{t.users.neverSignedIn}</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t.users.rowActions(user.email)}
                          >
                            <EllipsisIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setForm({ mode: "ubah", user })}>
                            <PencilIcon /> {t.users.edit}
                          </DropdownMenuItem>
                          {diri ? null : (
                            <>
                              <DropdownMenuItem onSelect={() => setReset(user)}>
                                <KeyRoundIcon /> {t.users.resetPassword}
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => alihAktif(user)}>
                                {user.is_active ? (
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
                              <DropdownMenuItem variant="destructive" onSelect={() => setHapus(user)}>
                                <Trash2Icon /> {t.users.delete}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {form ? (
        <UserFormDialog
          key={form.mode === "ubah" ? form.user.id : "baru"}
          state={form}
          selfId={me?.id}
          onClose={() => setForm(null)}
          onCreated={(user, password) => setSandi({ email: user.email, password, baru: true })}
        />
      ) : null}
      <ResetPasswordDialog
        user={reset}
        onClose={() => setReset(null)}
        onDone={(user, password) => setSandi({ email: user.email, password, baru: false })}
      />
      <DeleteUserDialog user={hapus} onClose={() => setHapus(null)} />
      {sandi ? (
        <PasswordRevealDialog key={sandi.password} value={sandi} onClose={() => setSandi(null)} />
      ) : null}
    </>
  )
}

function RoleGuide() {
  const t = useT()
  return (
    <Card className="mb-6">
      <CardContent className="grid gap-6 sm:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role} className="space-y-2">
            <Badge variant={ROLE_BADGE[role]}>{t.roles.labels[role]}</Badge>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {t.roles.rights[role].map((hak) => (
                <li key={hak} className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>{hak}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function UserFormDialog({
  state,
  selfId,
  onClose,
  onCreated,
}: {
  state: FormState
  selfId: string | undefined
  onClose: () => void
  onCreated: (user: User, password: string) => void
}) {
  const t = useT()
  const editing = state.mode === "ubah" ? state.user : null
  const create = useCreateUser()
  const update = useUpdateUser()
  const units = useUnits()

  const [email, setEmail] = useState(editing?.email ?? "")
  const [nama, setNama] = useState(editing?.nama ?? "")
  const [role, setRole] = useState<Role>(editing?.role ?? "staf")
  const [unit, setUnit] = useState(editing?.unit ?? "")
  const [galat, setGalat] = useState<string | null>(null)

  const diri = !!editing && editing.id === selfId
  const sibuk = create.isPending || update.isPending

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGalat(null)

    if (!editing) {
      create.mutate(
        { email: email.trim(), nama: nama.trim() || null, role, unit: unit.trim() || null },
        {
          onSuccess: (data) => {
            onClose()
            onCreated(data.user, data.password_sementara)
          },
          onError: (error) => setGalat(error.message),
        }
      )
      return
    }

    const body: Schemas["AdminUserUpdate"] = {}
    if (nama.trim() !== (editing.nama ?? "")) body.nama = nama.trim() || null
    if (role !== editing.role) body.role = role
    if (unit.trim() !== (editing.unit ?? "")) body.unit = unit.trim() || null
    if (Object.keys(body).length === 0) {
      onClose()
      return
    }
    update.mutate(
      { id: editing.id, body },
      {
        onSuccess: () => {
          toast.success(t.users.form.updated, { description: editing.email })
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
            <DialogTitle>
              {editing ? t.users.form.editTitle : t.users.form.addTitle}
            </DialogTitle>
            <DialogDescription>
              {editing ? editing.email : t.users.form.addDescription}
            </DialogDescription>
          </DialogHeader>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          {editing ? null : (
            <div className="space-y-2">
              <Label htmlFor="akun-email">{t.users.form.email}</Label>
              <Input
                id="akun-email"
                type="email"
                required
                autoFocus
                autoComplete="off"
                placeholder={t.users.form.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="akun-nama">
              {t.users.form.name}{" "}
              <span className="font-normal text-muted-foreground">{t.users.form.optional}</span>
            </Label>
            <Input
              id="akun-nama"
              maxLength={200}
              autoComplete="off"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="akun-level">{t.users.form.level}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)} disabled={diri}>
              <SelectTrigger id="akun-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t.roles.labels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-pretty text-muted-foreground">
              {diri
                ? t.users.form.selfLevel
                : `${t.roles.rights[role].join(" · ")}.`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="akun-unit">
              {t.users.form.unit}{" "}
              {role === "staf" ? null : (
                <span className="font-normal text-muted-foreground">{t.users.form.optional}</span>
              )}
            </Label>
            <UnitField
              id="akun-unit"
              required={role === "staf"}
              units={units}
              value={unit}
              onChange={setUnit}
              placeholder={t.users.form.unitPlaceholder}
            />
            <p className="text-xs text-pretty text-muted-foreground">
              {role === "staf" ? t.users.form.unitStaff : t.users.form.unitOther}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sibuk}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={sibuk}>
              {sibuk ? t.common.saving : editing ? t.common.save : t.users.form.submitCreate}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({
  user,
  onClose,
  onDone,
}: {
  user: User | null
  onClose: () => void
  onDone: (user: User, password: string) => void
}) {
  const t = useT()
  const reset = useResetPassword()

  function lanjut() {
    if (!user) return
    reset.mutate(user.id, {
      onSuccess: (data) => {
        onClose()
        onDone(user, data.password_sementara)
      },
      onError: (error) => toast.error(t.users.reset.failed, { description: error.message }),
    })
  }

  return (
    <AlertDialog open={user !== null} onOpenChange={(open) => !open && !reset.isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.users.reset.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.users.reset.body(user?.email ?? "")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={reset.isPending}>{t.common.cancel}</AlertDialogCancel>
          <Button onClick={lanjut} disabled={reset.isPending}>
            {reset.isPending ? t.users.reset.working : t.users.reset.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeleteUserDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const t = useT()
  const remove = useDeleteUser()

  function hapus() {
    if (!user) return
    remove.mutate(user.id, {
      onSuccess: () => {
        toast.success(t.users.remove.deleted, { description: user.email })
        onClose()
      },
      onError: (error) => toast.error(t.common.deleteFailed, { description: error.message }),
    })
  }

  return (
    <AlertDialog open={user !== null} onOpenChange={(open) => !open && !remove.isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.users.remove.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.users.remove.body(user?.email ?? "")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>{t.common.cancel}</AlertDialogCancel>
          <Button variant="destructive" onClick={hapus} disabled={remove.isPending}>
            {remove.isPending ? t.users.remove.deleting : t.users.remove.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function PasswordRevealDialog({ value, onClose }: { value: Sandi; onClose: () => void }) {
  const t = useT()
  const [tersalin, setTersalin] = useState(false)

  async function salin() {
    try {
      await navigator.clipboard.writeText(value.password)
      setTersalin(true)
    } catch {
      toast.error(t.users.password.copyFailed, {
        description: t.users.password.copyFailedBody,
      })
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      {/* Klik di luar tidak menutup: kata sandi ini tidak dapat ditampilkan lagi. */}
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {value.baru ? t.users.password.createdTitle : t.users.password.resetTitle}
          </DialogTitle>
          <DialogDescription>{t.users.password.description(value.email)}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            readOnly
            value={value.password}
            className="font-mono"
            aria-label={t.users.password.label}
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button variant="outline" onClick={salin}>
            {tersalin ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
            {tersalin ? t.users.password.copied : t.users.password.copy}
          </Button>
        </div>
        <p className="text-xs text-pretty text-muted-foreground">
          {t.users.password.handover}
        </p>
        <DialogFooter>
          <Button onClick={onClose}>{t.users.password.done}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
