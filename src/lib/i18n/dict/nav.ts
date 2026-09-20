/** Sidebar, kerangka dashboard, dan spanduk kill switch. */

export const nav = {
  groups: {
    perbaikan: ["Perbaikan", "Improvement"],
    konten: ["Konten", "Content"],
    operasional: ["Operasional", "Operations"],
    pengaturan: ["Pengaturan", "Settings"],
  },
  items: {
    unanswered: ["Pertanyaan tak terjawab", "Unanswered questions"],
    documents: ["Dokumen", "Documents"],
    faq: ["Tanya jawab", "Q&A entries"],
    testQuery: ["Uji coba jawaban", "Test answers"],
    stats: ["Statistik", "Statistics"],
    costs: ["Biaya", "Costs"],
    users: ["Admin", "Admins"],
    feedback: ["Umpan balik", "Feedback"],
    config: ["Konfigurasi", "Configuration"],
  },
  badges: {
    unanswered: [
      (n: number) => `${n} kelompok belum ditindaklanjuti`,
      (n: number) => `${n} groups not yet handled`,
    ],
    stale: [
      (n: number) => `${n} dokumen perlu ditinjau`,
      (n: number) => `${n} documents need review`,
    ],
    killSwitchLabel: ["Layanan chat dimatikan", "Chat service is off"],
    killSwitchShort: ["Mati", "Off"],
  },
  account: {
    changePassword: ["Ganti kata sandi", "Change password"],
    appearance: ["Tampilan", "Appearance"],
    light: ["Terang", "Light"],
    dark: ["Gelap", "Dark"],
    system: ["Ikuti sistem", "Match system"],
    language: ["Bahasa", "Language"],
    signOut: ["Keluar", "Sign out"],
  },
} as const

export const shell = {
  checkingSession: ["Memeriksa sesi…", "Checking session…"],
  loadingAccount: ["Memuat akun…", "Loading account…"],
  accountFailed: ["Data akun tidak dapat dimuat", "Could not load your account"],
} as const

export const killSwitchBanner = {
  title: ["Layanan chat sedang dimatikan.", "The chat service is switched off."],
  detail: ["Mahasiswa melihat pesan penutupan", "Students see the closure message"],
  reason: [(alasan: string) => ` · Alasan: ${alasan}`, (alasan: string) => ` · Reason: ${alasan}`],
  manage: ["Kelola", "Manage"],
} as const
