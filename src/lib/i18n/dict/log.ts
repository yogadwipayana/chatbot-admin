/** Label bersama log percakapan, pertanyaan tak terjawab, dan umpan balik. */

export const labels = {
  kind: {
    answer: ["Dijawab", "Answered"],
    refusal: ["Ditolak", "Declined"],
    support: ["Dialihkan ke konseling", "Referred to counselling"],
    smalltalk: ["Sapaan", "Small talk"],
    rejected: ["Di luar topik", "Off-topic"],
  },
  topic: {
    deadline: ["Tenggat waktu", "Deadlines"],
    syarat_kelulusan: ["Syarat kelulusan", "Graduation requirements"],
    pembayaran: ["Pembayaran", "Payments"],
    sanksi: ["Sanksi", "Penalties"],
    drop_out: ["Drop out (DO)", "Dropping out"],
  },
  /** Kalimat yang dilihat mahasiswa saat kill switch aktif. Selalu bahasa
      Indonesia: yang membacanya mahasiswa di jendela chat, bukan admin. */
  closedMessage: [
    "Layanan chat sedang dinonaktifkan sementara. Silakan hubungi Front Office INSTIKI: Telepon (0361) 256995 / WhatsApp +62 813-3982-2383.",
    "Layanan chat sedang dinonaktifkan sementara. Silakan hubungi Front Office INSTIKI: Telepon (0361) 256995 / WhatsApp +62 813-3982-2383.",
  ],
  periods: {
    d7: ["7 hari terakhir", "Last 7 days"],
    d30: ["30 hari terakhir", "Last 30 days"],
    d90: ["90 hari terakhir", "Last 90 days"],
    all: ["Semua waktu", "All time"],
    label: ["Periode", "Period"],
  },
  testQuery: ["Uji coba", "Test it"],
  unitTopic: [(unit: string) => ` · Topik ${unit}`, (unit: string) => ` · Topic ${unit}`],
  /** Alasan penolakan (`RefusalReason`), menggantikan skor kemiripan: skor e5
      hampir selalu 0,77–0,93 sehingga tidak membedakan apa pun. */
  refusalReason: {
    no_documents: ["Unit belum punya dokumen", "Unit has no documents yet"],
    below_threshold: [
      "Dokumen yang ditemukan kurang relevan",
      "Documents found were not relevant enough",
    ],
    llm: ["Model AI menilai dokumen tidak cukup", "AI model judged the documents insufficient"],
  },
} as const

