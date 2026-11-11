"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ChevronRightIcon, MoonIcon, SunIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect } from "react"

import { Spinner } from "@/components/common"
import { AppSidebar, NAV } from "@/components/layout/app-sidebar"
import { KillSwitchBanner } from "@/components/layout/kill-switch-banner"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useNow } from "@/hooks/use-now"
import { useSessionKeepalive } from "@/hooks/use-session-keepalive"
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
  // Token berumur pendek; diperpanjang hanya selama admin berinteraksi (H27).
  useSessionKeepalive(usable)

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
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
          <SidebarTrigger className="-ml-1.5 text-muted-foreground" />
          <span aria-hidden className="mr-1 h-4 w-px bg-border" />
          <Breadcrumb pathname={pathname} />
          <ThemeToggle />
        </header>
        <KillSwitchBanner />
        <div className="flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/**
 * Posisi halaman: kelompok menu lalu nama menunya. Nama aplikasi tidak diulang
 * di sini karena sudah ada di kepala sidebar.
 */
function Breadcrumb({ pathname }: { pathname: string }) {
  const t = useT()
  for (const group of NAV) {
    const item = group.items.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    if (!item) continue
    return (
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="hidden text-muted-foreground sm:inline">{t.nav.groups[group.key]}</span>
        <ChevronRightIcon aria-hidden className="hidden size-3.5 text-muted-foreground/60 sm:inline" />
        <span className="truncate font-medium">{t.nav.items[item.key]}</span>
      </nav>
    )
  }
  return null
}

function ThemeToggle() {
  const t = useT()
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="ml-auto text-muted-foreground"
      aria-label={t.nav.account.appearance}
      title={t.nav.account.appearance}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Keduanya dirender dan dipilih lewat CSS: tema baru diketahui setelah
          hidrasi, jadi memilih ikon di JS akan memicu selisih hidrasi. */}
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  )
}

function FullPage({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-svh items-center justify-center bg-canvas p-4">{children}</div>
}
