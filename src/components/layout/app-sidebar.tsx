"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  BotIcon,
  CircleDollarSignIcon,
  ChartColumnIcon,
  ChevronsUpDownIcon,
  FileTextIcon,
  FlaskConicalIcon,
  KeyRoundIcon,
  LogOutIcon,
  MessageCircleQuestionMarkIcon,
  MessageSquareHeartIcon,
  MessagesSquareIcon,
  MonitorIcon,
  MoonIcon,
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
import { ROLE_LABELS, atLeast, type Role } from "@/lib/roles"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  min: Role
  badge?: "unanswered" | "stale" | "killswitch"
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    // AD-4 ditempatkan paling atas: PRD §9 menyebutnya penentu sistem membaik atau stagnan.
    label: "Perbaikan",
    items: [
      {
        href: "/pertanyaan",
        label: "Pertanyaan tak terjawab",
        icon: MessageCircleQuestionMarkIcon,
        min: "staf",
        badge: "unanswered",
      },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/dokumen", label: "Dokumen", icon: FileTextIcon, min: "staf", badge: "stale" },
      { href: "/tanya-jawab", label: "Tanya jawab", icon: MessagesSquareIcon, min: "staf" },
      { href: "/uji-coba", label: "Uji coba jawaban", icon: FlaskConicalIcon, min: "staf" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/statistik", label: "Statistik", icon: ChartColumnIcon, min: "admin" },
      { href: "/biaya", label: "Biaya", icon: CircleDollarSignIcon, min: "admin" },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { href: "/admin", label: "Admin", icon: UsersRoundIcon, min: "superadmin" },
      // Isi percakapan, jadi levelnya sama dengan statistik: admin ke atas.
      {
        href: "/umpan-balik",
        label: "Umpan balik",
        icon: MessageSquareHeartIcon,
        min: "admin",
      },
      // Setelan ambang dan chunking berlaku untuk setiap pertanyaan mahasiswa,
      // jadi setara kill switch: superadmin saja.
      {
        href: "/konfigurasi",
        label: "Konfigurasi",
        icon: SlidersHorizontalIcon,
        min: "superadmin",
        badge: "killswitch",
      },
    ],
  },
]

function NavBadge({ kind }: { kind: NonNullable<NavItem["badge"]> }) {
  const unanswered = useUnanswered({ resolved: false })
  // Untuk staf/dosen, server menghitung dokumen usang hanya di unitnya.
  const documents = useDocuments({ include_inactive: false, only_stale: false, limit: 1, offset: 0 })
  const killSwitch = useKillSwitch()

  if (kind === "unanswered") {
    const n = unanswered.data?.length ?? 0
    return n > 0 ? (
      <SidebarMenuBadge aria-label={`${n} kelompok belum ditindaklanjuti`}>{n}</SidebarMenuBadge>
    ) : null
  }
  if (kind === "stale") {
    const n = documents.data?.jumlah_stale ?? 0
    return n > 0 ? (
      <SidebarMenuBadge aria-label={`${n} dokumen perlu ditinjau`}>
        <span className="mr-1 size-1.5 rounded-full bg-status-warning" aria-hidden />
        {n}
      </SidebarMenuBadge>
    ) : null
  }
  return killSwitch.data?.engaged ? (
    <SidebarMenuBadge aria-label="Layanan chat dimatikan">
      <span className="mr-1 size-1.5 rounded-full bg-status-critical" aria-hidden />
      Mati
    </SidebarMenuBadge>
  ) : null
}

function initials(me: { nama?: string | null; email: string }): string {
  const sumber = me.nama?.trim() || me.email
  const kata = sumber.split(/[\s.@_-]+/).filter(Boolean)
  return ((kata[0]?.[0] ?? "") + (kata[1]?.[0] ?? "")).toUpperCase() || "?"
}

export function AppSidebar() {
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
            <span className="text-sm font-semibold">Admin Chatbot</span>
            <span className="text-xs text-muted-foreground">Administrasi Mahasiswa</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={item.href} aria-current={active ? "page" : undefined}>
                          <item.icon />
                          <span>{item.label}</span>
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
                      {me ? ROLE_LABELS[me.role] : ""}
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
                    {me ? ROLE_LABELS[me.role] : ""}
                    {me?.unit ? ` · ${me.unit}` : ""}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setGantiSandi(true)}>
                  <KeyRoundIcon /> Ganti kata sandi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Tampilan</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <SunIcon /> Terang
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <MoonIcon /> Gelap
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <MonitorIcon /> Ikuti sistem
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={keluar}>
                  <LogOutIcon /> Keluar
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
