import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Masuk" }

/** Hanya lintasan internal; `//situs-lain` dan URL absolut ditolak (open redirect). */
function tujuanAman(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "/"
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/"
  }
  return value
}

export default async function LoginPage({ searchParams }: PageProps<"/masuk">) {
  const { lanjut } = await searchParams
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm redirectTo={tujuanAman(lanjut)} />
      </div>
    </main>
  )
}
