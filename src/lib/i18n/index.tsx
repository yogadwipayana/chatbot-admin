"use client"

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react"

import { createFormat, type Format } from "@/lib/format"
import { DICT, type Dict } from "@/lib/i18n/dict"
import { LANG_STORAGE_KEY, isLang, type Lang } from "@/lib/i18n/lang"
import { resolveDict } from "@/lib/i18n/resolve"

/**
 * Bahasa antarmuka sebagai satu penyimpanan di luar React, pola yang sama
 * dengan `use-token.ts`: ia memang tinggal di localStorage, bukan di state
 * sebuah komponen.
 *
 * Dua hal ikut gratis. Kode di luar pohon React -- klien API menyusun kalimat
 * galat sebelum komponen mana pun membacanya -- bisa memanggil `dict()`
 * langsung. Dan `getServerSnapshot` membuat render pertama selalu "id",
 * sehingga tidak ada ketidakcocokan hidrasi; React menggambar ulang ke bahasa
 * tersimpan tepat setelahnya.
 */

let tersimpan: Lang | null = null
const listeners = new Set<() => void>()

function baca(): Lang {
  try {
    const nilai = window.localStorage.getItem(LANG_STORAGE_KEY)
    return isLang(nilai) ? nilai : "id"
  } catch {
    return "id"
  }
}

/** Harus mengembalikan nilai yang sama sampai benar-benar berubah. */
function snapshot(): Lang {
  if (tersimpan === null) tersimpan = baca()
  return tersimpan
}

function snapshotServer(): Lang {
  return "id"
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Ganti bahasa di satu tab ikut mengganti tab lain, seperti keluar di token.ts.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LANG_STORAGE_KEY) return
    tersimpan = isLang(event.newValue) ? event.newValue : "id"
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function simpan(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // Mode privat: pilihannya hanya berlaku selama tab ini hidup.
  }
  tersimpan = lang
  for (const listener of listeners) listener()
}

export function currentLang(): Lang {
  return typeof window === "undefined" ? "id" : snapshot()
}

/** Kamus untuk kode di luar komponen. Teksnya dibentuk saat kejadian, bukan saat render. */
export function dict(): Dict {
  return resolveDict(DICT, currentLang())
}

type Nilai = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dict
  f: Format
}

const Konteks = createContext<Nilai | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, snapshot, snapshotServer)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const nilai = useMemo<Nilai>(
    () => ({ lang, setLang: simpan, t: resolveDict(DICT, lang), f: createFormat(lang) }),
    [lang]
  )

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>
}

function useI18n(): Nilai {
  const nilai = useContext(Konteks)
  if (!nilai) throw new Error("useI18n dipakai di luar <I18nProvider>")
  return nilai
}

/** Kamus bahasa yang sedang aktif: `t.costs.title`. */
export function useT(): Dict {
  return useI18n().t
}

/** Pemformat tanggal dan angka bahasa yang sedang aktif. */
export function useFormat(): Format {
  return useI18n().f
}

export function useLang(): { lang: Lang; setLang: (lang: Lang) => void } {
  const { lang, setLang } = useI18n()
  return { lang, setLang }
}
