/** Kelola daftar unit layanan (tabel `units`) dan kontak PIC-nya (`unit_contacts`), khusus superadmin. */

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
    contacts: ["Kontak PIC", "Contacts"],
    status: ["Status", "Status"],
  },
  /** Unit tanpa kontak PIC: penolakan dan banner eskalasi memakai Front Office. */
  contactsFallback: ["memakai Front Office", "uses Front Office"],
  active: ["Aktif", "Active"],
  /** Unit aktif tanpa dokumen: tampil di menu mahasiswa, tetapi pertanyaannya hampir pasti ditolak. */
  activeEmpty: ["Aktif, belum ada dokumen", "Active, no documents yet"],
  activeEmptyHint: [
    "Tambahkan dokumen atau nonaktifkan unit ini.",
    "Add documents or deactivate this unit.",
  ],
  inactive: ["Nonaktif", "Inactive"],
  rowActions: [(nama: string) => `Aksi untuk ${nama}`, (nama: string) => `Actions for ${nama}`],
  edit: ["Ubah", "Edit"],
  manageContacts: ["Kontak PIC", "Contacts"],
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
      (dokumen: number, akun: number, kontak: number) =>
        `Nama baru ikut tersimpan di ${dokumen} dokumen, ${akun} akun, dan ${kontak} kontak PIC unit ini.`,
      (dokumen: number, akun: number, kontak: number) =>
        `The new name is applied to this unit's ${dokumen} documents, ${akun} accounts, and ${kontak} contacts.`,
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
  /** Dialog kontak PIC per unit (`api/app/units.py`). */
  contacts: {
    title: [(unit: string) => `Kontak PIC ${unit}`, (unit: string) => `${unit} contacts`],
    description: [
      "Tampil di banner eskalasi dan teks penolakan untuk mahasiswa yang memilih unit ini, langsung tanpa deploy. Isi hanya kontak resmi dari kampus.",
      "Shown in the escalation banner and refusal text for students who pick this unit, straight away. Only enter official campus contacts.",
    ],
    empty: [
      "Belum ada kontak. Mahasiswa yang memilih unit ini diarahkan ke Front Office INSTIKI.",
      "No contacts yet. Students who pick this unit are pointed to the INSTIKI Front Office.",
    ],
    add: ["Tambah kontak", "Add contact"],
    close: ["Tutup", "Close"],
    back: ["Kembali", "Back"],
    editAria: [(label: string) => `Ubah ${label}`, (label: string) => `Edit ${label}`],
    deleteAria: [(label: string) => `Hapus ${label}`, (label: string) => `Delete ${label}`],
    updatedBy: [(email: string) => `Diubah oleh ${email}`, (email: string) => `Changed by ${email}`],
    /** Kontak berkata kunci hanya tampil untuk pertanyaan yang menyebut salah satunya. */
    keywordsOnly: [
      (kata: string) => `Hanya untuk pertanyaan yang menyebut: ${kata}`,
      (kata: string) => `Only for questions that mention: ${kata}`,
    ],
    created: ["Kontak ditambahkan", "Contact added"],
    updated: ["Kontak diperbarui", "Contact updated"],
    deleted: ["Kontak dihapus", "Contact deleted"],
    deletedBody: [
      (label: string) => `${label} tidak lagi tampil di widget.`,
      (label: string) => `${label} is no longer shown in the widget.`,
    ],
    form: {
      addTitle: ["Tambah kontak", "Add contact"],
      editTitle: ["Ubah kontak", "Edit contact"],
      label: ["Nama kontak", "Contact name"],
      labelPlaceholder: ["PIC BAAK", "PIC BAAK"],
      labelHint: [
        "Yang dilihat mahasiswa, mis. nama bidang beserta nama petugasnya. Satu baris, tanpa tautan.",
        "What students see, e.g. the office and the person in charge. One line, no links.",
      ],
      whatsapp: ["WhatsApp", "WhatsApp"],
      phone: ["Telepon", "Phone"],
      email: ["Email", "Email"],
      channelsHint: [
        "Isi minimal satu. Nomor berawalan 0 atau +62, mis. +62 812-3456-7890 atau (0361) 256995; nomor WhatsApp dibuka di WhatsApp saat diketuk.",
        "Fill at least one. Numbers start with 0 or +62, e.g. +62 812-3456-7890 or (0361) 256995; WhatsApp numbers open in WhatsApp when tapped.",
      ],
      needChannel: [
        "Isi minimal satu dari WhatsApp, telepon, atau email.",
        "Fill at least one of WhatsApp, phone, or email.",
      ],
      hours: ["Jam layanan", "Service hours"],
      hoursPlaceholder: ["Senin-Jumat, 08.00-16.00 WITA", "Senin-Jumat, 08.00-16.00 WITA"],
      order: ["Urutan", "Order"],
      orderHint: [
        "Angka kecil tampil lebih dulu. Kosongkan untuk meletakkannya paling akhir.",
        "Smaller numbers are shown first. Leave empty to put it last.",
      ],
      optional: ["(opsional)", "(optional)"],
      keywords: ["Kata kunci", "Keywords"],
      keywordsPlaceholder: ["PLK, pembelajaran di luar kampus", "PLK, pembelajaran di luar kampus"],
      keywordsHint: [
        "Kosongkan agar kontak ini selalu tampil untuk unit ini. Bila diisi, kontak hanya tampil saat pertanyaan mahasiswa menyebut salah satu kata ini (pisahkan dengan koma), mis. Admin PLK di unit Akademik hanya untuk urusan PLK. Tidak terlihat oleh mahasiswa.",
        "Leave empty to always show this contact for this unit. If filled, it is only shown when the student's question mentions one of these words (comma-separated), e.g. the PLK admin in Akademik only for PLK matters. Not visible to students.",
      ],
      preview: ["Tampil di widget sebagai", "Shown in the widget as"],
      submitCreate: ["Tambah kontak", "Add contact"],
    },
  },
} as const
