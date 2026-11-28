import {
  Building2Icon,
  ChartColumnIcon,
  CodeXmlIcon,
  FileTextIcon,
  FlaskConicalIcon,
  MessageCircleQuestionMarkIcon,
  MessageSquareHeartIcon,
  MessagesSquareIcon,
  ScrollTextIcon,
  SlidersHorizontalIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react"

import type { Dict } from "@/lib/i18n/dict"
import type { Role } from "@/lib/roles"

export type NavItem = {
  href: string
  key: keyof Dict["nav"]["items"]
  icon: LucideIcon
  min: Role
  badge?: "unanswered" | "stale" | "killswitch"
}

export type NavGroup = { key: keyof Dict["nav"]["groups"]; items: NavItem[] }

/**
 * Menu dashboard. Label menunya ada di kamus; di sini hanya kuncinya, supaya
 * urutan dan hak akses menu tidak ikut tersentuh setiap kali teksnya disunting.
 * Dipakai sidebar, breadcrumb bilah atas, dan ikon kepala halaman.
 */
export const NAV: NavGroup[] = [
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
      // Isi percakapan, jadi levelnya sama dengan statistik: admin ke atas.
      // Di sini, bukan di Pengaturan: isinya bahan perbaikan, sama seperti AD-4.
      {
        href: "/umpan-balik",
        key: "feedback",
        icon: MessageSquareHeartIcon,
        min: "admin",
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
      // Alat debug developer (langkah pipeline, system prompt, log server):
      // superadmin saja, sama dengan `x-min-role` endpoint-nya.
      { href: "/log", key: "logs", icon: ScrollTextIcon, min: "superadmin" },
    ],
  },
  {
    key: "pengaturan",
    items: [
      { href: "/admin", key: "users", icon: UsersRoundIcon, min: "superadmin" },
      // Menentukan menu chatbot dan batas akses staf, jadi superadmin saja.
      { href: "/unit", key: "units", icon: Building2Icon, min: "superadmin" },
      // Siapa yang boleh memakai kuota model dari situs lain: superadmin saja.
      { href: "/sematan", key: "embed", icon: CodeXmlIcon, min: "superadmin" },
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

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Menu dan kelompok yang memuat halaman ini (juga untuk subhalaman seperti `/dokumen/unggah`). */
export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of NAV) {
    const item = group.items.find((i) => isNavActive(pathname, i.href))
    if (item) return { group, item }
  }
  return null
}
