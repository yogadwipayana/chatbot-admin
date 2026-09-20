/** Nama layanan, tombol yang muncul di mana-mana, level akses, dan kalimat galat. */

export const app = {
  name: ["Dashboard Admin Chatbot", "Chatbot Admin Dashboard"],
  short: ["Admin Chatbot", "Chatbot Admin"],
  tagline: ["Administrasi Mahasiswa", "Student Administration"],
  header: ["Chatbot Administrasi Mahasiswa", "Student Administration Chatbot"],
} as const

export const common = {
  retry: ["Coba lagi", "Try again"],
  cancel: ["Batal", "Cancel"],
  back: ["Kembali", "Back"],
  close: ["Tutup", "Close"],
  save: ["Simpan", "Save"],
  saving: ["Menyimpan…", "Saving…"],
  undo: ["Batalkan", "Undo"],
  loadFailed: ["Data tidak dapat dimuat", "Could not load data"],
  saveFailed: ["Gagal menyimpan", "Could not save"],
  deleteFailed: ["Gagal menghapus", "Could not delete"],
  noAccess: ["Tidak punya akses", "No access"],
  accessFor: [
    (level: string, keAtas: boolean) =>
      `Halaman ini untuk level ${level}${keAtas ? " ke atas" : ""}.`,
    (level: string, keAtas: boolean) =>
      `This page is for ${level}${keAtas ? " and above" : ""}.`,
  ],
  yourLevel: [
    (level: string) => `Level akun Anda: ${level}.`,
    (level: string) => `Your account level: ${level}.`,
  ],
  chart: ["Grafik", "Chart"],
  table: ["Tabel", "Table"],
  all: ["Semua", "All"],
  search: ["Cari", "Search"],
  of: [(n: number, total: number) => `${n} dari ${total}`, (n: number, total: number) => `${n} of ${total}`],
} as const

export const api = {
  offline: [
    "Tidak dapat terhubung ke server. Periksa koneksi internet atau coba lagi sebentar lagi.",
    "Could not reach the server. Check your connection or try again shortly.",
  ],
  serverError: [
    "Terjadi gangguan di server. Coba lagi beberapa saat lagi.",
    "The server ran into a problem. Try again in a moment.",
  ],
  invalidInput: [
    (pesan: string) => `Isian tidak sah: ${pesan}`,
    (pesan: string) => `Invalid input: ${pesan}`,
  ],
  failed: [
    (status: number) => `Permintaan gagal (kode ${status}).`,
    (status: number) => `Request failed (status ${status}).`,
  ],
} as const

export const roles = {
  labels: {
    staf: ["Staf/Dosen", "Staff/Lecturer"],
    admin: ["Admin", "Admin"],
    superadmin: ["Superadmin", "Superadmin"],
  },
  rights: {
    staf: [
      ["Kelola dokumen dan tanya jawab unitnya sendiri", "Manage documents and Q&A for their own unit"],
      ["Uji coba jawaban", "Test answers"],
      ["Lihat pertanyaan tak terjawab", "View unanswered questions"],
    ],
    admin: [
      ["Semua hak Staf/Dosen", "Everything Staff/Lecturer can do"],
      ["Kelola dokumen dan tanya jawab semua unit", "Manage documents and Q&A for every unit"],
      ["Tandai pertanyaan selesai", "Mark questions as resolved"],
      ["Statistik", "Statistics"],
    ],
    superadmin: [
      ["Semua hak Admin", "Everything Admin can do"],
      ["Layanan chat (kill switch)", "Chat service (kill switch)"],
      ["Konfigurasi pencarian dan pemecahan dokumen", "Retrieval and chunking configuration"],
      ["Kelola akun di menu Admin", "Manage accounts under Admin"],
    ],
  },
} as const
