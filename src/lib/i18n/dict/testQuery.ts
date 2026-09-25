/** Uji coba jawaban (AD-6) dan meteran skornya. */

export const testQuery = {
  title: ["Uji coba jawaban", "Test answers"],
  description: [
    "Ajukan pertanyaan seperti mahasiswa, lalu lihat potongan dokumen yang ditemukan beserta skornya. Alat utama saat ada laporan “jawabannya salah”. Uji coba tidak dicatat ke statistik.",
    "Ask a question the way a student would, then see which chunks came back and how they scored. The first tool to reach for when someone reports a wrong answer. Test runs are never recorded in the statistics.",
  ],
  question: ["Pertanyaan", "Question"],
  questionPlaceholder: [
    "Kapan pengisian KRS semester ganjil dibuka?",
    "When does course registration for the odd semester open?",
  ],
  tryThreshold: ["Coba ambang lain", "Try a different threshold"],
  thresholdLabel: ["Ambang kemiripan vektor", "Vector similarity threshold"],
  thresholdNote: [
    "Ambang sementara hanya berlaku untuk uji coba ini; mahasiswa tetap memakai ambang yang diatur di server.",
    "A temporary threshold applies to this test run only; students keep using the threshold set on the server.",
  ],
  running: ["Mencari dan menyusun jawaban…", "Searching and composing an answer…"],
  submit: ["Uji", "Run test"],
  failed: ["Uji coba gagal", "Test run failed"],
  outcomeTitle: ["Yang dilihat mahasiswa", "What the student sees"],
  outcome: {
    answer: [
      "Jawaban disusun model AI hanya dari potongan yang lolos ambang.",
      "The AI model composed this answer only from chunks that cleared the threshold.",
    ],
    refusal: [
      "Model AI tidak dipanggil: sumbernya dinilai terlalu lemah.",
      "The AI model was never called: the sources were judged too weak.",
    ],
    support: [
      "Pertanyaan bernuansa tekanan mental: tidak dicarikan di dokumen.",
      "A question touching on mental distress: no document search is run.",
    ],
    smalltalk: [
      "Sapaan atau basa-basi: dibalas singkat tanpa retrieval.",
      "A greeting or small talk: answered briefly with no retrieval.",
    ],
    rejected: [
      "Dihentikan gerbang: pesan tidak bermakna, upaya manipulasi, atau di luar topik kampus. Tanpa retrieval maupun model AI.",
      "Stopped by the gate: nonsense, a manipulation attempt, or off campus topics. No retrieval and no AI model.",
    ],
  },
  contactsTitle: ["Kontak yang ditampilkan sebagai banner", "Contacts shown as a banner"],
  latency: [(waktu: string) => `Waktu proses ${waktu}`, (waktu: string) => `Processing time ${waktu}`],
  decisionTitle: ["Keputusan ambang", "Threshold decision"],
  decisionSensitive: [
    "Pertanyaan sensitif dialihkan sebelum pencarian dokumen.",
    "A sensitive question is redirected before any document search.",
  ],
  reason: {
    ok: [
      "Lolos: minimal satu skor mencapai ambangnya, sehingga model AI dipanggil.",
      "Passed: at least one score reached its threshold, so the AI model was called.",
    ],
    below_threshold: [
      "Ditolak: kedua skor terbaik di bawah ambang. Dokumennya mungkin belum ada, atau kalimatnya terlalu berbeda.",
      "Declined: both best scores fell below the threshold. The document may not exist yet, or the wording is too different.",
    ],
    no_results: [
      "Ditolak: tidak ada satu pun potongan dokumen aktif yang ditemukan.",
      "Declined: not a single chunk from an active document was found.",
    ],
  },
  vectorLabel: ["Kemiripan makna", "Semantic similarity"],
  vectorHint: ["Pencarian vektor, 0–1", "Vector search, 0–1"],
  lexicalLabel: ["Kecocokan kata", "Keyword match"],
  lexicalHint: ["Pencarian teks penuh", "Full-text search"],
  retrievedTitle: ["Potongan yang ditemukan", "Chunks retrieved"],
  retrievedDescription: [
    "Urutan hasil penggabungan dua pencarian. Yang menentukan penolakan adalah skor mentah per sumber, bukan skor gabungan: skor gabungan hanya mencerminkan peringkat, jadi potongan terbaik dari sekumpulan potongan yang tidak relevan tetap mendapat nilai tertinggi.",
    "Ordered by fusing the two searches. What decides a refusal is the raw score per source, not the fused score: the fused score only reflects rank, so the best chunk out of a pile of irrelevant ones still comes top.",
  ],
  noChunks: ["Tidak ada potongan yang ditemukan.", "No chunks were found."],
  noSearch: ["Tidak ada pencarian dokumen.", "No document search was run."],
  columns: {
    document: ["Dokumen", "Document"],
    semantic: ["Makna", "Semantic"],
    keyword: ["Kata", "Keyword"],
    fused: ["Gabungan", "Fused"],
  },
  faqSource: [" · Tanya jawab", " · Q&A entry"],
  pageSource: [(halaman: number) => ` · hal. ${halaman}`, (halaman: number) => ` · p. ${halaman}`],
  noSource: ["tidak ditemukan sumber ini", "this source found nothing"],
  reachedThreshold: ["mencapai ambang", "reached the threshold"],
} as const

export const scoreMeter = {
  versusThreshold: [
    (ambang: string) => ` / ambang ${ambang}`,
    (ambang: string) => ` / threshold ${ambang}`,
  ],
  none: ["Tidak ada potongan dari sumber ini", "No chunk from this source"],
  passed: ["Mencapai ambang", "Reached the threshold"],
  below: ["Di bawah ambang", "Below the threshold"],
} as const
