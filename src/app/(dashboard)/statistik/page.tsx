import type { Metadata } from "next"

import { RequireRole } from "@/components/layout/require-role"
import { StatsView } from "@/components/stats/stats-view"

export const metadata: Metadata = { title: "Statistik" }

export default function StatsPage() {
  return (
    <RequireRole min="admin">
      <StatsView />
    </RequireRole>
  )
}
