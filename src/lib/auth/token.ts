/**
 * Token admin (AD-1).
 *
 * API memakai bearer token, bukan cookie, sehingga token harus dapat dibaca
 * JavaScript dan disimpan di localStorage. Konsekuensinya: celah XSS di
 * dashboard berarti token bocor. Mitigasinya masa berlaku token yang pendek
 * (ADMIN_TOKEN_TTL_MINUTES) dan tidak ada teks dari API yang dirender sebagai
 * HTML mentah.
 */

const KUNCI = "chatbot-admin:token"

const listeners = new Set<() => void>()

export type TokenPayload = {
  sub: string
  role?: string
  exp?: number
}

export function readToken(): string | null {
  try {
    return window.localStorage.getItem(KUNCI)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(KUNCI, token)
  } catch {
    // Mode privat atau penyimpanan diblokir: sesi hanya hidup di tab ini.
  }
  emit()
}

export function clearToken() {
  try {
    window.localStorage.removeItem(KUNCI)
  } catch {
    // abaikan
  }
  emit()
}

export function subscribeToken(listener: () => void) {
  listeners.add(listener)
  // Keluar di satu tab ikut mengeluarkan tab lain.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KUNCI) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function emit() {
  for (const listener of listeners) listener()
}

/** Isi token TANPA verifikasi tanda tangan -- hanya untuk tampilan dan cek kedaluwarsa. */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const bagian = token.split(".")[1]
    if (!bagian) return null
    const base64 = bagian.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
    const payload = JSON.parse(atob(padded)) as TokenPayload
    return typeof payload.sub === "string" ? payload : null
  } catch {
    return null
  }
}

export function isTokenUsable(token: string | null | undefined, nowMs: number): token is string {
  if (!token) return false
  const payload = decodeToken(token)
  if (!payload) return false
  return payload.exp === undefined || payload.exp * 1000 > nowMs
}
