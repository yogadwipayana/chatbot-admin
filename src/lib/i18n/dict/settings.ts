/** Konfigurasi runtime, kill switch, dan isian unit. */

export const config = {
  title: ["Konfigurasi", "Configuration"],
  description: [
    "Setelan pencarian dokumen dan pemecahan dokumen yang dipakai chatbot. Perubahan langsung berlaku tanpa menjalankan ulang server, dan selalu dapat dikembalikan ke nilai yang tertulis di server.",
    "Retrieval and chunking settings the chatbot runs on. Changes take effect immediately without restarting the server, and can always be reverted to the values written on the server.",
  ],
  resetAll: ["Kembalikan semua", "Reset all"],
  saveChanges: ["Simpan perubahan", "Save changes"],
  saveCount: [
    (jumlah: number) => `Simpan ${jumlah} perubahan`,
    (jumlah: number) => `Save ${jumlah} changes`,
  ],
  saved: ["Konfigurasi disimpan", "Configuration saved"],
  savedBody: [
    "Berlaku untuk pertanyaan berikutnya, tanpa menjalankan ulang server.",
    "Applies from the next question onwards, with no server restart.",
  ],
  resetDone: ["Semua setelan kembali ke nilai server", "All settings are back to the server values"],
  resetFailed: ["Gagal mengembalikan", "Could not reset"],
  warningTitle: ["Setelan tersimpan sedang tidak dipakai", "Saved settings are not in use"],
  warningBody: [
    "Sementara ini chatbot memakai nilai yang tertulis di server. Perbaiki nilainya, atau kembalikan semua setelan.",
    "For now the chatbot runs on the values written on the server. Fix the value, or reset every setting.",
  ],
  confirmTitle: ["Kembalikan semua setelan?", "Reset every setting?"],
  confirmBody: [
    "Seluruh nilai yang pernah diubah dari dashboard dihapus dan chatbot kembali memakai nilai yang tertulis di server. Penyetelan yang sudah dilakukan tidak dapat dikembalikan.",
    "Every value ever changed from the dashboard is removed and the chatbot goes back to the values written on the server. The tuning you have done cannot be recovered.",
  ],
  confirmYes: ["Ya, kembalikan", "Yes, reset"],
  resetting: ["Mengembalikan…", "Resetting…"],
  changed: ["Diubah", "Changed"],
  serverValue: [
    (nilai: string) => `Nilai server: ${nilai}`,
    (nilai: string) => `Server value: ${nilai}`,
  ],
  lastChanged: [
    (kapan: string) => `Terakhir diubah ${kapan}`,
    (kapan: string) => `Last changed ${kapan}`,
  ],
  lastChangedBy: [(siapa: string) => ` oleh ${siapa}`, (siapa: string) => ` by ${siapa}`],
  untouched: [
    "Semua setelan masih mengikuti nilai yang tertulis di server.",
    "Every setting still follows the values written on the server.",
  ],
  groups: {
    retrieval: {
      title: ["Pencarian dokumen", "Document retrieval"],
      description: [
        "Menentukan potongan dokumen mana yang dibaca model saat menyusun jawaban.",
        "Decides which document chunks the model reads when composing an answer.",
      ],
    },
    threshold: {
      title: ["Ambang menjawab", "Answer thresholds"],
      description: [
        "Batas “dokumennya cukup relevan atau tidak”. Di bawah ambang, chatbot menolak menjawab alih-alih menebak.",
        "The line between “relevant enough” and not. Below it, the chatbot declines instead of guessing.",
      ],
    },
    chunking: {
      title: ["Pemecahan dokumen", "Document chunking"],
      description: [
        "Cara PDF dan entri tanya jawab dipecah menjadi potongan sebelum diindeks.",
        "How PDFs and Q&A entries are split into chunks before indexing.",
      ],
    },
  },
  thresholdNoteLead: ["Setelah mengubah ambang, buktikan hasilnya di ", "After changing a threshold, prove it in "],
  chunkingNote: [
    "Hanya berlaku untuk dokumen yang diproses setelah ini. Dokumen yang sudah ada baru mengikuti setelan baru bila diunggah ulang.",
    "Applies only to documents processed from now on. Existing documents follow the new settings only once re-uploaded.",
  ],
  /**
   * Nama parameter. Sisi Inggrisnya sengaja memakai istilah aslinya -- RRF,
   * chunk, threshold -- karena itulah kata yang dicari orang yang paham
   * mesinnya, dan yang muncul di `.env` maupun di literatur retrieval.
   */
  fields: {
    retrieval_candidates: {
      label: ["Kandidat per sumber", "Candidates per source"],
      help: [
        "Berapa potongan yang diambil pencarian makna dan pencarian kata sebelum digabungkan. Makin besar makin lengkap, tetapi makin lambat.",
        "How many chunks the vector search and the keyword search each fetch before fusion. Higher is more thorough but slower.",
      ],
    },
    retrieval_top_n: {
      label: ["Potongan yang dibaca model", "Chunks passed to the model"],
      help: [
        "Berapa potongan teratas yang dikirim ke model untuk menyusun jawaban. Tidak boleh melebihi kandidat per sumber.",
        "How many top-ranked chunks go to the model to compose the answer. Cannot exceed the candidates per source.",
      ],
    },
    rrf_weight_vector: {
      label: ["Bobot pencarian makna", "Vector search weight"],
      help: [
        "Pencocokan berdasarkan kemiripan arti kalimat. Isi 0 untuk mematikan sumber ini.",
        "Matching on semantic similarity. Set it to 0 to switch this source off.",
      ],
    },
    rrf_weight_fulltext: {
      label: ["Bobot pencarian kata", "Full-text search weight"],
      help: [
        "Pencocokan kata persis; menolong untuk istilah, singkatan, dan nomor aturan. Isi 0 untuk mematikan sumber ini.",
        "Exact word matching; it earns its keep on terms, acronyms, and regulation numbers. Set it to 0 to switch this source off.",
      ],
    },
    rrf_k: {
      label: ["Peredam peringkat", "RRF damping constant (k)"],
      help: [
        "Makin besar nilainya, makin kecil bedanya antara peringkat pertama dan peringkat kesepuluh saat kedua sumber digabungkan.",
        "The higher it goes, the smaller the gap between rank 1 and rank 10 when the two sources are fused.",
      ],
    },
    vector_threshold: {
      label: ["Ambang kemiripan makna", "Vector similarity threshold"],
      help: [
        "Di bawah nilai ini chatbot menolak menjawab dan mengarahkan mahasiswa ke unit terkait. Menaikkannya membuat chatbot lebih berhati-hati, menurunkannya membuatnya lebih berani menebak.",
        "Below this, the chatbot declines and points the student at the relevant unit. Raise it to make the chatbot more careful; lower it to make it guess more freely.",
      ],
    },
    lexical_threshold: {
      label: ["Ambang kecocokan kata", "Lexical match threshold"],
      help: [
        "Kecocokan kata yang cukup kuat boleh lolos walaupun kemiripan maknanya lemah.",
        "A strong enough keyword match may pass even when semantic similarity is weak.",
      ],
    },
    chunk_size: {
      label: ["Panjang potongan maksimum", "Maximum chunk size"],
      help: [
        "Pagar atas panjang satu potongan. Batas yang sebenarnya mengikuti judul bagian di dalam dokumen; nilai ini hanya memotong bagian yang kepanjangan.",
        "An upper bound on one chunk. The real boundaries follow the document's own section headings; this only cuts a section that runs too long.",
      ],
    },
    chunk_overlap: {
      label: ["Tumpang tindih antar potongan", "Chunk overlap"],
      help: [
        "Bagian akhir potongan yang diulang di potongan berikutnya, supaya kalimat yang terpotong tidak kehilangan konteks. Harus lebih kecil dari panjang potongan.",
        "How much of a chunk's tail is repeated at the start of the next one, so a sentence cut in half keeps its context. Must be smaller than the chunk size.",
      ],
    },
  },
  validation: {
    number: ["Harus diisi angka.", "Must be a number."],
    between: [
      (min: number, max: number) => `Isi antara ${min} dan ${max}.`,
      (min: number, max: number) => `Enter a value between ${min} and ${max}.`,
    ],
    integer: ["Harus bilangan bulat.", "Must be a whole number."],
    topN: [
      (kandidat: number) => `Tidak boleh melebihi kandidat per sumber (${kandidat}).`,
      (kandidat: number) => `Cannot exceed the candidates per source (${kandidat}).`,
    ],
    overlap: [
      (ukuran: number) => `Harus lebih kecil dari panjang potongan (${ukuran}).`,
      (ukuran: number) => `Must be smaller than the chunk size (${ukuran}).`,
    ],
  },
  model: {
    title: ["Model AI", "AI models"],
    descriptionLead: ["Hanya dapat diubah di berkas ", "Changed only in the server's "],
    descriptionTail: [
      " server lalu menjalankan ulang API. Mengganti model penelusuran mengharuskan seluruh dokumen diproses ulang, jadi ia sengaja tidak dapat diubah dari dashboard.",
      " file followed by an API restart. Switching the embedding model means re-indexing every document, so it is deliberately not changeable from the dashboard.",
    ],
    chat: ["Model penyusun jawaban", "Answer model"],
    embed: ["Model penelusuran", "Embedding model"],
    endpoint: ["Endpoint", "Endpoint"],
    officialOpenAI: ["OpenAI resmi", "Official OpenAI"],
    apiKey: ["Kunci API", "API key"],
    keySet: ["Terisi", "Set"],
    keyMissing: ["Belum diisi", "Not set"],
  },
  language: {
    title: ["Bahasa antarmuka", "Interface language"],
    description: [
      "Berlaku untuk dashboard ini saja, tersimpan di peramban Anda — bukan untuk chatbot mahasiswa, yang selalu berbahasa Indonesia.",
      "Applies to this dashboard only and is stored in your browser — not to the student chatbot, which always speaks Indonesian.",
    ],
    switchLabel: ["Tampilkan dashboard dalam bahasa Inggris", "Show the dashboard in English"],
    switchHint: [
      "Istilah teknis pencarian dan biaya memakai kata aslinya: RRF, chunk overlap, embedding model.",
      "Retrieval and cost terms keep their original wording: RRF, chunk overlap, embedding model.",
    ],
  },
} as const

