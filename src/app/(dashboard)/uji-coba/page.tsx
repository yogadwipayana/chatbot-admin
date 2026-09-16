import type { Metadata } from "next"

import { TestQueryView } from "@/components/test-query/test-query-view"

export const metadata: Metadata = { title: "Uji coba jawaban" }

export default async function TestQueryPage({ searchParams }: PageProps<"/uji-coba">) {
  const { q } = await searchParams
  return <TestQueryView initialQuestion={typeof q === "string" ? q.slice(0, 2000) : ""} />
}
