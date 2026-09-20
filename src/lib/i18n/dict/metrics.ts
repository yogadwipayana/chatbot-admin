/** Statistik dan Biaya: keduanya memakai pemilih rentang yang sama. */

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
    "Seberapa membantu chatbot bagi mahasiswa, dan berapa biayanya. Target mengikuti PRD §3.",
    "How much the chatbot helps students, and what it costs. Targets follow PRD §3.",
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
  cost: ["Biaya API berjalan", "API spend so far"],
  costMissing: [
    (jumlah: string) => `${jumlah} jawaban belum terhitung: tarif model belum didaftarkan`,
    (jumlah: string) => `${jumlah} answers not counted: the model's rate is not registered yet`,
  ],
  costNote: [
    "Estimasi dari token terpakai, bukan tagihan resmi.",
    "Estimated from tokens used, not an official invoice.",
  ],
  latency: ["Waktu proses (p95)", "Processing time (p95)"],
  latencyNote: [
    "95% jawaban selesai dalam waktu ini. Target kemunculan kata pertama < 3 dtk.",
    "95% of answers finish within this. The target for the first word is under 3 s.",
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
} as const

export const costs = {
  title: ["Biaya", "Costs"],
  description: [
    "Estimasi belanja model dari messages.meta dan usage_log: LLM chat, embedding pertanyaan, serta ingestion dan reindex. Bukan tagihan resmi penyedia.",
    "Estimated model spend from messages.meta and usage_log: chat LLM, question embedding, plus ingestion and reindexing. Not the provider's official invoice.",
  ],
  empty: ["Belum ada pemanggilan model pada periode ini", "No model calls in this period"],
  sources: {
    llm: ["LLM chat", "Chat LLM"],
    embedding: ["Embedding pertanyaan", "Question embedding"],
    ingestion: ["Ingestion & reindex", "Ingestion & reindexing"],
  },
  total: ["Total biaya", "Total cost"],
  totalRange: [(hari: string) => `Rentang ${hari} hari.`, (hari: string) => `Over ${hari} days.`],
  noPrevious: [
    (hari: string) => `Tidak ada biaya pada ${hari} hari sebelumnya.`,
    (hari: string) => `No cost in the previous ${hari} days.`,
  ],
  flat: ["Setara", "Flat"],
  versusPrevious: [
    (hari: string, biaya: string) => `dari ${hari} hari sebelumnya (${biaya})`,
    (hari: string, biaya: string) => `vs the previous ${hari} days (${biaya})`,
  ],
  perDay: ["Rata-rata per hari", "Average per day"],
  projection: [
    (biaya: string, hari: number) => `Laju ini setara ${biaya} per ${hari} hari.`,
    (biaya: string, hari: number) => `At this rate, ${biaya} per ${hari} days.`,
  ],
  perAnswer: ["Biaya per jawaban", "Cost per answer"],
  perAnswerNone: ["Belum ada jawaban LLM pada periode ini.", "No LLM answers in this period."],
  perAnswerNote: [
    (jawaban: string) =>
      `Biaya chat dibagi ${jawaban} jawaban LLM. Termasuk embedding pertanyaan yang ditolak sebelum LLM dipanggil.`,
    (jawaban: string) =>
      `Chat cost divided by ${jawaban} LLM answers. Includes embedding questions that were declined before the LLM ran.`,
  ],
  coverage: ["Cakupan estimasi", "Estimate coverage"],
  coverageFull: [
    (panggilan: string) => `Seluruh ${panggilan} panggilan punya angka biaya`,
    (panggilan: string) => `All ${panggilan} calls carry a cost figure`,
  ],
  coveragePartial: [
    (tanpa: string, panggilan: string) =>
      `${tanpa} dari ${panggilan} panggilan tanpa biaya: tarif modelnya belum didaftarkan, jadi total di atas terlalu rendah`,
    (tanpa: string, panggilan: string) =>
      `${tanpa} of ${panggilan} calls have no cost: their model's rate is not registered, so the total above is too low`,
  ],
  dailyTitle: ["Biaya per hari", "Cost per day"],
  dailyRange: [
    (sejak: string, sampai: string, hari: string) => `${sejak} – ${sampai}, ${hari} hari.`,
    (sejak: string, sampai: string, hari: string) => `${sejak} – ${sampai}, ${hari} days.`,
  ],
  dailyPeak: [
    (tanggal: string, biaya: string) => ` Tertinggi ${tanggal}, ${biaya}.`,
    (tanggal: string, biaya: string) => ` Highest on ${tanggal}, ${biaya}.`,
  ],
  dailyTotal: ["Total", "Total"],
  daysWithCost: [
    (hari: number) => `${hari} hari berbiaya`,
    (hari: number) => `${hari} days with cost`,
  ],
  daysHidden: [
    (hari: number) =>
      `${hari} hari tanpa pemakaian model tidak ditampilkan; grafiknya tetap menyertakan hari-hari itu.`,
    (hari: number) =>
      `${hari} days with no model usage are hidden; the chart still includes them.`,
  ],
  noDays: ["Tidak ada hari berbiaya pada rentang ini.", "No days with cost in this range."],
  sourceTitle: ["Sumber biaya", "Where the cost comes from"],
  sourceDescription: [
    "Tiga jalur pemakaian model yang menyusun total.",
    "The three model usage paths that make up the total.",
  ],
  sourceProportion: ["Proporsi sumber biaya", "Cost source proportions"],
  noCalls: ["Belum ada panggilan tercatat", "No calls recorded yet"],
  callsTokens: [
    (panggilan: string, rincian: string) => `${panggilan} panggilan · ${rincian}`,
    (panggilan: string, rincian: string) => `${panggilan} calls · ${rincian}`,
  ],
  inOut: [
    (masuk: string, keluar: string) => `${masuk} in · ${keluar} out`,
    (masuk: string, keluar: string) => `${masuk} in · ${keluar} out`,
  ],
  tokens: [(jumlah: string) => `${jumlah} token`, (jumlah: string) => `${jumlah} tokens`],
  withoutCost: [
    (jumlah: string) => ` · ${jumlah} tanpa biaya`,
    (jumlah: string) => ` · ${jumlah} without cost`,
  ],
  embeddingNote: [
    "Biaya embedding berdiri sendiri, tidak dijumlahkan ke dalam biaya LLM tiap pesan. Totalnya dihitung saat disajikan.",
    "Embedding cost stands on its own and is not folded into each message's LLM cost. The total is worked out at display time.",
  ],
  modelTitle: ["Rincian per model", "Breakdown by model"],
  modelDescription: [
    "Dikelompokkan menurut jalur pemakaian: token LLM dan token embedding tidak sebanding, dan satu model yang sama bisa muncul di dua kelompok.",
    "Grouped by usage path: LLM tokens and embedding tokens are not comparable, and the same model can appear in two groups.",
  ],
  kinds: {
    llm_chat: {
      label: ["LLM chat", "Chat LLM"],
      note: ["Token masukan dan keluaran jawaban.", "Input and output tokens of each answer."],
    },
    embedding_chat: {
      label: ["Embedding pertanyaan", "Question embedding"],
      note: [
        "Model yang diminta, bukan yang dilaporkan gateway.",
        "The model requested, not the one the gateway reports.",
      ],
    },
    embedding_ingestion: {
      label: ["Embedding ingestion & reindex", "Ingestion & reindex embedding"],
      note: [
        "Dari usage_log — biaya yang terjadi tanpa ada mahasiswa bertanya.",
        "From usage_log — cost incurred with no student asking anything.",
      ],
    },
  },
  columns: {
    model: ["Model", "Model"],
    calls: ["Panggilan", "Calls"],
    tokens: ["Token", "Tokens"],
    cost: ["Biaya", "Cost"],
    share: ["Porsi", "Share"],
  },
} as const
