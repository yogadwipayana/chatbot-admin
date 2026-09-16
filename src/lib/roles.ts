import type { Schemas } from "@/lib/api/client"

/**
 * Level akses dashboard, cermin `app/admin/permissions.py` di API.
 *
 * Dipakai HANYA untuk menentukan apa yang ditampilkan. Penegakannya ada di
 * server: menyembunyikan tombol bukan kontrol keamanan, dan setiap operasi
 * tetap diperiksa ulang oleh API (`x-min-role` di api.yaml).
 */

export type Role = Schemas["AdminRole"]
export type Me = Schemas["AdminUser"]

export const ROLES: Role[] = ["staf", "admin", "superadmin"]

const LEVEL: Record<Role, number> = { staf: 1, admin: 2, superadmin: 3 }

export const ROLE_LABELS: Record<Role, string> = {
  staf: "Staf/Dosen",
  admin: "Admin",
  superadmin: "Superadmin",
}

export const ROLE_RIGHTS: Record<Role, string[]> = {
  staf: [
    "Kelola dokumen unitnya sendiri",
    "Uji coba jawaban",
    "Lihat pertanyaan tak terjawab",
  ],
  admin: [
    "Semua hak Staf/Dosen",
    "Kelola dokumen semua unit",
    "Tandai pertanyaan selesai",
    "Statistik",
  ],
  superadmin: ["Semua hak Admin", "Layanan chat (kill switch)", "Kelola akun di menu Admin"],
}

export function atLeast(me: Pick<Me, "role"> | null | undefined, minimum: Role): boolean {
  return !!me && LEVEL[me.role] >= LEVEL[minimum]
}

/** Halaman pertama setelah masuk: staf/dosen bekerja di dokumen, level lain di AD-4. */
export function homeFor(role: Role): string {
  return role === "staf" ? "/dokumen" : "/pertanyaan"
}
