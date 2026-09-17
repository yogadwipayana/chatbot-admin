import type { Metadata } from "next"

import { RequireRole } from "@/components/layout/require-role"
import { FeedbackView } from "@/components/feedback/feedback-view"

export const metadata: Metadata = { title: "Umpan balik" }

export default function FeedbackPage() {
  return (
    <RequireRole min="admin">
      <FeedbackView />
    </RequireRole>
  )
}
