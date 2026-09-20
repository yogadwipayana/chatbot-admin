/** Dokumen sumber: daftar, unggah, detail, hapus, dan statusnya. */

export const docStatus = {
  inactive: ["Nonaktif", "Inactive"],
  expired: ["Kedaluwarsa", "Expired"],
  served: ["Dipakai chatbot", "In use by the chatbot"],
  needsReview: ["Perlu ditinjau", "Needs review"],
  stale: {
    expired: [
      "Masa berlaku sudah habis, sehingga tidak lagi dipakai chatbot.",
      "Past its valid-until date, so the chatbot no longer uses it.",
    ],
    old: [
      "Lebih dari 6 bulan tidak diperbarui. Pastikan isinya masih sesuai aturan terbaru.",
      "Not updated in over 6 months. Check that it still matches current rules.",
    ],
  },
  toggle: {
    activated: ["Dokumen diaktifkan", "Document activated"],
    deactivated: ["Dokumen dinonaktifkan", "Document deactivated"],
    activatedExpired: [
      "Masa berlakunya sudah habis, jadi chatbot belum memakainya sampai tanggal berlaku diperbarui.",
      "Its valid-until date has passed, so the chatbot will not use it until that date is updated.",
    ],
    activatedDetail: [
      "Chatbot kembali memakai dokumen ini mulai pertanyaan berikutnya.",
      "The chatbot uses this document again from the next question onwards.",
    ],
    deactivatedDetail: [
      "Chatbot berhenti memakai dokumen ini mulai pertanyaan berikutnya. Potongannya tidak dihapus.",
      "The chatbot stops using this document from the next question onwards. Its chunks are kept.",
    ],
  },
} as const

export const documents = {
  title: ["Dokumen sumber", "Source documents"],
  description: [
    "Dokumen resmi yang menjadi satu-satunya sumber jawaban chatbot. Dokumen yang lewat masa berlaku otomatis berhenti dipakai.",
    "The official documents that are the chatbot's only source of answers. Documents past their valid-until date stop being used automatically.",
  ],
  descriptionStaff: [
    (unit: string) =>
      `Dokumen unit ${unit}. Akun Staf/Dosen hanya dapat melihat dan mengelola dokumen unitnya sendiri. Dokumen yang lewat masa berlaku otomatis berhenti dipakai.`,
    (unit: string) =>
      `Documents for ${unit}. Staff/Lecturer accounts can only see and manage their own unit's documents. Documents past their valid-until date stop being used automatically.`,
  ],
  upload: ["Unggah dokumen", "Upload document"],
  staleAlert: [
    (n: number) => `${n} dokumen aktif perlu ditinjau`,
    (n: number) => `${n} active documents need review`,
  ],
  staleAlertBody: [
    "Lebih dari 6 bulan tidak diperbarui atau sudah lewat masa berlaku. Dokumen usang membuat chatbot menyebarkan informasi lama atas nama kampus.",
    "Not updated in over 6 months, or past their valid-until date. Stale documents make the chatbot spread outdated information in the university's name.",
  ],
  staleAlertAction: ["Tampilkan", "Show them"],
  onlyStale: ["Hanya yang perlu ditinjau", "Only ones needing review"],
  showInactive: ["Tampilkan yang nonaktif", "Show inactive ones"],
  noMatch: ["Tidak ada dokumen yang cocok", "No documents match"],
  noMatchBody: [
    "Ubah filter di atas untuk melihat dokumen lain.",
    "Change the filters above to see other documents.",
  ],
  none: ["Belum ada dokumen", "No documents yet"],
  noneBody: [
    "Chatbot belum dapat menjawab apa pun sampai dokumen resmi diunggah.",
    "The chatbot cannot answer anything until an official document is uploaded.",
  ],
  noneAction: ["Unggah dokumen pertama", "Upload the first document"],
  columns: {
    document: ["Dokumen", "Document"],
    status: ["Status", "Status"],
    validUntil: ["Berlaku sampai", "Valid until"],
    updated: ["Diperbarui", "Updated"],
    chunks: ["Potongan", "Chunks"],
    actions: ["Aksi", "Actions"],
  },
  noExpiry: ["Tanpa batas", "No expiry"],
  rowActions: [(judul: string) => `Aksi untuk ${judul}`, (judul: string) => `Actions for ${judul}`],
  detailAction: ["Detail dan pratinjau", "Details and preview"],
  openPdf: ["Buka PDF", "Open PDF"],
  deactivate: ["Nonaktifkan", "Deactivate"],
  activate: ["Aktifkan", "Activate"],
  deletePermanently: ["Hapus permanen", "Delete permanently"],
  range: [
    (awal: string, akhir: string, total: string) => `${awal}–${akhir} dari ${total}`,
    (awal: string, akhir: string, total: string) => `${awal}–${akhir} of ${total}`,
  ],
  previous: ["Sebelumnya", "Previous"],
  next: ["Berikutnya", "Next"],
} as const

