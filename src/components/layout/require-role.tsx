"use client"

import { LockIcon } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/common"
import { Button } from "@/components/ui/button"
import { useMe } from "@/lib/api/queries"
import { ROLE_LABELS, atLeast, homeFor, type Role } from "@/lib/roles"

/**
 * Tampilkan isi hanya untuk level `min` ke atas.
 *
 * Menu untuk level yang tidak berhak sudah disembunyikan; ini untuk yang
 * membuka URL langsung. Server tetap menolak permintaannya dengan 403 --
 * komponen ini hanya supaya yang terlihat adalah penjelasan, bukan layar galat.
 */
export function RequireRole({ min, children }: { min: Role; children: React.ReactNode }) {
  const me = useMe().data
  if (!me) return null

  if (!atLeast(me, min)) {
    return (
      <EmptyState
        icon={LockIcon}
        title="Tidak punya akses"
        description={`Halaman ini untuk level ${ROLE_LABELS[min]}${
          min === "superadmin" ? "" : " ke atas"
        }. Level akun Anda: ${ROLE_LABELS[me.role]}.`}
        action={
          <Button asChild variant="outline">
            <Link href={homeFor(me.role)}>Kembali</Link>
          </Button>
        }
      />
    )
  }
  return children
}
