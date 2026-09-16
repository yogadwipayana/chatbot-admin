"use client"

import { PowerIcon, PowerOffIcon } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { PageHeader, QueryError } from "@/components/common"
import { StatusLabel } from "@/components/status"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useNow } from "@/hooks/use-now"
import { useKillSwitch, useSetKillSwitch } from "@/lib/api/queries"
import { formatDateTime, formatRelative } from "@/lib/format"
import { CLOSED_MESSAGE } from "@/lib/labels"

type Konfirmasi = "matikan" | "nyalakan" | null

export function KillSwitchView() {
  const now = useNow()
  const state = useKillSwitch()
  const set = useSetKillSwitch()
  const [alasan, setAlasan] = useState("")
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi>(null)

  const data = state.data

  function matikan() {
    set.mutate(
      { engaged: true, alasan: alasan.trim() },
      {
        onSuccess: () => {
          setKonfirmasi(null)
          setAlasan("")
          toast.success("Layanan chat dimatikan", {
            description: "Mahasiswa kini melihat pesan penutupan.",
          })
        },
        onError: (error) => toast.error("Gagal mematikan layanan", { description: error.message }),
      }
    )
  }

  function nyalakan() {
    set.mutate(
      { engaged: false },
      {
        onSuccess: () => {
          setKonfirmasi(null)
          toast.success("Layanan chat aktif kembali")
        },
        onError: (error) => toast.error("Gagal menyalakan layanan", { description: error.message }),
      }
    )
  }

  function perbaruiAlasan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    set.mutate(
      { engaged: true, alasan: alasan.trim() },
      {
        onSuccess: () => {
          setAlasan("")
          toast.success("Catatan insiden diperbarui")
        },
        onError: (error) => toast.error("Gagal menyimpan", { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title="Layanan chat"
        description="Matikan chatbot mahasiswa dengan cepat saat insiden, tanpa menunggu pengelola teknis. Dashboard admin tetap dapat dipakai selama layanan dimatikan."
      />

      {state.error ? (
        <QueryError error={state.error} onRetry={() => state.refetch()} />
      ) : !data ? (
        <Skeleton className="h-64 w-full max-w-2xl rounded-xl" />
      ) : (
        <div className="grid max-w-2xl gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status saat ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.engaged ? (
                <>
                  <StatusLabel level="critical" className="text-base font-medium">
                    Layanan chat dimatikan
                  </StatusLabel>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    {data.engaged_at ? (
                      <>
                        <dt className="text-muted-foreground">Sejak</dt>
                        <dd>
                          {formatDateTime(data.engaged_at)}{" "}
                          <span className="text-muted-foreground">
                            ({formatRelative(data.engaged_at, now)})
                          </span>
                        </dd>
                      </>
                    ) : null}
                    <dt className="text-muted-foreground">Oleh</dt>
                    <dd className="min-w-0 break-words">{data.engaged_by ?? "Tidak tercatat"}</dd>
                    <dt className="text-muted-foreground">Alasan</dt>
                    <dd className="min-w-0 break-words">{data.reason}</dd>
                  </dl>
                  <div className="rounded-lg bg-muted/60 p-3 text-sm">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Yang dilihat mahasiswa
                    </p>
                    <p>“{CLOSED_MESSAGE}”</p>
                  </div>
                </>
              ) : (
                <StatusLabel level="good" className="text-base font-medium">
                  Layanan chat aktif: mahasiswa dapat bertanya seperti biasa
                </StatusLabel>
              )}
            </CardContent>
            {data.engaged ? (
              <CardFooter>
                <Button onClick={() => setKonfirmasi("nyalakan")} disabled={set.isPending}>
                  <PowerIcon data-icon="inline-start" />
                  Nyalakan kembali layanan chat
                </Button>
              </CardFooter>
            ) : null}
          </Card>

          {data.engaged ? (
            <Card>
              <CardHeader>
                <CardTitle>Perbarui catatan insiden</CardTitle>
                <CardDescription>
                  Lengkapi alasan bila penyebabnya sudah lebih jelas. Waktu mulai insiden tidak berubah.
                </CardDescription>
              </CardHeader>
              <form onSubmit={perbaruiAlasan}>
                <CardContent>
                  <Label htmlFor="alasan-baru" className="sr-only">
                    Alasan baru
                  </Label>
                  <Textarea
                    id="alasan-baru"
                    maxLength={500}
                    rows={3}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="mt-4 justify-end">
                  <Button type="submit" variant="outline" disabled={!alasan.trim() || set.isPending}>
                    Simpan catatan
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Matikan layanan chat</CardTitle>
                <CardDescription>
                  Gunakan bila chatbot memberi jawaban keliru pada informasi penting, disalahgunakan,
                  atau biaya API melonjak.
                </CardDescription>
              </CardHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setKonfirmasi("matikan")
                }}
              >
                <CardContent className="space-y-2">
                  <Label htmlFor="alasan">Alasan (wajib, untuk catatan insiden)</Label>
                  <Textarea
                    id="alasan"
                    required
                    maxLength={500}
                    rows={3}
                    placeholder="Contoh: chatbot menyebut batas pembayaran UKT yang salah"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="mt-4 justify-end">
                  <Button type="submit" variant="destructive" disabled={!alasan.trim() || set.isPending}>
                    <PowerOffIcon data-icon="inline-start" />
                    Matikan layanan chat
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-4 text-sm text-pretty text-muted-foreground">
                <li>
                  Kill switch wajib diuji sebelum rilis (PRD §14): matikan layanan, buka chatbot
                  mahasiswa dan pastikan pesan penutupan muncul, lalu nyalakan kembali.
                </li>
                <li>
                  Status ini tersimpan di memori server. Bila server dijalankan ulang, status kembali
                  mengikuti pengaturan <code className="text-foreground">KILL_SWITCH_ENABLED</code>.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog
        open={konfirmasi !== null}
        onOpenChange={(open) => !open && !set.isPending && setKonfirmasi(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {konfirmasi === "matikan" ? "Matikan layanan chat sekarang?" : "Nyalakan kembali layanan chat?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {konfirmasi === "matikan"
                ? `Semua mahasiswa langsung berhenti mendapat jawaban dan melihat: “${CLOSED_MESSAGE}”`
                : "Pastikan penyebab insiden sudah ditangani. Mahasiswa langsung dapat bertanya lagi."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={set.isPending}>Batal</AlertDialogCancel>
            {konfirmasi === "matikan" ? (
              <Button variant="destructive" disabled={set.isPending} onClick={matikan}>
                {set.isPending ? "Mematikan…" : "Ya, matikan"}
              </Button>
            ) : (
              <Button disabled={set.isPending} onClick={nyalakan}>
                {set.isPending ? "Menyalakan…" : "Ya, nyalakan"}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
