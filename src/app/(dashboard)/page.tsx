"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Spinner } from "@/components/common"
import { useMe } from "@/lib/api/queries"
import { homeFor } from "@/lib/roles"

/** `/` membuka halaman kerja utama sesuai level: dokumen untuk staf/dosen, AD-4 untuk lainnya. */
export default function HomePage() {
  const me = useMe().data
  const router = useRouter()

  useEffect(() => {
    if (me) router.replace(homeFor(me.role))
  }, [me, router])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner label="Membuka dashboard…" />
    </div>
  )
}
