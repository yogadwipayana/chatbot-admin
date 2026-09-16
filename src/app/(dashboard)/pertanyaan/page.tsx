import type { Metadata } from "next"

import { UnansweredView } from "@/components/unanswered/unanswered-view"

export const metadata: Metadata = { title: "Pertanyaan tak terjawab" }

export default function UnansweredPage() {
  return <UnansweredView />
}
