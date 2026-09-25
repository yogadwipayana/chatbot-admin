/** Halaman Log: performa pipeline chat, giliran, dan log aplikasi (`logs.md`). */

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
    jev_gate: ["Gerbang JEV", "JEV gate"],
    rewrite: ["Tulis ulang query", "Query rewrite"],
    retrieve: ["Pencarian dokumen", "Document search"],
    validate_context: ["Validasi konteks", "Context check"],
    refuse: ["Penolakan", "Refusal"],
    generate: ["Menyusun jawaban", "Writing the answer"],
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
      (jumlah: string) => `${jumlah} log ERROR pada rentang ini`,
      (jumlah: string) => `${jumlah} ERROR log lines in this range`,
    ],
    blocked: ["Dihentikan gerbang JEV", "Stopped by the JEV gate"],
    blockedNote: [
      (jumlah: string) => `${jumlah} giliran tidak sampai ke pencarian dokumen`,
      (jumlah: string) => `${jumlah} turns never reached document search`,
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
    "Angka muncul setelah mahasiswa bertanya lewat chatbot. Kotak uji coba di dashboard tidak ikut tercatat.",
    "Numbers appear once students ask through the chatbot. The dashboard's test box is not recorded.",
  ],

  turns: {
    columns: {
      time: ["Waktu", "Time"],
      result: ["Hasil", "Result"],
      stoppedAt: ["Berhenti di", "Stopped at"],
      total: ["Total", "Total"],
      unit: ["Unit", "Unit"],
      status: ["Status", "Status"],
    },
    resultFilter: ["Hasil", "Result"],
    statusFilter: ["Status", "Status"],
    allResults: ["Semua hasil", "All results"],
    allStatuses: ["Semua status", "All statuses"],
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
      "Teks pertanyaan dan jawaban tidak disimpan di log ini. Cari ID ini di tabel messages untuk membacanya.",
      "Question and answer text is not kept in this log. Look this ID up in the messages table to read it.",
    ],
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
    panjang: ["panjang", "length"],
    level: ["level", "level"],
    dialihkan: ["dialihkan", "redirected"],
    ditangani: ["ditangani", "handled"],
    dimatikan: ["dimatikan", "disabled"],
    label: ["label", "label"],
    confidence: ["keyakinan", "confidence"],
    blocked: ["diblokir", "blocked"],
    biaya_usd: ["biaya", "cost"],
    error: ["galat", "error"],
    query_berubah: ["query diubah", "query changed"],
    jumlah_dokumen: ["dokumen", "documents"],
    keputusan: ["keputusan", "decision"],
    alasan: ["alasan", "reason"],
    top_score: ["skor teratas", "top score"],
    top_rerank_score: ["skor rerank", "rerank score"],
    jumlah_kontak: ["kontak", "contacts"],
    model: ["model", "model"],
    input_tokens: ["token masuk", "input tokens"],
    output_tokens: ["token keluar", "output tokens"],
  },
  yes: ["ya", "yes"],
  no: ["tidak", "no"],
} as const
