import type { Metadata } from "next"

import { RequireRole } from "@/components/layout/require-role"
import { LogsView, type LogTab } from "@/components/logs/logs-view"

export const metadata: Metadata = { title: "Log" }

// Ditulis ulang di sini, bukan diimpor dari logs-view: nilai dari modul "use client"
// sampai di server component sebagai referensi klien, bukan sebagai array.
const TABS: readonly LogTab[] = ["performa", "giliran", "graf", "aplikasi"]

/** `?tab=graf&giliran=<turn_id>`: dibuka dari halaman uji coba jawaban. */
export default async function LogsPage({ searchParams }: PageProps<"/log">) {
  const { tab, giliran } = await searchParams
  const awal = TABS.find((t) => t === tab)
  const turnId = typeof giliran === "string" ? giliran.slice(0, 64) : null
  return (
    <RequireRole min="admin">
      {/* Kunci: navigasi ke giliran lain di halaman yang sama membuat ulang
          state tab, bukan mempertahankan pilihan sebelumnya. */}
      <LogsView
        key={`${awal ?? ""}-${turnId ?? ""}`}
        initialTab={awal ?? (turnId ? "graf" : "performa")}
        initialGraphTurnId={turnId}
      />
    </RequireRole>
  )
}
