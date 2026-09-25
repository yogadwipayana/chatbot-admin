"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  BotIcon,
  Building2Icon,
  CircleDollarSignIcon,
  ChartColumnIcon,
  ChevronsUpDownIcon,
  FileTextIcon,
  FlaskConicalIcon,
  KeyRoundIcon,
  LanguagesIcon,
  LogOutIcon,
  MessageCircleQuestionMarkIcon,
  MessageSquareHeartIcon,
  MessagesSquareIcon,
  MonitorIcon,
  MoonIcon,
  ScrollTextIcon,
  SlidersHorizontalIcon,
  SunIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog"
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
import type { Dict } from "@/lib/i18n/dict"
import { LANGS, LANG_LABELS, type Lang } from "@/lib/i18n/lang"
import { atLeast, type Role } from "@/lib/roles"

type NavItem = {
  href: string
  key: keyof Dict["nav"]["items"]
  icon: LucideIcon
  min: Role
  badge?: "unanswered" | "stale" | "killswitch"
}

/**
 * Label menunya ada di kamus; di sini hanya kuncinya, supaya urutan dan hak
 * akses menu tidak ikut tersentuh setiap kali teksnya disunting.
 */
const NAV: { key: keyof Dict["nav"]["groups"]; items: NavItem[] }[] = [
  {
    // AD-4 ditempatkan paling atas: PRD §9 menyebutnya penentu sistem membaik atau stagnan.
    key: "perbaikan",
    items: [
      {
        href: "/pertanyaan",
        key: "unanswered",
        icon: MessageCircleQuestionMarkIcon,
        min: "staf",
        badge: "unanswered",
      },
    ],
  },
  {
    key: "konten",
    items: [
      { href: "/dokumen", key: "documents", icon: FileTextIcon, min: "staf", badge: "stale" },
      { href: "/tanya-jawab", key: "faq", icon: MessagesSquareIcon, min: "staf" },
      { href: "/uji-coba", key: "testQuery", icon: FlaskConicalIcon, min: "staf" },
    ],
  },
  {
    key: "operasional",
    items: [
      { href: "/statistik", key: "stats", icon: ChartColumnIcon, min: "admin" },
      { href: "/biaya", key: "costs", icon: CircleDollarSignIcon, min: "admin" },
      // Log audit di dalamnya disaring API untuk role admin; lihat `logs.md`.
      { href: "/log", key: "logs", icon: ScrollTextIcon, min: "admin" },
    ],
  },
  {
    key: "pengaturan",
    items: [
      { href: "/admin", key: "users", icon: UsersRoundIcon, min: "superadmin" },
      // Menentukan menu chatbot dan batas akses staf, jadi superadmin saja.
      { href: "/unit", key: "units", icon: Building2Icon, min: "superadmin" },
      // Isi percakapan, jadi levelnya sama dengan statistik: admin ke atas.
      {
        href: "/umpan-balik",
        key: "feedback",
        icon: MessageSquareHeartIcon,
        min: "admin",
      },
      // Setelan ambang dan chunking berlaku untuk setiap pertanyaan mahasiswa,
      // jadi setara kill switch: superadmin saja.
      {
        href: "/konfigurasi",
        key: "config",
        icon: SlidersHorizontalIcon,
        min: "superadmin",
        badge: "killswitch",
      },
    ],
  },
]

function NavBadge({ kind }: { kind: NonNullable<NavItem["badge"]> }) {
  const t = useT()
  const unanswered = useUnanswered({ resolved: false })
  // Untuk staf/dosen, server menghitung dokumen usang hanya di unitnya.
  const documents = useDocuments({ include_inactive: false, only_stale: false, limit: 1, offset: 0 })
  const killSwitch = useKillSwitch()

  if (kind === "unanswered") {
    const n = unanswered.data?.length ?? 0
    return n > 0 ? (
      <SidebarMenuBadge aria-label={t.nav.badges.unanswered(n)}>{n}</SidebarMenuBadge>
    ) : null
  }
  if (kind === "stale") {
    const n = documents.data?.jumlah_stale ?? 0
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

function initials(me: { nama?: string | null; email: string }): string {
  const sumber = me.nama?.trim() || me.email
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BotIcon className="size-4" aria-hidden />
          </div>
          <div className="grid leading-tight">
            <span className="text-sm font-semibold">{t.app.short}</span>
            <span className="text-xs text-muted-foreground">{t.app.tagline}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.key}>
            <SidebarGroupLabel>{t.nav.groups[group.key]}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* modal={false}: dialog ganti kata sandi dibuka dari menu ini, dan menu
                modal meninggalkan `pointer-events: none` di body saat dialog muncul. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                    {me ? initials(me) : "?"}
                  </div>
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">{me?.nama || me?.email}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {me ? t.roles.labels[me.role] : ""}
                      {me?.unit ? ` · ${me.unit}` : ""}
                    </span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto size-4" />
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
