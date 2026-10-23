import { cn } from "@/lib/utils"

/**
 * Logo dashboard: topi wisuda yang bagian bawahnya menjadi balon obrolan.
 *
 * Hitam putih: warnanya ikut `primary` tema, jadi terbalik di mode gelap.
 * Gambarnya sama dengan `src/app/icon.svg` (ikon tab peramban) dan
 * `favicon.ico`; bila salah satu diubah, samakan yang lain.
 */
export function AppLogo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
      className={cn("size-8 shrink-0", className)}
      {...props}
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M16 5 27.5 10 16 15 4.5 10z" className="fill-primary-foreground" />
      <path
        d="M8.5 13.5 16 16.8l7.5-3.3V20a3.5 3.5 0 0 1-3.5 3.5h-6.4l-3.9 3.2c-.5.4-1.2.1-1.2-.6z"
        className="fill-primary-foreground"
      />
      <path
        d="M25.6 10.9v5.2"
        className="stroke-primary-foreground"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="25.6" cy="16.8" r="1.3" className="fill-primary-foreground" />
    </svg>
  )
}
