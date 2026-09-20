/** Kelola akun dashboard (AD-1). */

export const users = {
  title: ["Admin", "Admins"],
  description: [
    "Kelola akun dashboard dan level aksesnya. Perubahan level, unit, dan status aktif berlaku seketika, termasuk untuk sesi yang sedang terbuka.",
    "Manage dashboard accounts and their access levels. Changes to level, unit, and active status take effect at once, including for sessions already open.",
  ],
  add: ["Tambah akun", "Add account"],
  empty: ["Belum ada akun", "No accounts yet"],
  columns: {
    account: ["Akun", "Account"],
    level: ["Level", "Level"],
    unit: ["Unit", "Unit"],
    status: ["Status", "Status"],
    lastLogin: ["Terakhir masuk", "Last sign-in"],
  },
  you: ["(Anda)", "(you)"],
  active: ["Aktif", "Active"],
  inactive: ["Nonaktif", "Inactive"],
  neverSignedIn: ["Belum pernah", "Never"],
  rowActions: [(email: string) => `Aksi untuk ${email}`, (email: string) => `Actions for ${email}`],
  edit: ["Ubah", "Edit"],
  resetPassword: ["Atur ulang kata sandi", "Reset password"],
  delete: ["Hapus", "Delete"],
  activated: ["Akun diaktifkan", "Account activated"],
  deactivated: ["Akun dinonaktifkan", "Account deactivated"],
  activatedBody: [
    (email: string) => `${email} dapat masuk kembali.`,
    (email: string) => `${email} can sign in again.`,
  ],
  deactivatedBody: [
    (email: string) => `${email} langsung keluar dari semua sesinya.`,
    (email: string) => `${email} is signed out of every session at once.`,
  ],
  form: {
    editTitle: ["Ubah akun", "Edit account"],
    addTitle: ["Tambah akun", "Add account"],
    addDescription: [
      "Kata sandi sementara dibuat otomatis dan ditampilkan sekali setelah akun tersimpan.",
      "A temporary password is generated and shown once after the account is saved.",
    ],
    email: ["Email", "Email"],
    emailPlaceholder: ["nama@instiki.ac.id", "name@instiki.ac.id"],
    name: ["Nama", "Name"],
    optional: ["(opsional)", "(optional)"],
    level: ["Level", "Level"],
    selfLevel: [
      "Level akun Anda sendiri tidak dapat diubah, supaya dashboard tidak terkunci tanpa superadmin.",
      "You cannot change your own level, so the dashboard is never left without a superadmin.",
    ],
    unit: ["Unit", "Unit"],
    unitPlaceholder: ["Biro Keuangan", "Finance Office"],
    unitStaff: [
      "Staf/dosen hanya dapat melihat dan mengelola dokumen dengan unit ini. Pilih dari saran supaya ejaannya sama persis dengan dokumen yang ada.",
      "Staff/lecturers can only see and manage documents with this unit. Pick from the suggestions so the spelling matches existing documents exactly.",
    ],
    unitOther: [
      "Hanya keterangan; admin dan superadmin mengelola dokumen semua unit.",
      "Informational only; admins and superadmins manage documents for every unit.",
    ],
    submitCreate: ["Buat akun", "Create account"],
    updated: ["Akun diperbarui", "Account updated"],
  },
  reset: {
    title: ["Atur ulang kata sandi?", "Reset this password?"],
    body: [
      (email: string) =>
        `${email} langsung keluar dari semua sesinya dan hanya dapat masuk dengan kata sandi sementara baru yang akan ditampilkan sekali.`,
      (email: string) =>
        `${email} is signed out of every session and can only sign in with a new temporary password, shown once.`,
    ],
    confirm: ["Atur ulang", "Reset"],
    working: ["Memproses…", "Working…"],
    failed: ["Gagal mengatur ulang", "Could not reset"],
  },
  remove: {
    title: ["Hapus akun secara permanen?", "Delete this account permanently?"],
    body: [
      (email: string) =>
        `${email} dihapus dan langsung kehilangan akses. Dokumen yang pernah diunggahnya tidak ikut terhapus. Untuk menghentikan akses sementara, pilih Nonaktifkan saja.`,
      (email: string) =>
        `${email} is deleted and loses access immediately. Documents they uploaded are kept. To stop access temporarily, deactivate the account instead.`,
    ],
    confirm: ["Hapus akun", "Delete account"],
    deleting: ["Menghapus…", "Deleting…"],
    deleted: ["Akun dihapus", "Account deleted"],
  },
  password: {
    createdTitle: ["Akun dibuat", "Account created"],
    resetTitle: ["Kata sandi diatur ulang", "Password reset"],
    description: [
      (email: string) =>
        `Kata sandi sementara untuk ${email}. Hanya ditampilkan sekali ini; setelah jendela ditutup, kata sandi tidak dapat dilihat lagi.`,
      (email: string) =>
        `The temporary password for ${email}. Shown this once only; once this window closes it cannot be seen again.`,
    ],
    label: ["Kata sandi sementara", "Temporary password"],
    copy: ["Salin", "Copy"],
    copied: ["Tersalin", "Copied"],
    copyFailed: ["Tidak dapat menyalin otomatis", "Could not copy automatically"],
    copyFailedBody: [
      "Pilih teks kata sandi, lalu salin secara manual.",
      "Select the password text and copy it by hand.",
    ],
    handover: [
      "Serahkan lewat jalur yang aman, bukan grup percakapan. Minta pemilik akun segera menggantinya lewat menu akun di pojok kiri bawah, pilih Ganti kata sandi.",
      "Hand it over through a secure channel, not a group chat. Ask the account holder to change it straight away from the account menu in the bottom-left corner, under Change password.",
    ],
    done: ["Selesai", "Done"],
  },
} as const
