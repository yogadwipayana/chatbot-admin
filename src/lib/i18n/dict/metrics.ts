/** Statistik dan pemilih rentang tanggalnya. */

export const range = {
  d7: ["7 hari", "7 days"],
  d30: ["30 hari", "30 days"],
  d90: ["90 hari", "90 days"],
  custom: ["Pilih tanggal", "Pick dates"],
  invalid: [
    "Pilih tanggal awal dan akhir, dengan tanggal awal tidak setelah tanggal akhir.",
    "Pick a start and an end date, with the start no later than the end.",
  ],
  between: [
    (sejak: string, sampai: string) => `${sejak} sampai ${sampai}`,
    (sejak: string, sampai: string) => `${sejak} to ${sampai}`,
  ],
} as const

export const stats = {
  title: ["Statistik", "Statistics"],
  description: [
    "Seberapa membantu chatbot bagi mahasiswa.",
    "How much the chatbot helps students.",
  ],
  empty: ["Belum ada pertanyaan pada periode ini", "No questions in this period"],
  feedbackRatio: ["Umpan balik positif", "Positive feedback"],
  feedbackNone: ["Belum ada umpan balik pada periode ini.", "No feedback in this period yet."],
  feedbackMeets: [
    (target: string) => `Memenuhi target ≥ ${target}`,
    (target: string) => `Meets the ≥ ${target} target`,
  ],
  feedbackBelow: [
    (target: string) => `Di bawah target ≥ ${target}`,
    (target: string) => `Below the ≥ ${target} target`,
  ],
  feedbackFrom: [
    (jumlah: string) => `dari ${jumlah} umpan balik`,
    (jumlah: string) => `from ${jumlah} responses`,
  ],
  unanswered: ["Pertanyaan tak terjawab", "Unanswered questions"],
  unansweredMeets: [
    (target: string) => `Memenuhi target < ${target}`,
    (target: string) => `Meets the < ${target} target`,
  ],
  unansweredAbove: [
    (target: string) => `Di atas target < ${target}`,
    (target: string) => `Above the < ${target} target`,
  ],
  unansweredOf: [
    (ditolak: string, total: string) => `${ditolak} dari ${total} pertanyaan · `,
    (ditolak: string, total: string) => `${ditolak} of ${total} questions · `,
  ],
  seeList: ["Lihat daftar", "See the list"],
  latency: ["Waktu proses (p95)", "Processing time (p95)"],
  latencyNote: [
    "95% jawaban selesai dalam waktu ini.",
    "95% of answers finish within this.",
  ],
  volumeTitle: ["Pertanyaan per hari", "Questions per day"],
  volumeDescription: [
    (pertanyaan: string, percakapan: string) =>
      `${pertanyaan} pertanyaan dalam ${percakapan} percakapan. Volume adalah konteks, bukan ukuran keberhasilan: angka tinggi juga bisa berarti mahasiswa bertanya berulang karena jawaban kurang membantu.`,
    (pertanyaan: string, percakapan: string) =>
      `${pertanyaan} questions across ${percakapan} conversations. Volume is context, not a measure of success: a high number can also mean students keep re-asking because the answers do not help.`,
  ],
  volumeSeries: ["Pertanyaan", "Questions"],
  date: ["Tanggal", "Date"],
  kindTitle: ["Jenis balasan", "Reply types"],
  topicTitle: ["Topik berisiko tinggi", "High-risk topics"],
  topicDescription: [
    "Jawaban pada topik ini selalu disertai kontak unit resmi.",
    "Answers on these topics always carry the responsible unit's contact details.",
  ],
  topicEmpty: [
    "Belum ada pertanyaan pada topik berisiko.",
    "No questions on high-risk topics yet.",
  ],
  programTitle: ["Pertanyaan per prodi", "Questions by study program"],
  intakeTitle: ["Pertanyaan per angkatan", "Questions by intake year"],
  profileCoverage: [
    (dengan: string, total: string) =>
      `${dengan} dari ${total} pertanyaan menyertakan NIM. Penanya tanpa NIM dan pesan sensitif tidak terhitung di sini.`,
    (dengan: string, total: string) =>
      `${dengan} of ${total} questions came with a student ID. Askers without one and sensitive messages are not counted here.`,
  ],
  profileEmpty: [
    "Belum ada pertanyaan yang menyertakan NIM pada periode ini.",
    "No questions came with a student ID in this period.",
  ],
  programColumn: ["Prodi", "Program"],
  intakeColumn: ["Angkatan", "Intake"],
  questionsColumn: ["Pertanyaan", "Questions"],
  unansweredColumn: ["Tak terjawab", "Unanswered"],
} as const
