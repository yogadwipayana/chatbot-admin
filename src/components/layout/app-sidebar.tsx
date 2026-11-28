"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronsUpDownIcon,
  KeyRoundIcon,
  LanguagesIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog"
import { AppLogo } from "@/components/layout/app-logo"
import { NAV, isNavActive, type NavItem } from "@/components/layout/nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useDocuments, useKillSwitch, useMe, useUnanswered } from "@/lib/api/queries"
import { clearToken } from "@/lib/auth/token"
import { useLang, useT } from "@/lib/i18n"
import { LANGS, LANG_LABELS, type Lang } from "@/lib/i18n/lang"
import { atLeast } from "@/lib/roles"

function NavBadge({ kind }: { kind: NonNullable<NavItem["badge"]> }) {
  const t = useT()
  const unanswered = useUnanswered({ resolved: false, limit: 1, offset: 0 })
  // Untuk staf/dosen, server menghitung dokumen usang hanya di unitnya.
  const documents = useDocuments({ include_inactive: false, only_stale: false, limit: 1, offset: 0 })
  const killSwitch = useKillSwitch()

  if (kind === "unanswered") {
    const n = unanswered.data?.total ?? 0
    return n > 0 ? (
      <SidebarMenuBadge
        aria-label={t.nav.badges.unanswered(n)}
        className="rounded-full bg-sidebar-primary px-1.5 text-[0.6875rem] font-semibold text-sidebar-primary-foreground peer-data-active/menu-button:text-sidebar-primary-foreground"
      >
        {n}
      </SidebarMenuBadge>
    ) : null
  }
  if (kind === "stale") {
    const n = documents.data?.stale_count ?? 0
    return n > 0 ? (
      <SidebarMenuBadge aria-label={t.nav.badges.stale(n)}>
        <span className="mr-1 size-1.5 rounded-full bg-status-warning" aria-hidden />
        {n}
      </SidebarMenuBadge>
    ) : null
  }
  return killSwitch.data?.engaged ? (
    <SidebarMenuBadge aria-label={t.nav.badges.killSwitchLabel}>
      <span className="mr-1 size-1.5 rounded-full bg-status-critical" aria-hidden />
      {t.nav.badges.killSwitchShort}
    </SidebarMenuBadge>
  ) : null
}

function initials(me: { name?: string | null; email: string }): string {
  const sumber = me.name?.trim() || me.email
  const kata = sumber.split(/[\s.@_-]+/).filter(Boolean)
  return ((kata[0]?.[0] ?? "") + (kata[1]?.[0] ?? "")).toUpperCase() || "?"
}

export function AppSidebar() {
  const t = useT()
  const { lang, setLang } = useLang()
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const me = useMe().data
  const { theme, setTheme } = useTheme()
  const [gantiSandi, setGantiSandi] = useState(false)

  function keluar() {
    clearToken()
    queryClient.clear()
    router.replace("/masuk")
  }

  const groups = NAV.map((g) => ({ ...g, items: g.items.filter((i) => atLeast(me, i.min)) })).filter(
    (g) => g.items.length > 0
  )

  return (
    // Varian `inset`: sidebar menjadi bingkai abu (ikut tema terang/gelap) dan
    // isi halaman tampil di panel membulat di dalamnya.
    <Sidebar variant="inset">
      {/* Tingginya sama dengan bilah atas panel (h-14) supaya segaris. */}
      <SidebarHeader className="h-14 justify-center px-3 py-0">
        <div className="flex items-center gap-2.5">
          <AppLogo className="size-8" />
          <div className="grid leading-tight">
            <span className="text-sm font-bold text-foreground">{t.app.short}</span>
            <span className="text-xs text-muted-foreground">{t.app.tagline}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-3">
        {groups.map((group) => (
          <SidebarGroup key={group.key} className="px-1 py-1.5">
            <SidebarGroupLabel className="text-muted-foreground">
              {t.nav.groups[group.key]}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={item.href} aria-current={active ? "page" : undefined}>
                          <item.icon />
                          <span>{t.nav.items[item.key]}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge ? <NavBadge kind={item.badge} /> : null}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-1 pt-0 pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* modal={false}: dialog ganti kata sandi dibuka dari menu ini, dan menu
                modal meninggalkan `pointer-events: none` di body saat dialog muncul. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="bg-sidebar-accent/70 shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                    {me ? initials(me) : "?"}
                  </div>
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium text-foreground">{me?.name || me?.email}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {me ? t.roles.labels[me.role] : ""}
                      {me?.unit ? ` · ${me.unit}` : ""}
                    </span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
              >
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate text-sm font-medium">{me?.email}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {me ? t.roles.labels[me.role] : ""}
                    {me?.unit ? ` · ${me.unit}` : ""}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setGantiSandi(true)}>
                  <KeyRoundIcon /> {t.nav.account.changePassword}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t.nav.account.appearance}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <SunIcon /> {t.nav.account.light}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <MoonIcon /> {t.nav.account.dark}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <MonitorIcon /> {t.nav.account.system}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                {/* Nama bahasa tidak ikut diterjemahkan: yang mencarinya sedang
                    membaca dashboard dalam bahasa yang belum ia pahami. */}
                <DropdownMenuLabel>{t.nav.account.language}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={lang}
                  onValueChange={(nilai) => setLang(nilai as Lang)}
                >
                  {LANGS.map((kode) => (
                    <DropdownMenuRadioItem key={kode} value={kode}>
                      <LanguagesIcon /> {LANG_LABELS[kode]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={keluar}>
                  <LogOutIcon /> {t.nav.account.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <ChangePasswordDialog open={gantiSandi} onOpenChange={setGantiSandi} />
    </Sidebar>
  )
}
