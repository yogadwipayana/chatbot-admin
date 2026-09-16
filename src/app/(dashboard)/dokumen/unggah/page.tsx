import type { Metadata } from "next"

import { UploadView } from "@/components/documents/upload-view"

export const metadata: Metadata = { title: "Unggah dokumen" }

export default function UploadPage() {
  return <UploadView />
}
