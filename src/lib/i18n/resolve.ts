import type { Lang } from "@/lib/i18n/lang"

/**
 * Satu entri kamus: `["Biaya", "Costs"]`.
 *
 * Kedua bahasa sengaja ditulis bersebelahan, bukan di dua berkas terpisah.
 * Dua berkas yang harus dijaga sepadan selalu berakhir sama: satu sisi disunting,
 * sisi lain tertinggal, dan tidak ada yang tahu sampai ada yang mengganti bahasa.
 * Berdampingan, terjemahan yang hilang terlihat saat menyunting barisnya.
 *
 * Teks bersisipan ditulis sebagai fungsi di kedua sisi, sehingga urutan katanya
 * boleh berbeda antar bahasa -- yang tidak mungkin bila potongan kalimat
 * disambung di komponen.
 */
export type Entry = readonly [string, string] | readonly [Fn, Fn]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn = (...args: any[]) => string

/** Entri, daftar entri (mis. daftar hak akses), atau kelompok bernama. */
export type Node = Entry | readonly Node[] | { readonly [kunci: string]: Node }

/** Bentuk kamus setelah satu bahasa dipilih: `t.costs.title` berupa string. */
export type Resolved<T> = T extends Entry
  ? T[0]
  : T extends readonly (infer E)[]
    ? Resolved<E>[]
    : { [K in keyof T]: Resolved<T[K]> }

const cache = new Map<Lang, unknown>()

/**
 * Daun dikenali dari isinya, bukan dari bentuknya: `["Biaya", "Costs"]` dan
 * daftar dua hak akses sama-sama larik berisi dua elemen. Yang membedakan,
 * daun berisi teks atau fungsi -- daftar berisi entri lain.
 */
function daun(node: readonly unknown[]): boolean {
  const pertama = node[0]
  return typeof pertama === "string" || typeof pertama === "function"
}

function pilih(node: unknown, index: 0 | 1): unknown {
  if (Array.isArray(node)) {
    return daun(node) ? node[index] : node.map((anak) => pilih(anak, index))
  }
  const hasil: Record<string, unknown> = {}
  for (const [kunci, nilai] of Object.entries(node as Record<string, unknown>)) {
    hasil[kunci] = pilih(nilai, index)
  }
  return hasil
}

/**
 * Kamus satu bahasa, dihitung sekali lalu disimpan.
 *
 * Hasilnya harus tetap sama setiap dipanggil: `useMemo` di pemakainya
 * membandingkan rujukan, dan objek baru tiap render akan membuat seluruh
 * dashboard menggambar ulang tanpa ada yang berubah.
 */
export function resolveDict<T>(source: T, lang: Lang): Resolved<T> {
  const tersimpan = cache.get(lang)
  if (tersimpan) return tersimpan as Resolved<T>
  const hasil = pilih(source, lang === "en" ? 1 : 0)
  cache.set(lang, hasil)
  return hasil as Resolved<T>
}
