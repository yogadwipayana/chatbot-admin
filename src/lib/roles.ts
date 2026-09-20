import type { Schemas } from "@/lib/api/client"

/**
 * Level akses dashboard, cermin `app/admin/permissions.py` di API.
 *
 * Dipakai HANYA untuk menentukan apa yang ditampilkan. Penegakannya ada di
 * server: menyembunyikan tombol bukan kontrol keamanan, dan setiap operasi
 * tetap diperiksa ulang oleh API (`x-min-role` di api.yaml).
 *
 * Nama tampilan dan daftar haknya ada di kamus (`t.roles`), bukan di sini:
 * keduanya teks antarmuka, sedangkan berkas ini aturan.
 */

export type Role = Schemas["AdminRole"]
export type Me = Schemas["AdminUser"]

export const ROLES: Role[] = ["staf", "admin", "superadmin"]

const LEVEL: Record<Role, number> = { staf: 1, admin: 2, superadmin: 3 }

export function atLeast(me: Pick<Me, "role"> | null | undefined, minimum: Role): boolean {
  return !!me && LEVEL[me.role] >= LEVEL[minimum]
}

/** Halaman pertama setelah masuk: staf/dosen bekerja di dokumen, level lain di AD-4. */
export function homeFor(role: Role): string {
  return role === "staf" ? "/dokumen" : "/pertanyaan"
}
