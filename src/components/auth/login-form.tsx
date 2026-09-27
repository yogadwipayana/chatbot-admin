"use client"

import { ArrowBigUpIcon, BotIcon, CircleAlertIcon, EyeIcon, EyeOffIcon, LoaderCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react"

import { LoginShowcase } from "@/components/auth/login-showcase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { useToken } from "@/hooks/use-token"
import { useLogin } from "@/lib/api/queries"
import { useLang, useT } from "@/lib/i18n"
import { LANGS, LANG_LABELS } from "@/lib/i18n/lang"
import { isTokenUsable, setToken } from "@/lib/auth/token"
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
    <div role="group" aria-label={t.nav.account.language} className="inline-flex rounded-lg border bg-background p-0.5">
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
 * Berdasarkan block shadcn `login-04`: form di kiri kartu, panel gambar di
 * kanan. Tombol masuk lewat Google dan tautan daftar dibuang -- akun admin
 * hanya dibuat oleh pengelola teknis -- dan gambarnya diganti `LoginShowcase`.
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
    document.title = `${t.auth.pageTitle} · ${t.app.name}`
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={onSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BotIcon className="size-5" aria-hidden />
                </div>
                <h1 className="text-2xl font-bold">{t.auth.heading}</h1>
                <p className="text-balance text-muted-foreground">{t.auth.intro}</p>
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
                <Button type="submit" disabled={login.isPending}>
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
              <FieldDescription className="text-center">{t.auth.help}</FieldDescription>
            </FieldGroup>
          </form>
          <LoginShowcase />
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <LanguageSwitch />
      </div>
    </div>
  )
}