export const killSwitch = {
  title: ["Layanan chat", "Chat service"],
  description: [
    "Matikan chatbot mahasiswa dengan cepat saat insiden, tanpa menunggu pengelola teknis. Dashboard admin tetap dapat dipakai selama layanan dimatikan.",
    "Switch the student chatbot off fast during an incident, without waiting for the technical team. The admin dashboard keeps working while it is off.",
  ],
  embeddedDescription: [
    "Matikan chatbot mahasiswa dengan cepat saat insiden. Dashboard admin tetap dapat dipakai selama layanan dimatikan.",
    "Switch the student chatbot off fast during an incident. The admin dashboard keeps working while it is off.",
  ],
  statusTitle: ["Status saat ini", "Current status"],
  off: ["Layanan chat dimatikan", "The chat service is off"],
  on: [
    "Layanan chat aktif: mahasiswa dapat bertanya seperti biasa",
    "The chat service is on: students can ask questions as usual",
  ],
  since: ["Sejak", "Since"],
  by: ["Oleh", "By"],
  notRecorded: ["Tidak tercatat", "Not recorded"],
  reason: ["Alasan", "Reason"],
  studentSees: ["Yang dilihat mahasiswa", "What students see"],
  turnOn: ["Nyalakan kembali layanan chat", "Switch the chat service back on"],
  updateTitle: ["Perbarui catatan insiden", "Update the incident note"],
  updateDescription: [
    "Lengkapi alasan bila penyebabnya sudah lebih jelas. Waktu mulai insiden tidak berubah.",
    "Fill in the reason once the cause is clearer. The incident's start time does not change.",
  ],
  newReason: ["Alasan baru", "New reason"],
  saveNote: ["Simpan catatan", "Save note"],
  noteSaved: ["Catatan insiden diperbarui", "Incident note updated"],
  turnOffTitle: ["Matikan layanan chat", "Switch the chat service off"],
  turnOffDescription: [
    "Gunakan bila chatbot memberi jawaban keliru pada informasi penting, disalahgunakan, atau biaya API melonjak.",
    "Use it when the chatbot gets something important wrong, is being abused, or API costs spike.",
  ],
  reasonLabel: [
    "Alasan (wajib, untuk catatan insiden)",
    "Reason (required, for the incident record)",
  ],
  reasonPlaceholder: [
    "Contoh: chatbot menyebut batas pembayaran UKT yang salah",
    "For example: the chatbot quoted the wrong tuition payment deadline",
  ],
  turnedOff: ["Layanan chat dimatikan", "Chat service switched off"],
  turnedOffBody: ["Mahasiswa kini melihat pesan penutupan.", "Students now see the closure message."],
  turnedOn: ["Layanan chat aktif kembali", "Chat service is back on"],
  failedOff: ["Gagal mematikan layanan", "Could not switch the service off"],
  failedOn: ["Gagal menyalakan layanan", "Could not switch the service on"],
  notesTitle: ["Catatan", "Notes"],
  notes: {
    test: [
      "Kill switch wajib diuji sebelum rilis (PRD §14): matikan layanan, buka chatbot mahasiswa dan pastikan pesan penutupan muncul, lalu nyalakan kembali.",
      "The kill switch must be tested before release (PRD §14): switch it off, open the student chatbot and confirm the closure message appears, then switch it back on.",
    ],
    memoryLead: [
      "Status ini tersimpan di memori server. Bila server dijalankan ulang, status kembali mengikuti pengaturan ",
      "This status lives in the server's memory. If the server restarts, it falls back to the ",
    ],
    memoryTail: [".", " setting."],
  },
  confirmOffTitle: ["Matikan layanan chat sekarang?", "Switch the chat service off now?"],
  confirmOnTitle: ["Nyalakan kembali layanan chat?", "Switch the chat service back on?"],
  confirmOffBody: [
    (pesan: string) => `Semua mahasiswa langsung berhenti mendapat jawaban dan melihat: “${pesan}”`,
    (pesan: string) => `Every student stops getting answers at once and sees: “${pesan}”`,
  ],
  confirmOnBody: [
    "Pastikan penyebab insiden sudah ditangani. Mahasiswa langsung dapat bertanya lagi.",
    "Make sure the cause has been dealt with. Students can ask questions again immediately.",
  ],
  confirmOff: ["Ya, matikan", "Yes, switch it off"],
  confirmOn: ["Ya, nyalakan", "Yes, switch it on"],
  turningOff: ["Mematikan…", "Switching off…"],
  turningOn: ["Menyalakan…", "Switching on…"],
} as const

