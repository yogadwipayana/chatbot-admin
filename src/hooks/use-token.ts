"use client"

import { useSyncExternalStore } from "react"

import { readToken, subscribeToken } from "@/lib/auth/token"

/**
 * Token admin saat ini.
 *
 * `undefined` berarti belum diketahui: saat render di server dan sebelum
 * hidrasi, localStorage belum dapat dibaca. Bedakan dari `null` (pasti belum
 * masuk) supaya pengguna yang sudah masuk tidak sempat dilempar ke halaman login.
 */
export function useToken(): string | null | undefined {
  return useSyncExternalStore(subscribeToken, readToken, () => undefined)
}
