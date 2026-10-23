import { cn } from "@/lib/utils"

/**
 * Logo dashboard: balon obrolan bergaris tebal dengan bayangan padat
 * (gaya neo-brutalis) dan dua baris teks.
 *
 * Hitam putih: warnanya ikut `primary` tema, jadi terbalik di mode gelap.
 * Gambarnya sama dengan `src/app/icon.svg` (ikon tab peramban) dan
 * `favicon.ico`; bila salah satu diubah, samakan yang lain. Arsip logo
 * lain dan cara menggantinya: `client/docs/logo/README.md`.
 */
const BALON = "M8 4h12a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-7.5l-4.6 3.8c-.6.5-1.4.1-1.4-.7V20.6A5 5 0 0 1 3 16V9a5 5 0 0 1 5-5z"

export function AppLogo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
      className={cn("size-8 shrink-0", className)}
      {...props}
    >
      <path className="fill-primary" transform="translate(3.5 3.5)" d={BALON} />
      <path
        className="fill-primary-foreground stroke-primary"
        strokeWidth="2.4"
        strokeLinejoin="round"
        d={BALON}
      />
      <path
        className="stroke-primary"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M8.5 10.5h11M8.5 15h6.5"
      />
    </svg>
  )
}
