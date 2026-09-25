import type { Metadata } from "next"

import { RequireRole } from "@/components/layout/require-role"
import { UnitsView } from "@/components/units/units-view"

export const metadata: Metadata = { title: "Unit" }

export default function UnitsPage() {
  return (
    <RequireRole min="superadmin">
      <UnitsView />
    </RequireRole>
  )
}
