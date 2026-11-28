"use client"

import { ArrowBigUpIcon, CircleAlertIcon, EyeIcon, EyeOffIcon, LoaderCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react"

import { LoginShowcase } from "@/components/auth/login-showcase"
import { AppLogo } from "@/components/layout/app-logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { useToken } from "@/hooks/use-token"
import { useLogin } from "@/lib/api/queries"
import { useLang, useT } from "@/lib/i18n"
import { LANGS, LANG_LABELS } from "@/lib/i18n/lang"
import { isTokenUsable, setToken } from "@/lib/auth/token"
import { setDocumentTitle } from "@/lib/document-title"
import { cn } from "@/lib/utils"

/**
 * Pilihan bahasa sebelum masuk. Menu bahasa di sidebar baru terjangkau setelah
 * masuk, padahal yang paling membutuhkannya adalah orang yang belum bisa
 * membaca halaman ini.
 */
function LanguageSwitch() {
  const t = useT()
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label={t.nav.account.language} className="inline-flex rounded-lg border bg-card p-0.5 shadow-xs">
      {LANGS.map((kode) => (
        <button
          key={kode}
          type="button"
          lang={kode}
          aria-label={LANG_LABELS[kode]}
          aria-pressed={lang === kode}
          onClick={() => setLang(kode)}
          className={cn(
            "h-6 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
            lang === kode && "bg-muted text-foreground"
          )}
        >
          {kode.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/**
 * Layar penuh dua kolom: form di kiri, panel merek gelap (`LoginShowcase`) di
 * kanan pada layar lebar. Tanpa tombol masuk lewat Google atau tautan daftar:
 * akun admin hanya dibuat oleh pengelola teknis.
 */
export function LoginForm({
  redirectTo,
  className,
  ...props
}: React.ComponentProps<"div"> & { redirectTo: string }) {
  const t = useT()
  const router = useRouter()
  const token = useToken()
  const login = useLogin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lihatSandi, setLihatSandi] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  useEffect(() => {
    setDocumentTitle(`${t.auth.pageTitle} | ${t.app.name}`)
  }, [t])

  // Sudah punya sesi yang masih berlaku: tidak perlu masuk lagi.
  useEffect(() => {
    if (isTokenUsable(token, Date.now())) router.replace(redirectTo)
  }, [token, redirectTo, router])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (data) => {
          setToken(data.access_token)
          router.replace(redirectTo)
        },
      }
    )
  }

  function cekCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"))
  }

  return (
    <div className={cn("grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]", className)} {...props}>
      <div className="flex flex-col gap-10 p-6 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AppLogo className="size-8" />
            <div className="grid leading-tight">
              <span className="text-sm font-bold">{t.app.short}</span>
              <span className="text-xs text-muted-foreground">{t.app.tagline}</span>
            </div>
          </div>
          <LanguageSwitch />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <form onSubmit={onSubmit} className="w-full max-w-sm">
            <FieldGroup>
              <div className="space-y-2">
                <h1 className="text-3xl leading-tight font-bold text-balance">{t.auth.heading}</h1>
                <p className="text-pretty text-muted-foreground">{t.auth.intro}</p>
              </div>
              {login.error ? (
                <Alert variant="destructive">
                  <CircleAlertIcon aria-hidden />
                  <AlertDescription>{login.error.message}</AlertDescription>
                </Alert>
              ) : null}
              <Field>
                <FieldLabel htmlFor="email">{t.auth.email}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t.auth.password}</FieldLabel>
                  {/* Di tempat tautan "lupa kata sandi" pada block aslinya. Live
                      region harus sudah ada sebelum isinya muncul. */}
                  <span aria-live="polite" className="ml-auto text-sm text-muted-foreground">
                    {capsLock ? (
                      <span className="inline-flex items-center gap-1">
                        <ArrowBigUpIcon className="size-3.5" aria-hidden />
                        {t.auth.capsLock}
                      </span>
                    ) : null}
                  </span>
                </div>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    type={lihatSandi ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={cekCapsLock}
                    onKeyUp={cekCapsLock}
                    onBlur={() => setCapsLock(false)}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={t.auth.showPassword}
                      aria-pressed={lihatSandi}
                      aria-controls="password"
                      onClick={() => setLihatSandi((v) => !v)}
                    >
                      {lihatSandi ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <Button type="submit" size="lg" disabled={login.isPending}>
                  {login.isPending ? (
                    <>
                      <LoaderCircleIcon className="animate-spin" data-icon="inline-start" aria-hidden />
                      {t.auth.checking}
                    </>
                  ) : (
                    t.auth.submit
                  )}
                </Button>
              </Field>
              <FieldDescription>{t.auth.help}</FieldDescription>
            </FieldGroup>
          </form>
        </div>
      </div>
      <LoginShowcase />
    </div>
  )
}
