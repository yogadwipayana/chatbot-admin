import type { Metadata } from "next"

import { RequireRole } from "@/components/layout/require-role"
import { LogsView } from "@/components/logs/logs-view"

export const metadata: Metadata = { title: "Log" }

export default function LogsPage() {
  return (
    <RequireRole min="admin">
      <LogsView />
    </RequireRole>
  )
}