export const unitField = {
  placeholder: ["Biro Administrasi Akademik", "Academic Administration Office"],
  empty: ["Belum ada unit lain.", "No other units yet."],
  use: [(unit: string) => `Pakai “${unit}”`, (unit: string) => `Use “${unit}”`],
} as const

export const dateField = {
  placeholder: ["Pilih tanggal", "Pick a date"],
  expired: [
    (tanggal: string) => `${tanggal} sudah lewat, jadi chatbot langsung berhenti memakainya.`,
    (tanggal: string) => `${tanggal} has passed, so the chatbot stopped using it right away.`,
  ],
  endsOn: ["Berakhir ", "Ends "],
  today: ["hari ini", "today"],
  inTime: [(lama: string) => `${lama} lagi`, (lama: string) => `in ${lama}`],
  rangePlaceholder: ["Pilih rentang tanggal", "Pick a date range"],
  rangePartial: [
    (sejak: string) => `${sejak} – pilih tanggal akhir`,
    (sejak: string) => `${sejak} – pick an end date`,
  ],
  startsOn: ["Mulai ", "Starts "],
  pickEnd: ["pilih tanggal akhirnya", "now pick the end date"],
  rangeDays: [(hari: number) => `${hari} hari`, (hari: number) => `${hari} days`],
  rangeHint: [
    "Klik tanggal awal, lalu tanggal akhirnya.",
    "Click the start date, then the end date.",
  ],
} as const
