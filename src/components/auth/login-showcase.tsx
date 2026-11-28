"use client"

import { FileTextIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { useT } from "@/lib/i18n"

/** Satu putaran animasi `melambai.webp` (38 frame x 80 ms), sama dengan widget. */
const SATU_PUTARAN = 3040

/**
 * Maskot widget mahasiswa (`client/public/maskot/`, disalin ke `public/maskot/`).
 * Melambai sekali lalu diam: berkas animasinya berulang tanpa henti, dan di
 * halaman masuk gerakan terus-menerus hanya mengganggu. Bila pengguna meminta
 * gerakan dikurangi, peramban langsung memilih gambar diam (`<source media>`).
 */
function MaskotMelambai({ className }: { className?: string }) {
  const [diam, setDiam] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setDiam(true), SATU_PUTARAN)
    return () => window.clearTimeout(timer)
  }, [])
  return (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet="/maskot/netral-diam.webp" />
      <img
        src={diam ? "/maskot/netral-diam.webp" : "/maskot/melambai.webp"}
        alt=""
        width={128}
        height={128}
        draggable={false}
        className={className}
      />
    </picture>
  )
}

/**
 * Panel kanan halaman masuk: seperti apa kerja di dashboard ini terlihat dari
 * sisi mahasiswa. Isi jawabannya sengaja digambar sebagai garis, bukan kalimat,
 * supaya tidak terbaca sebagai aturan kampus yang sungguhan.
 *
 * Ikut tema terang/gelap, sama dengan sidebar dashboard.
 */
export function LoginShowcase() {
  const t = useT()
  return (
    <aside className="relative m-3 hidden overflow-hidden rounded-3xl bg-muted ring-1 ring-border lg:flex lg:flex-col lg:justify-center lg:p-14 xl:p-20 dark:bg-card">
      {/* Kisi tipis yang memudar ke tepi. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_center,black_20%,transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-md">
        <div aria-hidden className="relative">
          <MaskotMelambai className="absolute -top-[5.25rem] right-8 size-28 select-none" />

          <div className="rounded-2xl bg-card/85 shadow-xl ring-1 ring-border backdrop-blur dark:bg-background/85">
            <div className="flex items-center gap-2.5 border-b px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- gambar 1 KB */}
              <img
                src="/maskot/netral-diam.webp"
                alt=""
                width={128}
                height={128}
                className="size-7 rounded-full bg-background object-cover object-bottom ring-1 ring-border"
              />
              <span className="text-sm font-semibold">{t.app.header}</span>
              <span className="ml-auto size-2 rounded-full bg-status-good" />
            </div>

            <div className="grid gap-4 p-4">
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                {t.auth.showcase.question}
              </p>

              <div className="grid max-w-[92%] gap-3 rounded-2xl rounded-tl-md bg-muted px-3.5 py-3">
                <div className="grid gap-2">
                  <div className="h-2 w-full rounded-full bg-foreground/15" />
                  <div className="h-2 w-11/12 rounded-full bg-foreground/15" />
                  <div className="h-2 w-2/3 rounded-full bg-foreground/15" />
                </div>
                <div className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-background/80 px-2 py-1 text-xs ring-1 ring-border">
                  <FileTextIcon className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.auth.showcase.sourceLabel}:</span>
                  <span className="font-medium">{t.auth.showcase.source}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-10 text-2xl leading-tight font-bold text-balance">
          {t.auth.showcase.title}
        </h2>
        <p className="mt-3 text-base/relaxed text-balance text-muted-foreground">{t.auth.showcase.body}</p>
      </div>
    </aside>
  )
}