export const deleteDocument = {
  title: ["Hapus dokumen secara permanen?", "Delete this document permanently?"],
  body: [
    (judul: string, potongan: string) =>
      `“${judul}” beserta ${potongan} potongannya akan dihapus dan tidak dapat dikembalikan. Kartu sitasi pada percakapan lama yang menunjuk dokumen ini tidak akan bisa dibuka lagi.`,
    (judul: string, potongan: string) =>
      `“${judul}” and its ${potongan} chunks will be deleted for good. Citation cards in old conversations that point here will no longer open.`,
  ],
  suggestDeactivate: [
    " Bila hanya ingin menghentikan pemakaiannya, pilih Nonaktifkan saja.",
    " If you only want it to stop being used, choose Deactivate instead.",
  ],
  deactivateInstead: ["Nonaktifkan saja", "Deactivate instead"],
  deleting: ["Menghapus…", "Deleting…"],
  deleted: ["Dokumen dihapus", "Document deleted"],
  deactivated: ["Dokumen dinonaktifkan", "Document deactivated"],
  deactivatedBody: [
    "Chatbot berhenti memakainya. Dokumen dapat diaktifkan kembali kapan saja.",
    "The chatbot stops using it. You can activate it again at any time.",
  ],
} as const

export const upload = {
  back: ["Dokumen", "Documents"],
  title: ["Unggah dokumen", "Upload document"],
  description: [
    "Setelah diunggah, dokumen dibaca, dipecah menjadi potongan pendek, dan diindeks. Chatbot langsung memakainya untuk pertanyaan berikutnya.",
    "Once uploaded, the document is read, split into short chunks, and indexed. The chatbot uses it from the very next question.",
  ],
  fileCard: ["Berkas PDF", "PDF file"],
  replaceFile: ["Ganti berkas", "Replace file"],
  dropzone: ["Seret PDF ke sini, atau klik untuk memilih", "Drop a PDF here, or click to choose"],
  dropzoneHint: [
    "Hanya PDF digital. PDF hasil scan tanpa lapisan teks akan ditolak.",
    "Digital PDFs only. Scanned PDFs without a text layer are rejected.",
  ],
  notPdf: [
    (nama: string) => `'${nama}' bukan berkas PDF. Unggah dokumen dalam format PDF.`,
    (nama: string) => `'${nama}' is not a PDF. Upload the document as a PDF.`,
  ],
  infoCard: ["Informasi dokumen", "Document details"],
  infoCardHint: [
    "Judul ditampilkan apa adanya pada kartu sumber yang dilihat mahasiswa.",
    "The title is shown verbatim on the source card students see.",
  ],
  judul: ["Judul resmi", "Official title"],
  judulPlaceholder: ["Panduan Akademik 2026", "Academic Handbook 2026"],
  unit: ["Unit penerbit", "Issuing unit"],
  unitLocked: [
    "Akun Staf/Dosen hanya dapat mengunggah dokumen untuk unitnya sendiri.",
    "Staff/Lecturer accounts can only upload documents for their own unit.",
  ],
  optional: ["(opsional)", "(optional)"],
  tahun: ["Tahun berlaku", "Effective year"],
  validUntil: ["Berlaku sampai", "Valid until"],
  noExpiry: ["Tanpa batas", "No expiry"],
  clearExpiry: ["Jadikan tanpa batas", "Set to no expiry"],
  expiryHint: [
    "Setelah tanggal berlaku, chatbot otomatis berhenti memakai dokumen ini, tanpa perlu ada yang ingat menonaktifkannya. Kosongkan bila dokumen berlaku tanpa batas.",
    "After that date the chatbot stops using this document by itself, with nobody having to remember to deactivate it. Leave it empty if the document has no expiry.",
  ],
  failedTitle: ["Dokumen tidak dapat dipasang", "Document could not be installed"],
  failedGeneric: ["Unggahan gagal.", "Upload failed."],
  uploading: ["Mengunggah berkas…", "Uploading file…"],
  processingTitle: ["Dokumen sedang diproses", "Processing the document"],
  processingBody: [
    "Membaca teks, memecah per halaman, dan mengindeks. Dokumen tebal bisa memakan waktu beberapa menit. Jangan tutup halaman ini.",
    "Reading the text, splitting it per page, and indexing. A thick document can take a few minutes. Do not close this page.",
  ],
  processing: ["Memproses…", "Processing…"],
  submit: ["Unggah dan pasang", "Upload and install"],
  installed: ["Dokumen terpasang", "Document installed"],
  installedBody: [
    (halaman: number, potongan: number) =>
      `${halaman} halaman menjadi ${potongan} potongan dan langsung dipakai chatbot.`,
    (halaman: number, potongan: number) =>
      `${halaman} pages became ${potongan} chunks and are in use by the chatbot right away.`,
  ],
  thinWarning: ["Teks dokumen sangat sedikit", "Very little text in this document"],
  checklistTitle: ["Sebelum mengunggah", "Before you upload"],
  checklist: {
    digitalStrong: ["PDF versi digital asli", "a born-digital PDF"],
    digital: [
      ", bukan hasil scan. PDF scan terlihat terpasang tetapi isinya tidak pernah bisa ditemukan.",
      ", not a scan. A scanned PDF looks installed but its contents can never be found.",
    ],
    digitalLead: ["Pakai ", "Use "],
    titleLead: ["Tulis judul ", "Write the title "],
    titleStrong: ["persis seperti dokumen resmi", "exactly as the official document has it"],
    titleTail: [
      ", karena mahasiswa memakainya untuk memeriksa sumber jawaban.",
      ", because students use it to check where an answer came from.",
    ],
    replaceLead: ["Mengganti dokumen lama? Unggah versi baru, lalu ", "Replacing an old document? Upload the new version, then "],
    replaceStrong: ["nonaktifkan versi lama", "deactivate the old one"],
    replaceTail: [
      " supaya dua aturan yang berbeda tidak dipakai bersamaan.",
      " so two different sets of rules are not in use at once.",
    ],
    preview: [
      "Setelah terpasang, periksa pratinjau potongan: tabel atau daftar bernomor yang terpotong di tengah sering membuat jawaban tidak lengkap.",
      "Once installed, check the chunk preview: tables or numbered lists cut in half are a common cause of incomplete answers.",
    ],
  },
} as const

