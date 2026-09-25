/** Kelola daftar unit layanan (tabel `units`, khusus superadmin). */

export const units = {
  title: ["Unit", "Units"],
  description: [
    "Daftar unit layanan yang tampil di menu chatbot mahasiswa dan dapat dipilih untuk dokumen, tanya jawab, dan akun staf. Unit tidak dihapus; nonaktifkan untuk menyembunyikannya.",
    "The service units shown in the student chatbot menu and available for documents, Q&A entries, and staff accounts. Units are never deleted; deactivate one to hide it.",
  ],
  add: ["Tambah unit", "Add unit"],
  empty: ["Belum ada unit", "No units yet"],
  columns: {
    order: ["Urutan", "Order"],
    unit: ["Unit", "Unit"],
    documents: ["Dokumen", "Documents"],
    accounts: ["Akun", "Accounts"],
    status: ["Status", "Status"],
  },
  active: ["Aktif", "Active"],
  inactive: ["Nonaktif", "Inactive"],
  rowActions: [(nama: string) => `Aksi untuk ${nama}`, (nama: string) => `Actions for ${nama}`],
  edit: ["Ubah", "Edit"],
  activate: ["Aktifkan", "Activate"],
  deactivate: ["Nonaktifkan", "Deactivate"],
  activated: ["Unit diaktifkan", "Unit activated"],
  deactivated: ["Unit dinonaktifkan", "Unit deactivated"],
  activatedBody: [
    (nama: string) => `${nama} kembali tampil di menu chatbot.`,
    (nama: string) => `${nama} is back in the chatbot menu.`,
  ],
  deactivatedBody: [
    (nama: string) =>
      `${nama} disembunyikan dari menu chatbot dan pilihan unit. Dokumen dan akunnya tetap ada.`,
    (nama: string) =>
      `${nama} is hidden from the chatbot menu and unit pickers. Its documents and accounts are kept.`,
  ],
  form: {
    addTitle: ["Tambah unit", "Add unit"],
    addDescription: [
      "Unit baru langsung tampil di menu chatbot dan dapat dipilih di dashboard.",
      "A new unit appears in the chatbot menu and the dashboard straight away.",
    ],
    editTitle: ["Ubah unit", "Edit unit"],
    name: ["Nama", "Name"],
    namePlaceholder: ["Perpustakaan", "Perpustakaan"],
    nameHint: [
      "Nama resmi yang dilihat mahasiswa. Huruf besar-kecil tidak membedakan unit.",
      "The official name students see. Letter case does not make two units different.",
    ],
    renameWarning: [
      (dokumen: number, akun: number) =>
        `Nama baru ikut tersimpan di ${dokumen} dokumen dan ${akun} akun unit ini.`,
      (dokumen: number, akun: number) =>
        `The new name is applied to this unit's ${dokumen} documents and ${akun} accounts.`,
    ],
    description: ["Deskripsi", "Description"],
    descriptionHint: [
      "Teks bantu di menu chatbot, mis. kepanjangan singkatan.",
      "Helper text in the chatbot menu, e.g. what an abbreviation stands for.",
    ],
    order: ["Urutan", "Order"],
    orderHint: [
      "Angka kecil tampil lebih dulu di menu. Kosongkan untuk meletakkannya paling akhir.",
      "Smaller numbers appear first in the menu. Leave empty to put it last.",
    ],
    optional: ["(opsional)", "(optional)"],
    submitCreate: ["Tambah unit", "Add unit"],
    created: ["Unit ditambahkan", "Unit added"],
    updated: ["Unit diperbarui", "Unit updated"],
  },
} as const
