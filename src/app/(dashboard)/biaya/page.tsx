import type { Metadata } from "next"

import { RequireRole } from "@/components/layout/require-role"
import { CostsView } from "@/components/costs/costs-view"

export const metadata: Metadata = { title: "Biaya" }

export default function CostsPage() {
  return (
    <RequireRole min="admin">
      <CostsView />
    </RequireRole>
  )
}