export const unanswered = {
  title: ["Pertanyaan tak terjawab", "Unanswered questions"],
  description: [
    "Pertanyaan yang ditolak chatbot. Mulai dari kelompok terbesar: lengkapi dokumennya, uji ulang, lalu tandai selesai.",
    "Questions the chatbot declined. Start with the largest group: fix the documents, test again, then mark it done.",
  ],
  staffNote: [
    "Akun Staf/Dosen dapat melihat dan menguji pertanyaan ini. Menandai selesai dilakukan oleh Admin.",
    "Staff/Lecturer accounts can view and test these questions. Marking them done is an Admin action.",
  ],
  tabs: {
    open: ["Belum ditindaklanjuti", "Not handled yet"],
    done: ["Sudah", "Handled"],
    all: ["Semua", "All"],
  },
  emptyDone: ["Belum ada yang ditandai selesai", "Nothing marked done yet"],
  emptyDoneBody: [
    "Pertanyaan yang sudah ditindaklanjuti pada periode ini akan muncul di sini.",
    "Questions handled during this period will show up here.",
  ],
  // Tab "Belum" bisa kosong karena semuanya sudah ditandai selesai, jadi jangan
  // katakan semua pertanyaan dapat dijawab -- itu hanya benar untuk tab Semua.
  emptyPending: ["Tidak ada yang perlu ditindaklanjuti", "Nothing left to handle"],
  emptyPendingBody: [
    "Tidak ada penolakan pada periode ini yang belum ditandai selesai. Yang sudah ditindaklanjuti ada di tab Sudah.",
    "No declined question in this period is still waiting to be marked done. Handled ones are under the Handled tab.",
  ],
  emptyOpen: ["Tidak ada pertanyaan tak terjawab", "No unanswered questions"],
  emptyOpenBody: [
    "Semua pertanyaan mahasiswa pada periode ini dapat dijawab dari dokumen resmi.",
    "Every student question in this period could be answered from the official documents.",
  ],
  summary: [
    (pertanyaan: string, kelompok: string) => `${pertanyaan} pertanyaan dalam ${kelompok} kelompok`,
    (pertanyaan: string, kelompok: string) => `${pertanyaan} questions in ${kelompok} groups`,
  ],
  /** Setiap kelompok berisi satu pertanyaan: jumlah kelompok hanya mengulang angka yang sama. */
  summaryUngrouped: [
    (pertanyaan: string) => `${pertanyaan} pertanyaan`,
    (pertanyaan: string) => `${pertanyaan} questions`,
  ],
  times: ["kali", "times"],
  lastAsked: [
    (kapan: string) => `Terakhir ditanyakan ${kapan}`,
    (kapan: string) => `Last asked ${kapan}`,
  ],
  handled: ["Sudah ditindaklanjuti", "Handled"],
  collapse: ["Ringkas pertanyaan", "Collapse question"],
  expand: ["Lihat pertanyaan lengkap", "See the full question"],
  reopen: ["Buka kembali", "Reopen"],
  markDone: ["Tandai selesai", "Mark done"],
  markedDone: ["Ditandai sudah ditindaklanjuti", "Marked as handled"],
  reopened: ["Dibuka kembali", "Reopened"],
  reasonHint: [
    "“Unit belum punya dokumen”: unggah dokumen untuk unit itu. “Model AI menilai dokumen tidak cukup”: dokumennya ada tetapi tidak memuat jawabannya; perbarui dokumennya atau tambahkan tanya jawab.",
    "“Unit has no documents yet”: upload documents for that unit. “AI model judged the documents insufficient”: the documents exist but do not contain the answer; update them or add a Q&A entry.",
  ],
} as const

export const feedback = {
  title: ["Umpan balik", "Feedback"],
  description: [
    "Penilaian 👍/👎 mahasiswa beserta pertanyaan, jawaban, dan catatannya. Telusuri yang tidak membantu, perbaiki dokumennya, lalu uji ulang.",
    "Students' 👍/👎 ratings with the question, the answer, and their note. Work through the unhelpful ones, fix the documents, then test again.",
  ],
  tabs: {
    unhelpful: ["Tidak membantu", "Unhelpful"],
    helpful: ["Membantu", "Helpful"],
    all: ["Semua", "All"],
  },
  emptyUnhelpful: [
    "Tidak ada jawaban yang ditandai tidak membantu",
    "No answers marked unhelpful",
  ],
  emptyUnhelpfulBody: [
    "Pada periode ini tidak ada mahasiswa yang menandai jawaban chatbot tidak membantu.",
    "No student marked a chatbot answer unhelpful during this period.",
  ],
  empty: ["Belum ada umpan balik", "No feedback yet"],
  emptyBody: [
    "Umpan balik dikirim mahasiswa dengan satu klik 👍/👎 di bawah jawaban chatbot. Belum ada yang masuk pada periode ini.",
    "Students send feedback with a single 👍/👎 click under an answer. None has come in during this period.",
  ],
  summary: [
    (jumlah: string) => `${jumlah} umpan balik pada periode ini`,
    (jumlah: string) => `${jumlah} pieces of feedback in this period`,
  ],
  summaryPositive: [
    (persen: string) => ` · ${persen} menilai jawaban membantu`,
    (persen: string) => ` · ${persen} found the answer helpful`,
  ],
  helpful: ["Membantu", "Helpful"],
  unhelpful: ["Tidak membantu", "Unhelpful"],
  questionGone: ["Pertanyaannya sudah tidak ada di log", "The question is no longer in the log"],
  collapse: ["Ringkas jawaban", "Collapse answer"],
  expand: ["Lihat jawaban lengkap", "See the full answer"],
  note: [
    "Pertanyaan sensitif tampil sebagai penanda tetap, bukan kalimat aslinya; jawabannya berupa pengalihan ke layanan konseling.",
    "Sensitive questions show as a fixed placeholder, not as written; their answer is a referral to counselling.",
  ],
} as const
