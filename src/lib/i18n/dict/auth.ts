/** Halaman masuk dan dialog ganti kata sandi. */

export const auth = {
  pageTitle: ["Masuk", "Sign in"],
  intro: [
    "Masuk untuk mengelola dokumen sumber dan memantau pertanyaan mahasiswa.",
    "Sign in to manage source documents and keep an eye on student questions.",
  ],
  email: ["Email", "Email"],
  password: ["Kata sandi", "Password"],
  submit: ["Masuk", "Sign in"],
  checking: ["Memeriksa…", "Checking…"],
  help: [
    "Akun admin dibuat oleh pengelola teknis. Lupa kata sandi? Hubungi pengelola teknis.",
    "Admin accounts are created by the technical team. Forgot your password? Contact them.",
  ],
} as const

export const password = {
  title: ["Ganti kata sandi", "Change password"],
  description: [
    "Semua sesi akun ini di perangkat lain akan berakhir. Sesi di perangkat ini tetap berjalan.",
    "Every other session for this account ends. The session on this device keeps running.",
  ],
  current: ["Kata sandi saat ini", "Current password"],
  new: ["Kata sandi baru", "New password"],
  repeat: ["Ulangi kata sandi baru", "Repeat new password"],
  rule: [
    (minimum: number) =>
      `Minimal ${minimum} karakter. Kalimat panjang lebih mudah diingat dan lebih sulit ditebak daripada kata acak pendek.`,
    (minimum: number) =>
      `At least ${minimum} characters. A long phrase is easier to remember and harder to guess than a short random word.`,
  ],
  mismatch: ["Kedua kata sandi baru belum sama.", "The two new passwords do not match yet."],
  saved: ["Kata sandi diganti", "Password changed"],
  savedDetail: [
    "Sesi akun ini di perangkat lain sudah diakhiri.",
    "Other sessions for this account have been ended.",
  ],
} as const
