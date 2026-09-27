import type { Metadata } from "next"

import { EmbedKeysView } from "@/components/embed-keys/embed-keys-view"
import { RequireRole } from "@/components/layout/require-role"

export const metadata: Metadata = { title: "Sematan" }

export default function EmbedKeysPage() {
  return (
    <RequireRole min="superadmin">
      <EmbedKeysView />
    </RequireRole>
  )
}
