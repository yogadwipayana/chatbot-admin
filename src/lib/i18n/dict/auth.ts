/** Halaman masuk dan dialog ganti kata sandi. */

export const auth = {
  pageTitle: ["Masuk", "Sign in"],
  heading: ["Selamat datang kembali", "Welcome back"],
  intro: [
    "Masuk ke Dashboard Admin Chatbot",
    "Sign in to the Chatbot Admin Dashboard",
  ],
  email: ["Email", "Email"],
  password: ["Kata sandi", "Password"],
  showPassword: ["Tampilkan kata sandi", "Show password"],
  capsLock: ["Caps Lock aktif.", "Caps Lock is on."],
  submit: ["Masuk", "Sign in"],
  checking: ["Memeriksa…", "Checking…"],
  help: [
    "Akun admin dibuat oleh pengelola teknis. Lupa kata sandi? Hubungi pengelola teknis.",
    "Admin accounts are created by the technical team. Forgot your password? Contact them.",
  ],
  // Panel samping halaman masuk: contoh percakapan, bukan data sungguhan.
  showcase: {
    question: [
      "Bagaimana cara mengajukan cuti akademik?",
      "How do I apply for academic leave?",
    ],
    sourceLabel: ["Sumber", "Source"],
    source: ["Pedoman Akademik", "Academic Handbook"],
    title: [
      "Setiap jawaban bersumber dari dokumen yang Anda kelola.",
      "Every answer comes from the documents you manage.",
    ],
    body: [
      "Perbarui dokumen, jawab pertanyaan yang terlewat, dan uji jawaban sebelum mahasiswa bertanya.",
      "Keep documents current, answer what the chatbot missed, and test answers before students ask.",
    ],
  },
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
