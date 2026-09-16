"use client"

import { BotIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToken } from "@/hooks/use-token"
import { useLogin } from "@/lib/api/queries"
import { isTokenUsable, setToken } from "@/lib/auth/token"

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const token = useToken()
  const login = useLogin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BotIcon className="size-5" aria-hidden />
        </div>
        <CardTitle className="text-xl">Dashboard Admin Chatbot</CardTitle>
        <CardDescription>
          Masuk untuk mengelola dokumen sumber dan memantau pertanyaan mahasiswa.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {login.error ? (
            <Alert variant="destructive">
              <AlertDescription>{login.error.message}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex-col items-stretch gap-3">
          <Button type="submit" size="lg" disabled={login.isPending}>
            {login.isPending ? "Memeriksa…" : "Masuk"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Akun admin dibuat oleh pengelola teknis. Lupa kata sandi? Hubungi pengelola teknis.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
