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
import { useId, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { StatusLabel } from "@/components/status"
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
  useDocuments,
  useMe,
  useResetPassword,
  useUpdateUser,
  useUsers,
} from "@/lib/api/queries"
import { formatRelative } from "@/lib/format"
import { ROLES, ROLE_LABELS, ROLE_RIGHTS, type Role } from "@/lib/roles"
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
          toast.success(aktifkan ? "Akun diaktifkan" : "Akun dinonaktifkan", {
            description: aktifkan
              ? `${user.email} dapat masuk kembali.`
              : `${user.email} langsung keluar dari semua sesinya.`,
            action: {
              label: "Batalkan",
              onClick: () => update.mutate({ id: user.id, body: { is_active: !aktifkan } }),
            },
          }),
        onError: (error) => toast.error("Gagal menyimpan", { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title="Admin"
        description="Kelola akun dashboard dan level aksesnya. Perubahan level, unit, dan status aktif berlaku seketika, termasuk untuk sesi yang sedang terbuka."
        actions={
          <Button onClick={() => setForm({ mode: "buat" })}>
            <UserPlusIcon data-icon="inline-start" />
            Tambah akun
          </Button>
        }
      />

      <RoleGuide />

      {users.error ? (
        <QueryError error={users.error} onRetry={() => users.refetch()} />
      ) : !users.data ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : users.data.length === 0 ? (
        <EmptyState icon={UsersRoundIcon} title="Belum ada akun" />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56 pl-4">Akun</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terakhir masuk</TableHead>
                <TableHead className="w-12 pr-4">
                  <span className="sr-only">Aksi</span>
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
                            (Anda)
                          </span>
                        ) : null}
                      </p>
                      {user.nama ? (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_BADGE[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {user.unit ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <StatusLabel level="good">Aktif</StatusLabel>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <EyeOffIcon className="size-4" aria-hidden />
                          Nonaktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.last_login_at ? (
                        formatRelative(user.last_login_at, now)
                      ) : (
                        <span className="text-muted-foreground">Belum pernah</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Aksi untuk ${user.email}`}
                          >
                            <EllipsisIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setForm({ mode: "ubah", user })}>
                            <PencilIcon /> Ubah
                          </DropdownMenuItem>
                          {diri ? null : (
                            <>
                              <DropdownMenuItem onSelect={() => setReset(user)}>
                                <KeyRoundIcon /> Atur ulang kata sandi
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => alihAktif(user)}>
                                {user.is_active ? (
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
                              <DropdownMenuItem variant="destructive" onSelect={() => setHapus(user)}>
                                <Trash2Icon /> Hapus
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
  return (
    <Card className="mb-6">
      <CardContent className="grid gap-6 sm:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role} className="space-y-2">
            <Badge variant={ROLE_BADGE[role]}>{ROLE_LABELS[role]}</Badge>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {ROLE_RIGHTS[role].map((hak) => (
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
  const editing = state.mode === "ubah" ? state.user : null
  const create = useCreateUser()
  const update = useUpdateUser()
  const unitListId = useId()
  const dokumen = useDocuments({ include_inactive: true, only_stale: false, limit: 200, offset: 0 })
  const units = [...new Set(dokumen.data?.items.map((d) => d.unit) ?? [])].sort()

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
          toast.success("Akun diperbarui", { description: editing.email })
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
            <DialogTitle>{editing ? "Ubah akun" : "Tambah akun"}</DialogTitle>
            <DialogDescription>
              {editing
                ? editing.email
                : "Kata sandi sementara dibuat otomatis dan ditampilkan sekali setelah akun tersimpan."}
            </DialogDescription>
          </DialogHeader>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          {editing ? null : (
            <div className="space-y-2">
              <Label htmlFor="akun-email">Email</Label>
              <Input
                id="akun-email"
                type="email"
                required
                autoFocus
                autoComplete="off"
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="akun-nama">
              Nama <span className="font-normal text-muted-foreground">(opsional)</span>
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
            <Label htmlFor="akun-level">Level</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)} disabled={diri}>
              <SelectTrigger id="akun-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-pretty text-muted-foreground">
              {diri
                ? "Level akun Anda sendiri tidak dapat diubah, supaya dashboard tidak terkunci tanpa superadmin."
                : `${ROLE_RIGHTS[role].join(" · ")}.`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="akun-unit">
              Unit{" "}
              {role === "staf" ? null : (
                <span className="font-normal text-muted-foreground">(opsional)</span>
              )}
            </Label>
            <Input
              id="akun-unit"
              required={role === "staf"}
              maxLength={200}
              list={unitListId}
              placeholder="Biro Keuangan"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <datalist id={unitListId}>
              {units.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
            <p className="text-xs text-pretty text-muted-foreground">
              {role === "staf"
                ? "Staf/dosen hanya dapat melihat dan mengelola dokumen dengan unit ini. Pilih dari saran supaya ejaannya sama persis dengan dokumen yang ada."
                : "Hanya keterangan; admin dan superadmin mengelola dokumen semua unit."}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sibuk}>
              Batal
            </Button>
            <Button type="submit" disabled={sibuk}>
              {sibuk ? "Menyimpan…" : editing ? "Simpan" : "Buat akun"}
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
  const reset = useResetPassword()

  function lanjut() {
    if (!user) return
    reset.mutate(user.id, {
      onSuccess: (data) => {
        onClose()
        onDone(user, data.password_sementara)
      },
      onError: (error) => toast.error("Gagal mengatur ulang", { description: error.message }),
    })
  }

  return (
    <AlertDialog open={user !== null} onOpenChange={(open) => !open && !reset.isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Atur ulang kata sandi?</AlertDialogTitle>
          <AlertDialogDescription>
            {user?.email} langsung keluar dari semua sesinya dan hanya dapat masuk dengan kata sandi
            sementara baru yang akan ditampilkan sekali.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={reset.isPending}>Batal</AlertDialogCancel>
          <Button onClick={lanjut} disabled={reset.isPending}>
            {reset.isPending ? "Memproses…" : "Atur ulang"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeleteUserDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const remove = useDeleteUser()

  function hapus() {
    if (!user) return
    remove.mutate(user.id, {
      onSuccess: () => {
        toast.success("Akun dihapus", { description: user.email })
        onClose()
      },
      onError: (error) => toast.error("Gagal menghapus", { description: error.message }),
    })
  }

  return (
    <AlertDialog open={user !== null} onOpenChange={(open) => !open && !remove.isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus akun secara permanen?</AlertDialogTitle>
          <AlertDialogDescription>
            {user?.email} dihapus dan langsung kehilangan akses. Dokumen yang pernah diunggahnya
            tidak ikut terhapus. Untuk menghentikan akses sementara, pilih Nonaktifkan saja.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Batal</AlertDialogCancel>
          <Button variant="destructive" onClick={hapus} disabled={remove.isPending}>
            {remove.isPending ? "Menghapus…" : "Hapus akun"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function PasswordRevealDialog({ value, onClose }: { value: Sandi; onClose: () => void }) {
  const [tersalin, setTersalin] = useState(false)

  async function salin() {
    try {
      await navigator.clipboard.writeText(value.password)
      setTersalin(true)
    } catch {
      toast.error("Tidak dapat menyalin otomatis", {
        description: "Pilih teks kata sandi, lalu salin secara manual.",
      })
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      {/* Klik di luar tidak menutup: kata sandi ini tidak dapat ditampilkan lagi. */}
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{value.baru ? "Akun dibuat" : "Kata sandi diatur ulang"}</DialogTitle>
          <DialogDescription>
            Kata sandi sementara untuk {value.email}. Hanya ditampilkan sekali ini; setelah jendela
            ditutup, kata sandi tidak dapat dilihat lagi.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            readOnly
            value={value.password}
            className="font-mono"
            aria-label="Kata sandi sementara"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button variant="outline" onClick={salin}>
            {tersalin ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
            {tersalin ? "Tersalin" : "Salin"}
          </Button>
        </div>
        <p className="text-xs text-pretty text-muted-foreground">
          Serahkan lewat jalur yang aman, bukan grup percakapan. Minta pemilik akun segera
          menggantinya lewat menu akun di pojok kiri bawah, pilih Ganti kata sandi.
        </p>
        <DialogFooter>
          <Button onClick={onClose}>Selesai</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
