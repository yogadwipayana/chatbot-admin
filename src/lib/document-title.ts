/**
 * Setel judul tab peramban pada SEMUA `<title>` di `<head>`, bukan hanya yang
 * pertama seperti `document.title`.
 *
 * T68: membuka halaman dashboard tanpa sesi langsung dialihkan ke `/masuk`
 * (`DashboardShell`) sebelum metadata hasil SSR selesai terhidrasi. `<title>`
 * SSR itu tertinggal di luar kendali React: Next menambah `<title>` baru untuk
 * setiap halaman berikutnya, sedangkan yang lama tidak pernah dibuang sampai
 * halaman dimuat ulang. Peramban memakai `<title>` pertama, sehingga tab tetap
 * "Masuk" setelah login.
 */
export function setDocumentTitle(teks: string): void {
  const semua = document.head.querySelectorAll("title")
  if (semua.length === 0) {
    document.title = teks
    return
  }
  for (const el of semua) {
    if (el.textContent !== teks) el.textContent = teks
  }
}
