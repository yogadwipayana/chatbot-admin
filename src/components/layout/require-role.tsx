"use client"

import { LockIcon } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/common"
import { Button } from "@/components/ui/button"
import { useMe } from "@/lib/api/queries"
import { useT } from "@/lib/i18n"
import { atLeast, homeFor, type Role } from "@/lib/roles"

/**
 * Tampilkan isi hanya untuk level `min` ke atas.
 *
 * Menu untuk level yang tidak berhak sudah disembunyikan; ini untuk yang
 * membuka URL langsung. Server tetap menolak permintaannya dengan 403 --
 * komponen ini hanya supaya yang terlihat adalah penjelasan, bukan layar galat.
 */
export function RequireRole({ min, children }: { min: Role; children: React.ReactNode }) {
  const t = useT()
  const me = useMe().data
  if (!me) return null

  if (!atLeast(me, min)) {
    return (
      <EmptyState
        icon={LockIcon}
        title={t.common.noAccess}
        description={`${t.common.accessFor(t.roles.labels[min], min !== "superadmin")} ${t.common.yourLevel(
          t.roles.labels[me.role]
        )}`}
        action={
          <Button asChild variant="outline">
            <Link href={homeFor(me.role)}>{t.common.back}</Link>
          </Button>
        }
      />
    )
  }
  return children
}
