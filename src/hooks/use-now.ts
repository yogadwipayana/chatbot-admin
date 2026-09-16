"use client"

import { useSyncExternalStore } from "react"

const INTERVAL_MS = 60_000

let now = Date.now()
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (timer === undefined) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      for (const l of listeners) l()
    }, INTERVAL_MS)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

/**
 * Waktu sekarang (ms), diperbarui tiap menit.
 *
 * Teks seperti "3 jam lalu" dan status "kedaluwarsa" bergantung pada waktu.
 * Membaca `Date.now()` langsung saat render membuat komponen tidak murni; hook
 * ini memberi satu nilai bersama yang berubah secara terkendali.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, () => now, () => now)
}
