"use client"

import { OctagonXIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useKillSwitch, useMe } from "@/lib/api/queries"
import { atLeast } from "@/lib/roles"

/** Tampil di semua halaman selama kill switch aktif, supaya tidak ada yang lupa menyalakan kembali. */
export function KillSwitchBanner() {
  const { data } = useKillSwitch()
  const me = useMe().data
  const pathname = usePathname()
  if (!data?.engaged) return null

  return (
    <div role="status" className="border-b bg-destructive/10 px-4 py-2.5 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2">
        <OctagonXIcon className="size-4 shrink-0 text-status-critical" aria-hidden />
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-medium">Layanan chat sedang dimatikan.</span>{" "}
          <span className="text-muted-foreground">
            Mahasiswa melihat pesan penutupan{data.reason ? ` · Alasan: ${data.reason}` : ""}
          </span>
        </p>
        {pathname !== "/layanan" && atLeast(me, "superadmin") ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/layanan">Kelola</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
