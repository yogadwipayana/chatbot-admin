import type { Metadata } from "next"

import { DocumentDetailView } from "@/components/documents/document-detail-view"

export const metadata: Metadata = { title: "Detail dokumen" }

export default async function DocumentDetailPage({ params, searchParams }: PageProps<"/dokumen/[id]">) {
  const { id } = await params
  const { baru } = await searchParams
  return <DocumentDetailView id={id} isNew={baru === "1"} />
}