export const docDetail = {
  otherUnit: ["Dokumen milik unit lain", "This document belongs to another unit"],
  notFound: ["Dokumen tidak ditemukan", "Document not found"],
  notFoundBody: ["Dokumen ini mungkin sudah dihapus.", "It may have been deleted."],
  backToList: ["Kembali ke daftar dokumen", "Back to the document list"],
  delete: ["Hapus", "Delete"],
  installedTitle: ["Dokumen berhasil dipasang", "Document installed"],
  installedBody: [
    "Periksa pratinjau potongan di bawah. Pastikan tabel dan daftar bernomor tidak terpotong di tengah: potongan yang terputus sering membuat jawaban chatbot benar tetapi tidak lengkap.",
    "Check the chunk preview below. Make sure tables and numbered lists are not cut in half: a broken chunk is a common reason the chatbot answers correctly but incompletely.",
  ],
  thinTitle: ["Teks dokumen sangat sedikit", "Very little text in this document"],
  thinBody: [
    "Chatbot hanya membaca teks, bukan gambar. Bila langkah-langkahnya ada di dalam tangkapan layar, jawaban chatbot akan ikut tipis. Periksa pratinjau potongan di bawah, lalu pertimbangkan menambahkan keterangan teks pada tiap langkah.",
    "The chatbot reads text, not images. If the steps live inside screenshots, its answers will be just as thin. Check the chunk preview below, then consider adding a text caption for each step.",
  ],
  infoCard: ["Informasi dokumen", "Document details"],
  infoCardHint: [
    "Menyimpan perubahan dianggap sebagai peninjauan dan menghapus peringatan “lebih dari 6 bulan tidak diperbarui”.",
    "Saving counts as a review and clears the “not updated in over 6 months” warning.",
  ],
  unitLocked: [
    "Hanya Admin yang dapat memindahkan dokumen ke unit lain.",
    "Only an Admin can move a document to another unit.",
  ],
  expiryOn: [
    "Setelah tanggal ini chatbot otomatis berhenti memakai dokumen.",
    "After this date the chatbot stops using the document automatically.",
  ],
  expiryOff: ["Kosong: berlaku tanpa batas.", "Empty: no expiry."],
  revert: ["Urungkan", "Revert"],
  saved: ["Perubahan disimpan", "Changes saved"],
  uploadedBy: ["Diunggah oleh", "Uploaded by"],
  notRecorded: ["Tidak tercatat", "Not recorded"],
  updated: ["Diperbarui", "Updated"],
  chunks: ["Potongan", "Chunks"],
  previewTitle: ["Pratinjau potongan", "Chunk preview"],
  previewHint: [
    "Dokumen dipecah per halaman menjadi potongan pendek. Potongan inilah yang dicari dan dikutip chatbot saat menjawab.",
    "The document is split per page into short chunks. These chunks are what the chatbot searches and cites.",
  ],
  noChunks: ["Dokumen ini tidak memiliki potongan.", "This document has no chunks."],
  chunkLabel: [(urutan: number) => `Potongan ${urutan}`, (urutan: number) => `Chunk ${urutan}`],
  pageLabel: [(halaman: number) => `Halaman ${halaman}`, (halaman: number) => `Page ${halaman}`],
  showing: [
    (n: string, total: string) => `Menampilkan ${n} dari ${total} potongan`,
    (n: string, total: string) => `Showing ${n} of ${total} chunks`,
  ],
  loading: ["Memuat…", "Loading…"],
  loadMore: ["Muat lebih banyak", "Load more"],
} as const
