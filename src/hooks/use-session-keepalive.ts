"use client"

import { useEffect } from "react"

import { api } from "@/lib/api/client"
import { decodeToken, readToken, setToken } from "@/lib/auth/token"

/**
 * Perpanjang token admin selama admin masih berinteraksi (H27).
 *
 * Token dari API hanya berlaku ADMIN_IDLE_TIMEOUT_MINUTES (bawaan 30 menit).
 * Begitu sisa umurnya kurang dari separuh DAN admin menekan tombol, mengetik,
 * menggulir, atau menyentuh layar sejak token itu terbit, dashboard meminta
 * token baru (`POST /api/admin/token/refresh`). Tanpa interaksi, misalnya tab
 * yang ditinggal di komputer bersama, token habis sendiri dan `DashboardShell`
 * mengarahkan ke halaman login. Polling data sengaja tidak dihitung sebagai
 * aktivitas: halaman Log yang dibiarkan terbuka bukan tanda admin masih ada.
 *
 * Aktivitas dibagi antartab lewat localStorage, sehingga admin yang bekerja di
 * satu tab tidak dikeluarkan dari tab lain. Token baru sampai ke tab lain lewat
 * event `storage` yang sudah didengar `subscribeToken`. API tetap membatasi
 * sesi paling lama ADMIN_TOKEN_TTL_MINUTES sejak login, berapa kali pun
 * diperpanjang.
 */

const KUNCI_AKTIVITAS = "chatbot-admin:aktivitas"
const PERIKSA_TIAP_MS = 30_000
const SIMPAN_AKTIVITAS_TIAP_MS = 15_000
const PERISTIWA = ["pointerdown", "keydown", "wheel", "touchstart"] as const

let aktivitasTerakhir = 0
let aktivitasTersimpan = 0
let sedangMemperpanjang = false

function bacaAktivitas(): number {
  try {
    return Number(window.localStorage.getItem(KUNCI_AKTIVITAS)) || 0
  } catch {
    return 0
  }
}

function catatAktivitas() {
  const sekarang = Date.now()
  aktivitasTerakhir = sekarang
  if (sekarang - aktivitasTersimpan < SIMPAN_AKTIVITAS_TIAP_MS) return
  aktivitasTersimpan = sekarang
  try {
    window.localStorage.setItem(KUNCI_AKTIVITAS, String(sekarang))
  } catch {
    // Penyimpanan diblokir: aktivitas tetap berlaku untuk tab ini saja.
  }
}

/**
 * Token perlu dan boleh diperpanjang sekarang: masih berlaku, sisa umurnya
 * kurang dari separuh, dan ada aktivitas sejak token itu terbit.
 */
export function perluDiperpanjang(
  token: string | null,
  aktivitasMs: number,
  nowMs: number
): boolean {
  if (!token) return false
  const isi = decodeToken(token)
  if (!isi?.exp || !isi.iat) return false
  const habisMs = isi.exp * 1000
  const umurMs = (isi.exp - isi.iat) * 1000
  // Sudah habis: DashboardShell yang mengarahkan ke halaman login.
  if (habisMs <= nowMs) return false
  if (habisMs - nowMs > umurMs / 2) return false
  return aktivitasMs > isi.iat * 1000
}

async function periksa() {
  if (sedangMemperpanjang) return
  const token = readToken()
  const aktivitas = Math.max(aktivitasTerakhir, bacaAktivitas())
  if (!perluDiperpanjang(token, aktivitas, Date.now())) return
  sedangMemperpanjang = true
  try {
    const { data, response } = await api.POST("/api/admin/token/refresh")
    // 401 sudah menghapus token lewat middleware klien: sesinya memang berakhir.
    // Token hanya diganti bila belum berubah sejak diminta (keluar, tab lain).
    if (response.ok && data && readToken() === token) setToken(data.access_token)
  } catch {
    // Jaringan putus: dicoba lagi pada pemeriksaan berikutnya selama token berlaku.
  } finally {
    sedangMemperpanjang = false
  }
}

/** Pasang di kerangka dashboard; `aktif` = ada token yang masih berlaku. */
export function useSessionKeepalive(aktif: boolean) {
  useEffect(() => {
    if (!aktif) return
    const onAktivitas = () => {
      catatAktivitas()
      void periksa()
    }
    for (const nama of PERISTIWA) {
      window.addEventListener(nama, onAktivitas, { passive: true })
    }
    const timer = window.setInterval(() => void periksa(), PERIKSA_TIAP_MS)
    return () => {
      for (const nama of PERISTIWA) window.removeEventListener(nama, onAktivitas)
      window.clearInterval(timer)
    }
  }, [aktif])
}
