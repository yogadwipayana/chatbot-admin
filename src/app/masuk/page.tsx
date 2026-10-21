import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Masuk" }

const ASAL_PEMBANDING = "https://dasbor.invalid"

/**
 * Hanya lintasan internal dashboard ini; selain itu `/` (open redirect, H20).
 *
 * Diperiksa dengan pengurai URL yang sama dengan peramban, bukan dengan awalan
 * teks. Peramban membuang tab dan baris baru dari URL, jadi `?lanjut=/%09/situs-lain`
 * lolos cek awalan `//` tetapi dibuka sebagai `//situs-lain`, yaitu situs lain.
 * Hasilnya disusun ulang dari bagian URL yang sudah diurai, supaya yang dipakai
 * `router.replace` persis yang sudah diperiksa.
 */
function tujuanAman(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/"
  try {
    const tujuan = new URL(value, ASAL_PEMBANDING)
    if (tujuan.origin !== ASAL_PEMBANDING) return "/"
    return `${tujuan.pathname}${tujuan.search}${tujuan.hash}`
  } catch {
    return "/"
  }
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
