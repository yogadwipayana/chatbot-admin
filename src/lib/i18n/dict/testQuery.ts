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
  unit: ["Topik yang dipilih mahasiswa", "Topic the student picked"],
  allUnits: ["Semua unit", "All units"],
  unitHint: [
    "Chatbot hanya mencari di dokumen unit yang dipilih mahasiswa di menu topik. Pilih Semua unit hanya untuk memeriksa apakah jawabannya ada di unit lain.",
    "The chatbot only searches the documents of the unit the student picked in the topic menu. Choose All units only to check whether the answer lives in another unit.",
  ],
  searchedUnit: [
    (unit: string) => `Dicari di dokumen unit ${unit}, sama seperti mahasiswa yang memilih topik ini.`,
    (unit: string) => `Searched the ${unit} documents, just like a student who picked this topic.`,
  ],
  searchedAll: [
    "Dicari di dokumen semua unit. Mahasiswa selalu memilih satu topik, jadi yang mereka lihat bisa berbeda.",
    "Searched the documents of every unit. Students always pick one topic, so what they see may differ.",
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
      "Dihentikan gerbang JEV: pesan tidak bermakna, upaya manipulasi, atau di luar topik kampus. Pencarian dihentikan dan model AI tidak dipanggil.",
      "Stopped by the JEV gate: nonsense, a manipulation attempt, or off campus topics. The search was stopped and the AI model was never called.",
    ],
  },
  // `rejected` punya tiga asal. Menyebut "gerbang JEV" untuk semuanya keliru
  // saat JEV dimatikan dan cadangannya yang bekerja.
  rejectedBy: {
    jev: [
      "Dihentikan gerbang JEV: pesan tidak bermakna, upaya manipulasi, atau di luar topik kampus. Pencarian dihentikan dan model AI penjawab tidak dipanggil.",
      "Stopped by the JEV gate: nonsense, a manipulation attempt, or off campus topics. The search was stopped and the answering AI model was never called.",
    ],
    rules: [
      "Dihentikan saringan aturan: pesan tidak bermakna, basa-basi tentang asisten, atau upaya manipulasi. Tanpa pencarian, tanpa JEV, dan tanpa model AI.",
      "Stopped by the rule filter: nonsense, small talk about the assistant, or a manipulation attempt. No search, no JEV and no AI model.",
    ],
    llm: [
      "Sumber lolos ambang, tetapi model AI menilai pertanyaan ini di luar urusan kampus. Tidak masuk daftar pertanyaan tak terjawab.",
      "The sources cleared the threshold, but the AI model judged this question to be outside campus matters. It is not added to unanswered questions.",
    ],
  },
  // Sejak model AI boleh menyatakan dokumennya tidak menjawab, penolakan punya
  // dua asal. Menyebut "model AI tidak dipanggil" untuk keduanya membuat kartu
  // ini bertentangan dengan kartu ambang yang berbunyi "lolos".
  refusalByLlm: [
    "Sumber lolos ambang, tetapi model AI menilai isinya tidak menjawab pertanyaan ini.",
    "The sources cleared the threshold, but the AI model judged that they do not answer this question.",
  ],
  gate: [
    (sumber: string, label: string, persen: string, blokir: boolean) =>
      `${sumber}: ${label} (${persen}) · ${blokir ? "diblokir" : "diteruskan"}`,
    (sumber: string, label: string, persen: string, blokir: boolean) =>
      `${sumber}: ${label} (${persen}) · ${blokir ? "blocked" : "passed"}`,
  ],
  gateSource: {
    jev: ["Gerbang JEV", "JEV gate"],
    rules: ["Saringan aturan", "Rule filter"],
  },
  gateError: [
    (galat: string) => `Gerbang JEV gagal atau lewat tenggat, pesan diteruskan: ${galat}`,
    (galat: string) => `JEV gate failed or missed its deadline, message passed: ${galat}`,
  ],
  gateLabel: {
    academic: ["akademik", "academic"],
    smalltalk: ["basa-basi", "small talk"],
    nonsense: ["tidak bermakna", "nonsense"],
    malicious: ["manipulasi", "manipulation"],
    out_of_scope: ["di luar topik", "off topic"],
  },
  contactsTitle: ["Kontak yang ditampilkan sebagai banner", "Contacts shown as a banner"],
  attachmentNote: [
    "Tampil di bawah jawaban mahasiswa, 10 baris per halaman. Model AI tidak menyalin daftar ini; isinya langsung dari sumbernya.",
    "Shown below the student's answer, 10 rows per page. The AI model does not copy this list; it comes straight from its source.",
  ],
  latency: [(waktu: string) => `Waktu proses ${waktu}`, (waktu: string) => `Processing time ${waktu}`],
  openLog: ["Lihat langkah dan panggilan LLM-nya di Log", "See its steps and LLM calls in Logs"],
  decisionTitle: ["Keputusan ambang", "Threshold decision"],
  decisionSensitive: [
    "Pertanyaan sensitif dialihkan sebelum pencarian dokumen.",
    "A sensitive question is redirected before any document search.",
  ],
  decisionSmalltalk: [
    "Sapaan dibalas sebelum pencarian dokumen, jadi ambang tidak dinilai.",
    "Small talk is answered before any document search, so no threshold is checked.",
  ],
  decisionRejected: [
    "Diblokir gerbang JEV atau saringan aturan sebelum ambang dinilai.",
    "Blocked by the JEV gate or the rule filter before the threshold was checked.",
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
  searchStopped: [
    "Pencarian dihentikan karena gerbang JEV memblokir pesan ini.",
    "The search was stopped because the JEV gate blocked this message.",
  ],
  // Potongan lanjutan ikut karena potongan sebelumnya, bukan karena mirip
  // pertanyaan -- tanpa label ia tampak seperti hasil tanpa skor yang janggal.
  neighborOf: [
    (nomor: number) => `Lanjutan dari #${nomor}, dikirim ke model AI tanpa skor sendiri`,
    (nomor: number) => `Continues #${nomor}; sent to the AI model without a score of its own`,
  ],
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
