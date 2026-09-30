/**
 * Tautan ke Uji coba untuk pertanyaan mahasiswa yang sudah tercatat.
 *
 * Unit ikut dibawa: chatbot hanya mencari di dokumen unit yang dipilih
 * mahasiswa, jadi uji ulang tanpa unit bisa menemukan potongan dari unit lain
 * yang tidak pernah dilihat mahasiswa itu.
 */
export function testQueryHref(question: string, unit?: string | null): string {
  const params = new URLSearchParams({ q: question })
  if (unit) params.set("unit", unit)
  return `/uji-coba?${params.toString()}`
}
