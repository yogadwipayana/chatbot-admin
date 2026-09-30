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
  invalidField: [
    (kolom: string, pesan: string) => `${kolom}: ${pesan}.`,
    (kolom: string, pesan: string) => `${kolom}: ${pesan}.`,
  ],
  /**
   * Galat bawaan Pydantic, per `type`. Kalimat aslinya berbahasa Inggris dan
   * tanpa nama kolom ("String should have at least 5 characters"); kalimat
   * dari validator API sendiri ("Value error, …") sudah berbahasa Indonesia
   * dan tetap ditampilkan apa adanya.
   */
  validation: {
    missing: ["wajib diisi", "is required"],
    empty: ["tidak boleh kosong", "cannot be empty"],
    // Skema admin memangkas spasi di awal dan akhir sebelum menghitung panjang:
    // isian berisi spasi saja ditolak walau kotaknya tampak terisi.
    tooShort: [
      (n: number) => `minimal ${n} karakter, tidak termasuk spasi di awal dan akhir`,
      (n: number) => `must be at least ${n} characters, not counting leading or trailing spaces`,
    ],
    tooLong: [
      (n: number) => `maksimal ${n} karakter`,
      (n: number) => `must be at most ${n} characters`,
    ],
    tooFew: [(n: number) => `minimal ${n} isian`, (n: number) => `needs at least ${n} entries`],
    tooMany: [(n: number) => `maksimal ${n} isian`, (n: number) => `allows at most ${n} entries`],
    atLeast: [(n: string) => `minimal ${n}`, (n: string) => `must be at least ${n}`],
    atMost: [(n: string) => `maksimal ${n}`, (n: string) => `must be at most ${n}`],
    above: [(n: string) => `harus lebih dari ${n}`, (n: string) => `must be greater than ${n}`],
    below: [(n: string) => `harus kurang dari ${n}`, (n: string) => `must be less than ${n}`],
    integer: ["harus bilangan bulat", "must be a whole number"],
    number: ["harus berupa angka", "must be a number"],
    date: ["bukan tanggal yang sah", "is not a valid date"],
    choice: ["bukan pilihan yang tersedia", "is not one of the available options"],
    unknown: ["tidak dikenal", "is not recognised"],
    invalid: ["isinya tidak sah", "is not valid"],
  },
  /** Nama kolom body permintaan admin. Parameter Konfigurasi memakai `config.fields`. */
  fields: {
    email: ["Email", "Email"],
    password: ["Kata sandi", "Password"],
    current_password: ["Kata sandi saat ini", "Current password"],
    new_password: ["Kata sandi baru", "New password"],
    title: ["Judul resmi", "Official title"],
    unit: ["Unit", "Unit"],
    effective_year: ["Tahun berlaku", "Effective year"],
    valid_until: ["Berlaku sampai", "Valid until"],
    question: ["Pertanyaan", "Question"],
    answer: ["Jawaban", "Answer"],
    reason: ["Alasan", "Reason"],
    name: ["Nama", "Name"],
    role: ["Peran", "Role"],
    description: ["Deskripsi", "Description"],
    sort_order: ["Urutan", "Order"],
    allowed_origins: ["Situs yang diizinkan", "Allowed sites"],
    vector_threshold: ["Ambang", "Threshold"],
  },
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
      ["Kelola daftar unit layanan", "Manage the list of service units"],
      ["Kelola situs lain yang memasang asisten", "Manage other sites that embed the assistant"],
    ],
  },
} as const
