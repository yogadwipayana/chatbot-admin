import type { Metadata } from "next"

import { ConfigView } from "@/components/config/config-view"
import { RequireRole } from "@/components/layout/require-role"

export const metadata: Metadata = { title: "Konfigurasi" }

export default function ConfigPage() {
  return (
    <RequireRole min="superadmin">
      <ConfigView />
    </RequireRole>
  )
}
