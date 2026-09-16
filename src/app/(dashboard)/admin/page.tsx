import type { Metadata } from "next"

import { RequireRole } from "@/components/layout/require-role"
import { UsersView } from "@/components/users/users-view"

export const metadata: Metadata = { title: "Admin" }

export default function UsersPage() {
  return (
    <RequireRole min="superadmin">
      <UsersView />
    </RequireRole>
  )
}
