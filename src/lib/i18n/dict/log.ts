/** Label bersama log percakapan, pertanyaan tak terjawab, dan umpan balik. */

export const labels = {
  kind: {
    answer: ["Dijawab", "Answered"],
    refusal: ["Ditolak", "Declined"],
    support: ["Dialihkan ke konseling", "Referred to counselling"],
    smalltalk: ["Sapaan", "Small talk"],
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
    "Layanan chat sedang dinonaktifkan sementara. Silakan hubungi Biro Administrasi Akademik pada jam kerja.",
    "Layanan chat sedang dinonaktifkan sementara. Silakan hubungi Biro Administrasi Akademik pada jam kerja.",
  ],
  periods: {
    d7: ["7 hari terakhir", "Last 7 days"],
    d30: ["30 hari terakhir", "Last 30 days"],
    d90: ["90 hari terakhir", "Last 90 days"],
    all: ["Semua waktu", "All time"],
    label: ["Periode", "Period"],
  },
  testQuery: ["Uji coba", "Test it"],
} as const

export const unanswered = {
  title: ["Pertanyaan tak terjawab", "Unanswered questions"],
  description: [
    "Pertanyaan yang ditolak chatbot karena dokumen resmi tidak cukup mendukung jawabannya. Tindak lanjuti kelompok terbesar lebih dulu: unggah atau perbarui dokumen yang menjawabnya, uji ulang, lalu tandai selesai.",
    "Questions the chatbot declined because the official documents did not support an answer. Start with the largest group: upload or update the document that answers it, test again, then mark it done.",
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
  emptyOpen: ["Tidak ada pertanyaan tak terjawab", "No unanswered questions"],
  emptyOpenBody: [
    "Semua pertanyaan mahasiswa pada periode ini dapat dijawab dari dokumen resmi.",
    "Every student question in this period could be answered from the official documents.",
  ],
  summary: [
    (pertanyaan: string, kelompok: string) => `${pertanyaan} pertanyaan dalam ${kelompok} kelompok`,
    (pertanyaan: string, kelompok: string) => `${pertanyaan} questions in ${kelompok} groups`,
  ],
  times: ["kali", "times"],
  lastAsked: [
    (kapan: string) => `Terakhir ditanyakan ${kapan}`,
    (kapan: string) => `Last asked ${kapan}`,
  ],
  avgScore: [
    (skor: string) => ` · Skor kemiripan rata-rata ${skor}`,
    (skor: string) => ` · Average similarity score ${skor}`,
  ],
  handled: ["Sudah ditindaklanjuti", "Handled"],
  reopen: ["Buka kembali", "Reopen"],
  markDone: ["Tandai selesai", "Mark done"],
  markedDone: ["Ditandai sudah ditindaklanjuti", "Marked as handled"],
  reopened: ["Dibuka kembali", "Reopened"],
  scoreHint: [
    "Skor kemiripan (0–1) menunjukkan seberapa dekat pertanyaan dengan isi dokumen terbaik. Skor yang mendekati ambang berarti dokumennya mungkin sudah ada tetapi kalimatnya tidak cocok: periksa lewat Uji coba. Skor sangat rendah berarti informasinya memang belum ada di dokumen mana pun.",
    "The similarity score (0–1) shows how close a question is to the best matching document. A score near the threshold means the document may exist but the wording does not match: check with Test answers. A very low score means the information is not in any document yet.",
  ],
} as const

export const feedback = {
  title: ["Umpan balik", "Feedback"],
  description: [
    "Penilaian mahasiswa atas jawaban chatbot. Rasio kepuasan di Statistik memberi tahu ada yang salah; halaman ini memberi tahu apanya — pertanyaan yang memicunya, jawaban yang diberikan, dan catatan mahasiswa bila ada. Telusuri jawaban yang ditandai tidak membantu, lalu uji ulang setelah dokumennya diperbaiki.",
    "How students rated the chatbot's answers. The satisfaction ratio on Statistics tells you something is wrong; this page tells you what — the question behind it, the answer given, and the student's note where there is one. Work through the answers marked unhelpful, then test again once the document is fixed.",
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
  score: [(skor: string) => ` · Skor kemiripan ${skor}`, (skor: string) => ` · Similarity score ${skor}`],
  note: [
    "Umpan balik dikirim satu klik tanpa kotak isian wajib, jadi sebagian besar tidak disertai catatan. Pertanyaan sensitif tidak pernah disimpan apa adanya: yang tampil adalah penanda tetap, dan jawabannya memang berupa pengalihan ke layanan konseling.",
    "Feedback is one click with no required text box, so most of it carries no note. Sensitive questions are never stored as written: what you see is a fixed placeholder, and the answer really was a referral to counselling.",
  ],
} as const
