import type { Metadata } from "next"

import { FaqView } from "@/components/faq/faq-view"

export const metadata: Metadata = { title: "Tanya jawab" }

export default function FaqPage() {
  return <FaqView />
}
