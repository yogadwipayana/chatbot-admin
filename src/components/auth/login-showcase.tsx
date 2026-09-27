"use client"

import { BotIcon, FileTextIcon } from "lucide-react"

import { useT } from "@/lib/i18n"

/**
 * Isi slot gambar pada block `login-04`: seperti apa kerja di dashboard ini
 * terlihat dari sisi mahasiswa. Isi jawabannya sengaja digambar sebagai garis,
 * bukan kalimat, supaya tidak terbaca sebagai aturan kampus yang sungguhan.
 */
export function LoginShowcase() {
  const t = useT()
  return (
    <div className="relative hidden overflow-hidden bg-muted md:flex md:flex-col md:justify-center md:p-8">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="relative">
        <div aria-hidden className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BotIcon className="size-3.5" />
            </div>
            <span className="text-xs font-medium">{t.app.header}</span>
          </div>

          <div className="grid gap-3 p-3">
            <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
              {t.auth.showcase.question}
            </p>

            <div className="flex gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background">
                <BotIcon className="size-3.5 text-muted-foreground" />
              </div>
              <div className="grid flex-1 gap-2.5 rounded-2xl rounded-tl-md bg-muted px-3 py-2.5">
                <div className="grid gap-1.5">
                  <div className="h-1.5 w-full rounded-full bg-foreground/10" />
                  <div className="h-1.5 w-11/12 rounded-full bg-foreground/10" />
                  <div className="h-1.5 w-2/3 rounded-full bg-foreground/10" />
                </div>
                <div className="inline-flex w-fit items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[11px]">
                  <FileTextIcon className="size-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.auth.showcase.sourceLabel}:</span>
                  <span className="font-medium">{t.auth.showcase.source}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold text-balance">{t.auth.showcase.title}</h2>
        <p className="mt-1.5 text-sm text-balance text-muted-foreground">{t.auth.showcase.body}</p>
      </div>
    </div>
  )
}
