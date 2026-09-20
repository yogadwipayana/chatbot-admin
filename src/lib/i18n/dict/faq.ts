/** Entri tanya jawab: daftar, formulir, dan hapus. */

export const faq = {
  title: ["Tanya jawab", "Q&A entries"],
  description: [
    "Jawaban siap pakai yang Anda tulis sendiri, tanpa perlu dokumen PDF. Chatbot memakainya persis seperti dokumen resmi, lengkap dengan kartu sumber.",
    "Ready-made answers you write yourself, with no PDF needed. The chatbot treats them exactly like an official document, citation card and all.",
  ],
  descriptionStaff: [
    (unit: string) =>
      `Jawaban siap pakai untuk unit ${unit}, tanpa perlu dokumen PDF. Chatbot memakainya persis seperti dokumen resmi, lengkap dengan kartu sumber.`,
    (unit: string) =>
      `Ready-made answers for ${unit}, with no PDF needed. The chatbot treats them exactly like an official document, citation card and all.`,
  ],
  add: ["Tambah tanya jawab", "Add a Q&A entry"],
  empty: ["Belum ada tanya jawab", "No Q&A entries yet"],
  emptyBody: [
    "Tulis pertanyaan yang sering masuk beserta jawabannya. Begitu tersimpan, chatbot langsung memakainya — tidak perlu menunggu dokumen resmi terbit.",
    "Write down a question that keeps coming in, with its answer. The chatbot uses it the moment you save — no waiting for an official document.",
  ],
  emptyAction: ["Tambah yang pertama", "Add the first one"],
  columns: {
    entry: ["Pertanyaan dan jawaban", "Question and answer"],
    unit: ["Unit", "Unit"],
  },
  rowActions: [
    (pertanyaan: string) => `Aksi untuk ${pertanyaan}`,
    (pertanyaan: string) => `Actions for ${pertanyaan}`,
  ],
  edit: ["Ubah", "Edit"],
  activated: ["Diaktifkan kembali", "Activated again"],
  deactivated: ["Dinonaktifkan", "Deactivated"],
  activatedExpired: [
    "Masa berlakunya sudah habis, jadi chatbot belum memakainya sampai tanggal berlaku diperbarui.",
    "Its valid-until date has passed, so the chatbot will not use it until that date is updated.",
  ],
  activatedDetail: [
    "Chatbot kembali memakainya mulai pertanyaan berikutnya.",
    "The chatbot uses it again from the next question onwards.",
  ],
  deactivatedDetail: [
    "Chatbot berhenti memakainya mulai pertanyaan berikutnya. Isinya tidak dihapus.",
    "The chatbot stops using it from the next question onwards. Its content is kept.",
  ],
  form: {
    editTitle: ["Ubah tanya jawab", "Edit Q&A entry"],
    addTitle: ["Tambah tanya jawab", "Add Q&A entry"],
    description: [
      "Pertanyaannya ikut tampil sebagai judul sumber pada jawaban yang dibaca mahasiswa, jadi tulis seperti mereka menanyakannya.",
      "The question doubles as the source title students see under an answer, so phrase it the way they would ask it.",
    ],
    question: ["Pertanyaan", "Question"],
    questionPlaceholder: [
      "Bagaimana cara mengurus KTM yang hilang?",
      "How do I replace a lost student ID card?",
    ],
    answer: ["Jawaban", "Answer"],
    answerPlaceholder: [
      "Laporkan kehilangan ke kepolisian, lalu bawa surat kehilangan beserta fotokopi KTP ke loket 3.",
      "Report the loss to the police, then bring the report and a copy of your ID to counter 3.",
    ],
    answerHint: [
      "Tulis lengkap dalam kalimat utuh. Chatbot hanya boleh menjawab dari yang tertulis di sini, dan tidak akan menyimpulkan sendiri.",
      "Write it out in full sentences. The chatbot may only answer from what is written here; it will not infer the rest.",
    ],
    unitLocked: [
      "Akun Staf/Dosen hanya dapat mengelola isi unitnya sendiri.",
      "Staff/Lecturer accounts can only manage their own unit's content.",
    ],
    unitHint: [
      "Unit yang bertanggung jawab atas jawaban ini.",
      "The unit responsible for this answer.",
    ],
    expiryHint: [
      "Setelah tanggal ini chatbot otomatis berhenti memakainya. Kosongkan bila berlaku tanpa batas.",
      "After this date the chatbot stops using it automatically. Leave it empty for no expiry.",
    ],
    submitAdd: ["Tambah", "Add"],
    added: ["Tanya jawab ditambahkan", "Q&A entry added"],
    addedChunks: [
      (potongan: number) =>
        `Jawaban dipecah menjadi ${potongan} potongan dan langsung dipakai chatbot.`,
      (potongan: number) => `The answer became ${potongan} chunks and is in use by the chatbot.`,
    ],
    addedSingle: [
      "Chatbot langsung memakainya untuk pertanyaan berikutnya.",
      "The chatbot uses it from the very next question.",
    ],
    saved: ["Tersimpan", "Saved"],
    savedReindexed: [
      "Isinya diindeks ulang, jadi chatbot memakai versi baru mulai pertanyaan berikutnya.",
      "It was re-indexed, so the chatbot uses the new version from the next question onwards.",
    ],
  },
  remove: {
    title: ["Hapus tanya jawab ini?", "Delete this Q&A entry?"],
    body: [
      (pertanyaan: string) =>
        `“${pertanyaan}” dihapus permanen beserta indeksnya dan tidak dapat dikembalikan. Untuk sekadar menghentikan pemakaiannya, pilih Nonaktifkan saja.`,
      (pertanyaan: string) =>
        `“${pertanyaan}” and its index are deleted for good, with no way back. To merely stop it being used, deactivate it instead.`,
    ],
    confirm: ["Hapus", "Delete"],
    deleting: ["Menghapus…", "Deleting…"],
    deleted: ["Tanya jawab dihapus", "Q&A entry deleted"],
  },
} as const
