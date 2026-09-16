import {
  CircleAlertIcon,
  CircleCheckIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type StatusLevel = "good" | "warning" | "serious" | "critical"

const ICONS: Record<StatusLevel, LucideIcon> = {
  good: CircleCheckIcon,
  warning: TriangleAlertIcon,
  serious: CircleAlertIcon,
  critical: OctagonXIcon,
}

const COLORS: Record<StatusLevel, string> = {
  good: "text-status-good",
  warning: "text-status-warning",
  serious: "text-status-serious",
  critical: "text-status-critical",
}

/**
 * Status baik/buruk. Warna hanya pada ikon; teks tetap memakai warna teks
 * biasa, sehingga arti tidak pernah bergantung pada warna saja.
 */
export function StatusLabel({
  level,
  children,
  className,
}: {
  level: StatusLevel
  children: React.ReactNode
  className?: string
}) {
  const Icon = ICONS[level]
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Icon className={cn("size-4 shrink-0", COLORS[level])} aria-hidden />
      <span>{children}</span>
    </span>
  )
}
