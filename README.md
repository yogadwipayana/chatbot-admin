# Dashboard Admin — Chatbot Administrasi Mahasiswa

Dashboard untuk admin konten dan pemilik sistem (PRD §9, AD-1..AD-6). Next.js
(App Router) + Tailwind + shadcn/ui + TanStack Query, berbicara dengan API di
`../api` sesuai kontrak `../api/api.yaml`.

## Menjalankan

```bash
# 1. API harus hidup (lihat ../api/README.md)
cd ../api && uvicorn app.main:app --reload

# 2. Buat akun admin -- kata sandi dibangkitkan dan ditampilkan sekali
python -m scripts.create_admin admin@kampus.ac.id

# 3. Dashboard
cd ../admin
npm install
npm run dev        # http://localhost:3000
```

API diasumsikan di `http://localhost:8000`. Bila berbeda, salin `.env.example`
ke `.env.local`. Saat `ENVIRONMENT=local`, API menerima panggilan dari asal
mana pun; di lingkungan lain isi `CORS_ORIGINS` di API, atau sajikan dashboard
dan API di domain yang sama lewat Caddy (lalu kosongkan
`NEXT_PUBLIC_API_BASE_URL`).

Data contoh untuk pengembangan (dokumen fiktif + 30 hari log percakapan):

```bash
cd ../api
python -m scripts.seed_demo --dokumen --log
python -m scripts.seed_demo --hapus        # bersihkan
```

## Skrip

| Perintah | Guna |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | Bangkitkan tipe rute Next, lalu `tsc --noEmit` |
| `npm run gen:api` | Bangkitkan ulang `src/lib/api/schema.d.ts` dari `api.yaml` |

**Setiap kali `api.yaml` berubah, jalankan `npm run gen:api` lalu
`npm run typecheck`.** Seluruh panggilan API bertipe dari berkas itu, jadi
perubahan kontrak langsung terlihat sebagai galat TypeScript di tempat yang
terdampak -- bukan sebagai layar kosong saat dipakai.

## Halaman dan level akses

| Rute | PRD | Isi | Staf/Dosen | Admin | Superadmin |
|---|---|---|---|---|---|
| `/masuk` | AD-1 | Login email + kata sandi | ✓ | ✓ | ✓ |
| `/pertanyaan` | AD-4 | Pertanyaan tak terjawab, dikelompokkan, dengan frekuensi | lihat | + tandai selesai | ✓ |
| `/dokumen` | AD-2 | Daftar dokumen, badge "perlu ditinjau" | unitnya | semua unit | ✓ |
| `/dokumen/unggah` | AD-3 | Drag & drop, form metadata, progres unggah dan pemrosesan | unitnya (terkunci) | semua unit | ✓ |
| `/dokumen/[id]` | AD-3 | Ubah metadata, aktif/nonaktif, hapus, pratinjau potongan | unitnya | semua unit | ✓ |
| `/uji-coba` | AD-6 | Kotak uji: jawaban, keputusan ambang, potongan beserta skor mentah | ✓ | ✓ | ✓ |
| `/statistik` | AD-5 | Target PRD §3, volume harian, jenis balasan, topik berisiko, biaya | – | ✓ | ✓ |
| `/layanan` | FR-9 | Kill switch dengan alasan wajib dan konfirmasi | – | – | ✓ |
| `/admin` | – | Kelola akun: level, unit, aktif/nonaktif, atur ulang kata sandi | – | – | ✓ |

`/` membuka `/dokumen` untuk staf/dosen dan `/pertanyaan` untuk level lain.
Setiap akun dapat mengganti kata sandinya sendiri dari menu akun di pojok kiri
bawah.

## Keputusan yang perlu diketahui

**Token disimpan di localStorage.** API memakai bearer token (bukan cookie),
jadi token harus terbaca JavaScript. Artinya celah XSS = token bocor. Jangan
pernah merender teks dari API sebagai HTML (`dangerouslySetInnerHTML`); isi
dokumen dan pertanyaan mahasiswa adalah data tak tepercaya.

**Menyembunyikan menu bukan kontrol keamanan.** `src/lib/roles.ts` hanya
menentukan apa yang ditampilkan; API memeriksa ulang level setiap operasi.
Level dan unit selalu dibaca dari `GET /api/admin/me`, bukan dari isi token,
jadi perubahan oleh superadmin terlihat saat tab kembali difokuskan.

**Semua halaman dirender di klien.** Sesi hanya diketahui di peramban, jadi
`DashboardShell` menahan render sampai token terbaca. Galat 401 dari API di
mana pun menghapus token dan mengembalikan ke `/masuk`.

**Bahasa antarmuka non-teknis** (PRD §9): "potongan", bukan "chunk"; "sedang
diproses", bukan "embedding in progress". Pesan galat dari API sudah ditulis
untuk admin dan ditampilkan apa adanya.

**Aksi destruktif butuh konfirmasi** (PRD §9). Hapus dokumen dan mematikan
layanan memakai dialog; aksi yang dapat dibatalkan (nonaktifkan, tandai
selesai) memakai toast dengan tombol "Batalkan".

**Warna grafik** memakai slot kategorikal 1–3 palet referensi yang sudah
divalidasi untuk buta warna di mode terang dan gelap (`globals.css`). Warna
status (baik/peringatan/serius/kritis) hanya untuk arti baik-buruk dan selalu
disertai ikon + label.
