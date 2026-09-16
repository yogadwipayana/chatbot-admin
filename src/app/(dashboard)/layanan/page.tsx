import type { Metadata } from "next"

import { KillSwitchView } from "@/components/kill-switch/kill-switch-view"
import { RequireRole } from "@/components/layout/require-role"

export const metadata: Metadata = { title: "Layanan chat" }

export default function KillSwitchPage() {
  return (
    <RequireRole min="superadmin">
      <KillSwitchView />
    </RequireRole>
  )
}
