/** Halaman Log: performa pipeline chat, giliran, graf, dan log aplikasi (`logs.md`). */

export const logs = {
  title: ["Log", "Logs"],
  description: [
    "Apa yang terjadi di balik setiap jawaban chatbot: berapa lama tiap langkah berjalan, di mana alurnya berhenti, dan galat apa yang muncul. Data disimpan 7 hari.",
    "What happens behind every chatbot answer: how long each step takes, where the flow stops, and which errors come up. Data is kept for 7 days.",
  ],
  range: {
    h24: ["24 jam", "24 hours"],
    d7: ["7 hari", "7 days"],
    label: ["Rentang waktu", "Time range"],
  },
  tabs: {
    performance: ["Performa", "Performance"],
    turns: ["Giliran chat", "Chat turns"],
    graph: ["Graf", "Graph"],
    app: ["Log aplikasi", "Application log"],
  },
  refreshNote: [
    "Diperbarui otomatis setiap menit.",
    "Refreshes automatically every minute.",
  ],

  nodes: {
    sanitize: ["Sanitasi", "Sanitize"],
    sensitive: ["Deteksi sensitif", "Sensitivity check"],
    smalltalk: ["Sapaan", "Small talk"],
    rule_gate: ["Saringan aturan", "Rule filter"],
    jev_gate: ["Gerbang JEV", "JEV gate"],
    rewrite: ["Tulis ulang query", "Query rewrite"],
    retrieve: ["Pencarian dokumen", "Document search"],
    validate_context: ["Validasi konteks", "Context check"],
    refuse: ["Penolakan", "Refusal"],
    generate: ["Menyusun jawaban", "Writing the answer"],
    // Subgraph rewrite -> retrieve; hanya muncul sebagai tujuan rute, bukan langkah.
    cari: ["Pencarian", "Search"],
  },

  kpi: {
    turns: ["Giliran chat", "Chat turns"],
    turnsNote: [
      (jawaban: string) => `${jawaban} dijawab LLM`,
      (jawaban: string) => `${jawaban} answered by the LLM`,
    ],
    p95: ["Waktu respons p95", "Response time p95"],
    p95Note: [
      (p50: string) => `Median ${p50}. 95% giliran selesai dalam waktu ini.`,
      (p50: string) => `Median ${p50}. 95% of turns finish within this time.`,
    ],
    errors: ["Giliran gagal", "Failed turns"],
    errorsNote: [
      (log: string, batal: string) =>
        `${log} log ERROR · ${batal} giliran dibatalkan mahasiswa pada rentang ini`,
      (log: string, batal: string) =>
        `${log} ERROR log lines · ${batal} turns cancelled by students in this range`,
    ],
    blocked: ["Dihentikan gerbang JEV", "Stopped by the JEV gate"],
    // Pencarian berjalan paralel dengan gerbang, jadi giliran yang diblokir
    // tetap sempat mencari dokumen -- yang dihemat adalah LLM penjawab.
    blockedNote: [
      (jumlah: string) => `${jumlah} giliran dihentikan sebelum LLM menyusun jawaban`,
      (jumlah: string) => `${jumlah} turns stopped before the LLM wrote an answer`,
    ],
  },

  nodeTitle: ["Durasi per langkah", "Time per step"],
  nodeDescription: [
    "Batang tebal adalah median (p50), batang muda adalah p95. Langkah yang p95-nya jauh di atas median sesekali tersendat.",
    "The solid bar is the median (p50), the light bar is p95. A step whose p95 sits far above its median stalls now and then.",
  ],
  nodeRuns: [
    (jumlah: string) => `${jumlah} kali`,
    (jumlah: string) => `${jumlah} runs`,
  ],
  nodeErrors: [
    (jumlah: string) => `${jumlah} gagal`,
    (jumlah: string) => `${jumlah} failed`,
  ],
  exitTitle: ["Tempat alur berhenti", "Where the flow stops"],
  exitDescription: [
    "Langkah terakhir yang berjalan pada setiap giliran. \"Menyusun jawaban\" berarti LLM dipanggil; sisanya berhenti lebih awal tanpa biaya LLM.",
    "The last step that ran in each turn. \"Writing the answer\" means the LLM was called; the rest stopped early at no LLM cost.",
  ],
  hourlyTitle: ["Waktu respons per jam", "Response time by hour"],
  hourlyDescription: [
    "p95 waktu respons giliran chat, menurut jam di zona waktu peramban ini.",
    "p95 response time of chat turns, by hour in this browser's time zone.",
  ],
  errorTitle: ["Galat per jam", "Errors by hour"],
  errorDescription: [
    "Giliran yang gagal dan baris log ERROR. Klik tab Log aplikasi untuk rinciannya.",
    "Failed turns and ERROR log lines. Open the Application log tab for details.",
  ],
  series: {
    p95: ["p95 waktu respons", "p95 response time"],
    turnErrors: ["Giliran gagal", "Failed turns"],
    logErrors: ["Log ERROR", "ERROR log lines"],
  },
  emptyPerformance: ["Belum ada giliran chat pada rentang ini", "No chat turns in this range yet"],
  emptyPerformanceBody: [
    "Angka muncul setelah mahasiswa bertanya lewat chatbot. Kotak uji coba di dashboard tidak dihitung di sini; gilirannya ada di tab Giliran chat dan Graf.",
    "Numbers appear once students ask through the chatbot. The dashboard's test box is not counted here; its turns are in the Chat turns and Graph tabs.",
  ],

  turns: {
    columns: {
      time: ["Waktu", "Time"],
      result: ["Hasil", "Result"],
      stoppedAt: ["Berhenti di", "Stopped at"],
      total: ["Total", "Total"],
      unit: ["Unit", "Unit"],
      status: ["Status", "Status"],
      question: ["Pertanyaan", "Question"],
    },
    resultFilter: ["Hasil", "Result"],
    statusFilter: ["Status", "Status"],
    endpointFilter: ["Jalur", "Source"],
    allResults: ["Semua hasil", "All results"],
    allStatuses: ["Semua status", "All statuses"],
    allEndpoints: ["Semua jalur", "All sources"],
    testBadge: ["Uji coba", "Test"],
    empty: ["Tidak ada giliran yang cocok", "No matching turns"],
    emptyBody: [
      "Coba ubah filter atau perlebar rentang waktu.",
      "Try changing the filters or widening the time range.",
    ],
    open: ["Lihat rincian", "See details"],
    allUnits: ["Semua unit", "All units"],
  },
  status: {
    ok: ["Berhasil", "Succeeded"],
    error: ["Gagal", "Failed"],
    dibatalkan: ["Dibatalkan", "Cancelled"],
  },
  endpoint: {
    chat: ["Sekali kirim", "Single response"],
    chat_stream: ["Streaming", "Streaming"],
    uji_coba: ["Uji coba admin", "Admin test"],
  },

  turn: {
    title: ["Rincian giliran", "Turn details"],
    description: [
      "Setiap langkah yang berjalan, dari kiri ke kanan menurut waktu mulainya.",
      "Every step that ran, left to right by the time it started.",
    ],
    total: ["Total", "Total"],
    ttft: ["Token pertama", "First token"],
    ttftHint: [
      "Waktu sampai potongan jawaban pertama tampil di layar mahasiswa.",
      "Time until the first piece of the answer appeared on the student's screen.",
    ],
    endpoint: ["Jalur", "Endpoint"],
    session: ["Sesi", "Session"],
    messageId: ["ID pesan", "Message ID"],
    messageIdHint: [
      "ID pesan menautkan giliran ini ke tabel messages di Postgres.",
      "The message ID links this turn to the messages table in Postgres.",
    ],
    question: ["Pertanyaan", "Question"],
    answer: ["Jawaban", "Answer"],
    nim: ["NIM", "Student ID"],
    noText: [
      "Teks giliran ini tidak tersimpan di log: LOG_NODE_IO mati saat giliran ini berjalan.",
      "This turn's text was not kept in the log: LOG_NODE_IO was off when it ran.",
    ],
    openGraph: ["Lihat di graf", "Open in graph"],
    showMore: ["Tampilkan semua", "Show all"],
    showLess: ["Ringkas", "Show less"],
    runId: ["ID trace LangSmith", "LangSmith trace ID"],
    runIdHint: [
      "Tempel di kolom pencarian proyek LangSmith untuk membuka trace lengkapnya.",
      "Paste it into the LangSmith project search to open the full trace.",
    ],
    noTrace: ["Tracing mati saat giliran ini berjalan", "Tracing was off when this turn ran"],
    steps: ["Langkah", "Steps"],
    logs: ["Log selama giliran ini", "Log lines during this turn"],
    noLogs: ["Tidak ada log selama giliran ini.", "No log lines during this turn."],
    copy: ["Salin", "Copy"],
    copied: ["Disalin", "Copied"],
    notFound: [
      "Giliran ini tidak ditemukan. Log yang lebih tua dari masa simpan sudah dihapus.",
      "This turn was not found. Logs older than the retention period have been deleted.",
    ],
  },

  graph: {
    picker: ["Giliran yang ditampilkan", "Turn shown"],
    summary: ["Semua giliran (ringkasan)", "All turns (summary)"],
    newer: ["Giliran lebih baru", "Newer turn"],
    older: ["Giliran lebih lama", "Older turn"],
    openDetail: ["Rincian giliran", "Turn details"],
    empty: ["Belum ada giliran pada rentang ini", "No turns in this range yet"],
    emptyBody: [
      "Graf muncul setelah mahasiswa bertanya lewat chatbot atau admin menjalankan uji coba jawaban.",
      "The graph appears once students ask through the chatbot or an admin runs a test query.",
    ],
    diagram: ["Diagram alur pipeline chat", "Chat pipeline flow diagram"],
    start: ["mulai", "start"],
    end: ["selesai", "end"],
    skipped: ["tidak berjalan", "did not run"],
    group: {
      // Pendek: ditulis di pojok kotak, dan kalimat panjang tertimpa sisi keluarnya.
      cari: ["paralel", "parallel"],
    },
    runs: [
      (jumlah: string, median: string) => `${jumlah}× · ${median}`,
      (jumlah: string, median: string) => `${jumlah}× · ${median}`,
    ],
    exits: [(jumlah: string) => `${jumlah}×`, (jumlah: string) => `${jumlah}×`],
    legend: {
      ran: ["berjalan", "ran"],
      error: ["gagal", "failed"],
      skipped: ["tidak berjalan", "did not run"],
      conditional: ["sisi bersyarat", "conditional edge"],
    },
    summaryHint: [
      "Angka di tiap langkah: berapa kali berjalan dan median durasinya pada rentang ini, tanpa uji coba admin. Pilih satu giliran untuk melihat input, output, dan panggilan LLM-nya.",
      "Numbers on each step: how often it ran and its median duration in this range, excluding admin tests. Pick one turn to see its inputs, outputs, and LLM calls.",
    ],
    noTrace: [
      "Rekaman input/output tidak ada untuk giliran ini: ia berjalan sebelum rekaman dinyalakan atau saat LOG_NODE_IO mati. Durasi tiap langkah tetap tampil di diagram.",
      "There is no input/output recording for this turn: it ran before recording was enabled or while LOG_NODE_IO was off. Step durations still show in the diagram.",
    ],
    selectNode: [
      "Klik sebuah langkah di diagram untuk melihat input, output, dan panggilan di dalamnya.",
      "Click a step in the diagram to see its input, output, and the calls inside it.",
    ],
    notRun: [
      "Langkah ini tidak berjalan pada giliran ini.",
      "This step did not run in this turn.",
    ],
    tabs: {
      input: ["Input", "Input"],
      output: ["Output", "Output"],
      calls: ["Panggilan", "Calls"],
    },
    next: ["Lanjut ke", "Next"],
    parallel: ["paralel", "parallel"],
    noOutput: [
      "Tidak ada output: langkah ini gagal atau dihentikan sebelum selesai.",
      "No output: this step failed or was stopped before it finished.",
    ],
    noCalls: [
      "Langkah ini tidak memanggil LLM, retriever, tool, maupun JEV.",
      "This step made no LLM, retriever, tool, or JEV calls.",
    ],
    kind: {
      llm: ["LLM", "LLM"],
      retriever: ["Retriever", "Retriever"],
      tool: ["Tool", "Tool"],
      jev: ["JEV", "JEV"],
      chain: ["Rantai", "Chain"],
    },
    cutOff: ["terputus", "cut off"],
    tokens: [
      (masuk: string, keluar: string) => `${masuk} → ${keluar} token`,
      (masuk: string, keluar: string) => `${masuk} → ${keluar} tokens`,
    ],
    stats: [
      (jumlah: string, p50: string, p95: string) =>
        `Berjalan ${jumlah} kali. Median ${p50}, p95 ${p95}.`,
      (jumlah: string, p50: string, p95: string) => `Ran ${jumlah} times. Median ${p50}, p95 ${p95}.`,
    ],
    statsErrors: [(jumlah: string) => `${jumlah} gagal.`, (jumlah: string) => `${jumlah} failed.`],
    empty_value: ["(kosong)", "(empty)"],
    items: [(jumlah: string) => `${jumlah} butir`, (jumlah: string) => `${jumlah} items`],
    keys: [(jumlah: string) => `${jumlah} kunci`, (jumlah: string) => `${jumlah} keys`],
    copyJson: ["Salin JSON", "Copy JSON"],
    page: ["hal.", "p."],
  },

  app: {
    columns: {
      time: ["Waktu", "Time"],
      level: ["Level", "Level"],
      logger: ["Sumber", "Source"],
      message: ["Pesan", "Message"],
    },
    level: ["Level minimum", "Minimum level"],
    logger: ["Sumber", "Source"],
    allLoggers: ["Semua sumber", "All sources"],
    search: ["Cari di pesan…", "Search messages…"],
    errorsOnly: ["Galat saja", "Errors only"],
    audit: ["Audit admin", "Admin audit"],
    auditHint: [
      "Jejak perubahan akun, unit, konfigurasi, dan kill switch. Hanya terlihat oleh Superadmin.",
      "Changes to accounts, units, configuration, and the kill switch. Visible to Superadmin only.",
    ],
    empty: ["Tidak ada log yang cocok", "No matching log lines"],
    emptyBody: [
      "Coba turunkan level minimum, ubah sumber, atau perlebar rentang waktu.",
      "Try a lower minimum level, another source, or a wider time range.",
    ],
    location: ["Lokasi kode", "Code location"],
    traceback: ["Traceback", "Traceback"],
    openTurn: ["Lihat giliran chat", "See the chat turn"],
    expand: ["Lihat rincian", "See details"],
    collapse: ["Ringkas", "Collapse"],
  },

  detailKeys: {
    length: ["panjang", "length"],
    level: ["level", "level"],
    redirected: ["dialihkan", "redirected"],
    handled: ["ditangani", "handled"],
    disabled: ["dimatikan", "disabled"],
    label: ["label", "label"],
    confidence: ["keyakinan", "confidence"],
    blocked: ["diblokir", "blocked"],
    cost_usd: ["biaya", "cost"],
    error: ["galat", "error"],
    query_rewritten: ["query diubah", "query changed"],
    document_count: ["dokumen", "documents"],
    decision: ["keputusan", "decision"],
    reason: ["alasan", "reason"],
    top_score: ["skor teratas", "top score"],
    top_rerank_score: ["skor rerank", "rerank score"],
    contact_count: ["kontak", "contacts"],
    model: ["model", "model"],
    input_tokens: ["token masuk", "input tokens"],
    output_tokens: ["token keluar", "output tokens"],
    tools: ["tool", "tools"],
  },
  yes: ["ya", "yes"],
  no: ["tidak", "no"],
} as const
