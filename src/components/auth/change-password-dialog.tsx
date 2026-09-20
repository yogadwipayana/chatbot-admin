"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

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
import { useChangePassword } from "@/lib/api/queries"
import { useT } from "@/lib/i18n"
import { setToken } from "@/lib/auth/token"

const PANJANG_MINIMUM = 12

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Form di-mount ulang setiap kali dibuka, supaya isian lama tidak tertinggal. */}
      {open ? <ChangePasswordForm onDone={() => onOpenChange(false)} /> : null}
    </Dialog>
  )
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const t = useT()
  const queryClient = useQueryClient()
  const change = useChangePassword()
  const [lama, setLama] = useState("")
  const [baru, setBaru] = useState("")
  const [ulang, setUlang] = useState("")

  const terlaluPendek = baru.length > 0 && baru.length < PANJANG_MINIMUM
  const tidakCocok = ulang.length > 0 && ulang !== baru
  const siap = lama.length > 0 && baru.length >= PANJANG_MINIMUM && baru === ulang

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!siap) return
    change.mutate(
      { password_lama: lama, password_baru: baru },
      {
        onSuccess: (data) => {
          // Token lama sudah tidak berlaku sejak kata sandi diganti.
          setToken(data.access_token)
          queryClient.invalidateQueries({ queryKey: ["me"] })
          toast.success(t.password.saved, { description: t.password.savedDetail })
          onDone()
        },
      }
    )
  }

  return (
    <DialogContent>
      <form onSubmit={simpan} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>{t.password.title}</DialogTitle>
          <DialogDescription>{t.password.description}</DialogDescription>
        </DialogHeader>

        {change.error ? (
          <Alert variant="destructive">
            <AlertDescription>{change.error.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="sandi-lama">{t.password.current}</Label>
          <Input
            id="sandi-lama"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            value={lama}
            onChange={(e) => setLama(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sandi-baru">{t.password.new}</Label>
          <Input
            id="sandi-baru"
            type="password"
            autoComplete="new-password"
            required
            minLength={PANJANG_MINIMUM}
            aria-invalid={terlaluPendek || undefined}
            value={baru}
            onChange={(e) => setBaru(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t.password.rule(PANJANG_MINIMUM)}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sandi-ulang">{t.password.repeat}</Label>
          <Input
            id="sandi-ulang"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={tidakCocok || undefined}
            value={ulang}
            onChange={(e) => setUlang(e.target.value)}
          />
          {tidakCocok ? (
            <p className="text-xs text-destructive">{t.password.mismatch}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone} disabled={change.isPending}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={!siap || change.isPending}>
            {change.isPending ? t.common.saving : t.password.title}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
