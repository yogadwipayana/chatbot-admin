"use client"

import { useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { Spinner } from "@/components/common"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { KillSwitchBanner } from "@/components/layout/kill-switch-banner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useNow } from "@/hooks/use-now"
import { useToken } from "@/hooks/use-token"
import { useMe } from "@/lib/api/queries"
import { useT } from "@/lib/i18n"
import { clearToken, isTokenUsable } from "@/lib/auth/token"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useT()
  const token = useToken()
  const now = useNow()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const usable = isTokenUsable(token, now)
  // Level dan unit datang dari server; seluruh menu dan halaman bergantung padanya.
  const me = useMe(usable)

  useEffect(() => {
    // undefined = localStorage belum terbaca (render server / sebelum hidrasi).
    if (token === undefined || usable) return
    if (token) clearToken() // kedaluwarsa atau rusak
    // Data admin sebelumnya tidak boleh tersisa di cache untuk sesi berikutnya.
    queryClient.clear()
    router.replace(`/masuk?lanjut=${encodeURIComponent(pathname)}`)
  }, [token, usable, pathname, router, queryClient])

  if (!usable) {
    return <FullPage><Spinner label={t.shell.checkingSession} /></FullPage>
  }

  if (me.error) {
    // 401 sudah menghapus token lewat middleware klien; yang tersisa di sini
    // galat jaringan atau server.
    return (
      <FullPage>
        <div className="max-w-sm space-y-3 text-center">
          <p className="font-medium">{t.shell.accountFailed}</p>
          <p className="text-sm text-muted-foreground">{me.error.message}</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => me.refetch()}>
              {t.common.retry}
            </Button>
            <Button variant="ghost" onClick={() => clearToken()}>
              {t.nav.account.signOut}
            </Button>
          </div>
        </div>
      </FullPage>
    )
  }

  if (!me.data) {
    return <FullPage><Spinner label={t.shell.loadingAccount} /></FullPage>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-vertical:h-4" />
          <span className="truncate text-sm text-muted-foreground">{t.app.header}</span>
        </header>
        <KillSwitchBanner />
        <div className="flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function FullPage({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-svh items-center justify-center p-4">{children}</div>
}
