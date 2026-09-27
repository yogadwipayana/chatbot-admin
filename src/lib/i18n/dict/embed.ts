/** Kunci sematan: situs lain yang memasang asisten (khusus superadmin). */

export const embedKeys = {
  title: ["Sematan", "Embeds"],
  description: [
    "Situs lain yang boleh memasang asisten, misalnya situs PMB atau LMS. Setiap situs punya kunci sendiri, sehingga satu situs dapat dibatasi, dinonaktifkan, atau dihapus tanpa menyentuh yang lain.",
    "Other sites allowed to embed the assistant, such as the admissions site or the LMS. Each site has its own key, so one site can be restricted, turned off, or removed without touching the others.",
  ],
  add: ["Buat kunci", "Create key"],
  empty: ["Belum ada kunci sematan", "No embed keys yet"],
  emptyBody: [
    "Buat satu kunci untuk setiap situs yang ingin memasang asisten. Kode sematan siap tempel ditampilkan setelah kunci dibuat.",
    "Create one key for each site that wants to embed the assistant. A ready-to-paste embed code is shown once the key is created.",
  ],
  notSecret: [
    "Kunci bukan rahasia: ia tertulis di kode sumber situs penyemat dan dapat disalin siapa pun. Yang membatasi pemakaiannya adalah daftar situs — isi di produksi, karena setiap pertanyaan memakai kuota model AI kampus.",
    "Keys are not secret: they sit in the embedding site's source code and anyone can copy them. What limits their use is the site list — fill it in for production, since every question uses the campus AI quota.",
  ],
  columns: {
    site: ["Situs", "Site"],
    allowed: ["Situs diizinkan", "Allowed sites"],
    status: ["Status", "Status"],
    questions: ["Pertanyaan 30 hari", "Questions, 30 days"],
    lastUsed: ["Terakhir dipakai", "Last used"],
    actions: ["Aksi", "Actions"],
  },
  anySite: ["Semua situs", "Any site"],
  anySiteHint: [
    "Belum dibatasi: situs mana pun yang menyalin kunci ini dapat memakainya.",
    "Not restricted: any site that copies this key can use it.",
  ],
  active: ["Aktif", "Active"],
  inactive: ["Nonaktif", "Inactive"],
  neverUsed: ["Belum pernah", "Never"],
  rowActions: [(nama: string) => `Aksi untuk ${nama}`, (nama: string) => `Actions for ${nama}`],
  copyCode: ["Salin kode sematan", "Copy embed code"],
  edit: ["Ubah", "Edit"],
  activate: ["Aktifkan", "Activate"],
  deactivate: ["Nonaktifkan", "Deactivate"],
  delete: ["Hapus permanen", "Delete permanently"],
  activated: ["Kunci diaktifkan", "Key activated"],
  deactivated: ["Kunci dinonaktifkan", "Key deactivated"],
  activatedBody: [
    (nama: string) => `Asisten kembali tersedia di ${nama}.`,
    (nama: string) => `The assistant is available again on ${nama}.`,
  ],
  deactivatedBody: [
    (nama: string) =>
      `${nama} kini menampilkan "Asisten tidak tersedia", termasuk panel yang sedang terbuka.`,
    (nama: string) =>
      `${nama} now shows "Assistant unavailable", including panels that are already open.`,
  ],
  form: {
    addTitle: ["Buat kunci sematan", "Create embed key"],
    addDescription: [
      "Kuncinya dibuat otomatis dan langsung aktif.",
      "The key is generated for you and is active straight away.",
    ],
    editTitle: ["Ubah kunci sematan", "Edit embed key"],
    editDescription: [
      "Berlaku saat panel dibuka berikutnya. Situs penyemat tidak perlu mengganti kodenya.",
      "Takes effect the next time the panel opens. The embedding site does not need to change its code.",
    ],
    name: ["Nama situs", "Site name"],
    namePlaceholder: ["Situs PMB", "Admissions site"],
    nameHint: [
      "Hanya untuk dashboard ini; tidak dilihat mahasiswa.",
      "Only shown in this dashboard; students never see it.",
    ],
    sites: ["Situs diizinkan", "Allowed sites"],
    optional: ["(opsional)", "(optional)"],
    sitePlaceholder: ["https://pmb.instiki.ac.id", "https://pmb.instiki.ac.id"],
    siteLabel: [(n: number) => `Situs ${n}`, (n: number) => `Site ${n}`],
    addSite: ["Tambah situs", "Add site"],
    removeSite: [
      (asal: string) => `Hapus ${asal || "baris ini"}`,
      (asal: string) => `Remove ${asal || "this row"}`,
    ],
    sitesHint: [
      "Alamat lengkap tanpa path, mis. https://pmb.instiki.ac.id. https://*.instiki.ac.id mencakup semua subdomain.",
      "Full address without a path, e.g. https://pmb.instiki.ac.id. https://*.instiki.ac.id covers every subdomain.",
    ],
    sitesEmpty: [
      "Kosong = situs mana pun boleh memakai kunci ini.",
      "Empty = any site may use this key.",
    ],
    submitCreate: ["Buat kunci", "Create key"],
    updated: ["Kunci diperbarui", "Key updated"],
  },
  code: {
    createdTitle: ["Kunci sematan dibuat", "Embed key created"],
    title: [(nama: string) => `Kode sematan · ${nama}`, (nama: string) => `Embed code · ${nama}`],
    description: [
      "Berikan baris ini kepada pengelola situs. Tempel tepat sebelum </body>, di setiap halaman atau sekali di template situs.",
      "Give this line to the site's maintainer. Paste it just before </body>, on every page or once in the site template.",
    ],
    label: ["Kode sematan", "Embed code"],
    copy: ["Salin", "Copy"],
    copied: ["Tersalin", "Copied"],
    copyFailed: ["Tidak dapat menyalin", "Could not copy"],
    copyFailedBody: [
      "Pilih teksnya lalu salin manual (Ctrl+C).",
      "Select the text and copy it manually (Ctrl+C).",
    ],
    csp: [
      "Bila situs itu memakai Content-Security-Policy, domain portal perlu diizinkan di script-src dan frame-src.",
      "If that site uses a Content-Security-Policy, the portal domain must be allowed in script-src and frame-src.",
    ],
    anySiteWarning: [
      "Kunci ini belum dibatasi ke situs tertentu. Tambahkan domain situsnya lewat Ubah sebelum dipakai di produksi.",
      "This key is not restricted to any site yet. Add the site's domain via Edit before using it in production.",
    ],
    portalMissingTitle: ["Alamat portal belum diatur", "Portal address not set"],
    portalMissingBody: [
      "PORTAL_URL di .env API masih kosong, jadi alamat portal di kode ini hanya contoh. Ganti <domain-portal> dengan domain portal mahasiswa, atau minta pengelola server mengisi PORTAL_URL.",
      "PORTAL_URL in the API's .env is empty, so the portal address in this code is only a placeholder. Replace <domain-portal> with the student portal's domain, or ask the server maintainer to set PORTAL_URL.",
    ],
    done: ["Selesai", "Done"],
  },
  remove: {
    title: ["Hapus kunci sematan?", "Delete embed key?"],
    body: [
      (nama: string) =>
        `Situs ${nama} akan menampilkan "Asisten tidak tersedia" dan hanya dapat memasang asisten lagi dengan kunci baru. Percakapan dari situs ini tetap tersimpan.`,
      (nama: string) =>
        `${nama} will show "Assistant unavailable" and can only embed the assistant again with a new key. Conversations from this site are kept.`,
    ],
    suggestDeactivate: [
      " Untuk menghentikan sementara, nonaktifkan saja — kodenya tetap berlaku saat diaktifkan lagi.",
      " To pause it, just deactivate it — the same code works again once reactivated.",
    ],
    deactivateInstead: ["Nonaktifkan saja", "Deactivate instead"],
    deleting: ["Menghapus…", "Deleting…"],
    deleted: ["Kunci dihapus", "Key deleted"],
  },
} as const
