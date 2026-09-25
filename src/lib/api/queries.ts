"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useMemo } from "react"

import { api, unwrap, type Schemas } from "./client"

// --- Dokumen (AD-2, AD-3) ----------------------------------------------------

export type DocumentFilters = {
  include_inactive: boolean
  only_stale: boolean
  limit: number
  offset: number
}

export function useDocuments(filters: DocumentFilters) {
  return useQuery({
    queryKey: ["documents", filters],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/documents", { params: { query: filters }, signal })),
    placeholderData: keepPreviousData,
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: ({ signal }) =>
      unwrap(
        api.GET("/api/admin/documents/{document_id}", {
          params: { path: { document_id: id } },
          signal,
        })
      ),
  })
}

export const CHUNK_PAGE_SIZE = 20

export function useChunks(id: string) {
  return useInfiniteQuery({
    queryKey: ["chunks", id],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      unwrap(
        api.GET("/api/admin/documents/{document_id}/chunks", {
          params: {
            path: { document_id: id },
            query: { limit: CHUNK_PAGE_SIZE, offset: pageParam },
          },
          signal,
        })
      ),
    getNextPageParam: (last, all) =>
      last.length < CHUNK_PAGE_SIZE ? undefined : all.length * CHUNK_PAGE_SIZE,
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas["DocumentUpdate"] }) =>
      unwrap(
        api.PATCH("/api/admin/documents/{document_id}", {
          params: { path: { document_id: id } },
          body,
        })
      ),
    onSuccess: (doc) => {
      queryClient.setQueryData(["document", doc.id], doc)
      return queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(
        api.DELETE("/api/admin/documents/{document_id}", {
          params: { path: { document_id: id } },
        })
      ),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["document", id] })
      queryClient.removeQueries({ queryKey: ["chunks", id] })
      return queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}

// --- Tanya jawab ---------------------------------------------------------------

export type FaqFilters = { include_inactive: boolean; limit: number; offset: number }

export function useFaq(filters: FaqFilters) {
  return useQuery({
    queryKey: ["faq", filters],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/faq", { params: { query: filters }, signal })),
    placeholderData: keepPreviousData,
  })
}

export function useCreateFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Schemas["FaqEntryCreate"]) =>
      unwrap(api.POST("/api/admin/faq", { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faq"] }),
  })
}

export function useUpdateFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas["FaqEntryUpdate"] }) =>
      unwrap(api.PATCH("/api/admin/faq/{entry_id}", { params: { path: { entry_id: id } }, body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faq"] }),
  })
}

export function useDeleteFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE("/api/admin/faq/{entry_id}", { params: { path: { entry_id: id } } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faq"] }),
  })
}

// --- Daftar unit -----------------------------------------------------------------

/**
 * Nama unit resmi, untuk isian unit di seluruh dashboard.
 *
 * Diambil dari `GET /api/units` -- daftar yang sama dengan menu unit di chatbot
 * mahasiswa. Server menolak nama di luar daftar ini, karena retrieval
 * membandingkan unit persis: dokumen berlabel "Biro Keuangan" tidak akan pernah
 * terambil untuk mahasiswa yang memilih "Keuangan". Urutannya dari server,
 * sama dengan urutan di menu chatbot.
 */
export function useUnits(): string[] {
  const { data } = useQuery({
    queryKey: ["units"],
    queryFn: ({ signal }) => unwrap(api.GET("/api/units", { signal })),
    staleTime: 5 * 60 * 1000,
  })
  return useMemo(() => (data ?? []).map((u) => u.nama), [data])
}

/** Semua unit termasuk yang nonaktif, untuk halaman kelola unit (superadmin). */
export function useAdminUnits() {
  return useQuery({
    queryKey: ["admin-units"],
    queryFn: ({ signal }) => unwrap(api.GET("/api/admin/units", { signal })),
  })
}

/**
 * Setiap perubahan unit menyentuh lebih dari halaman Unit: daftar isian unit
 * (`useUnits`), dan -- saat nama diganti -- unit yang tersimpan di dokumen,
 * entri tanya jawab, dan akun lewat `ON UPDATE CASCADE`.
 */
function invalidateUnits(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all(
    ["admin-units", "units", "documents", "document", "faq", "users", "me"].map((key) =>
      queryClient.invalidateQueries({ queryKey: [key] })
    )
  )
}

export function useCreateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Schemas["AdminUnitCreate"]) =>
      unwrap(api.POST("/api/admin/units", { body })),
    onSuccess: () => invalidateUnits(queryClient),
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nama, body }: { nama: string; body: Schemas["AdminUnitUpdate"] }) =>
      unwrap(api.PATCH("/api/admin/units/{nama}", { params: { path: { nama } }, body })),
    onSuccess: () => invalidateUnits(queryClient),
  })
}

// --- Pertanyaan tak terjawab (AD-4) --------------------------------------------

export type UnansweredFilters = { resolved?: boolean; sejak?: string }

export function useUnanswered(filters: UnansweredFilters) {
  return useQuery({
    queryKey: ["unanswered", filters],
    queryFn: ({ signal }) =>
      unwrap(
        api.GET("/api/admin/unanswered", {
          params: { query: { ...filters, limit: 200 } },
          signal,
        })
      ),
    placeholderData: keepPreviousData,
  })
}

/** Satu kelompok AD-4 = beberapa baris; PATCH dikirim untuk setiap id. */
export function useSetResolved() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, resolved }: { ids: string[]; resolved: boolean }) => {
      await Promise.all(
        ids.map((id) =>
          unwrap(
            api.PATCH("/api/admin/unanswered/{unanswered_id}", {
              params: { path: { unanswered_id: id } },
              body: { resolved },
            })
          )
        )
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["unanswered"] }),
  })
}

// --- Umpan balik mahasiswa (FE-5) ----------------------------------------------

export type FeedbackFilters = {
  helpful?: boolean
  sejak?: string
  limit: number
  offset: number
}

export function useFeedback(filters: FeedbackFilters) {
  return useQuery({
    queryKey: ["feedback", filters],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/feedback", { params: { query: filters }, signal })),
    placeholderData: keepPreviousData,
  })
}

// --- Uji coba (AD-6) -----------------------------------------------------------

export function useTestQuery() {
  return useMutation({
    mutationFn: (body: Schemas["TestQueryRequest"]) =>
      unwrap(api.POST("/api/admin/test-query", { body })),
  })
}

// --- Statistik (AD-5) ----------------------------------------------------------

export type StatsRange = { sejak: string; sampai: string }

export function useStats(range: StatsRange | null) {
  return useQuery({
    queryKey: ["stats", range],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/stats", { params: { query: range ?? {} }, signal })),
    enabled: range !== null,
    placeholderData: keepPreviousData,
  })
}

// --- Log aplikasi (SQLite, `logs.md`) ------------------------------------------

export type LogRange = "24h" | "7d"

/** Log terus bertambah selama halaman terbuka; react-query berhenti menarik
    saat tab peramban tidak terlihat, jadi interval ini tidak membebani server. */
const LOG_REFRESH_MS = 60_000

export function useLogSummary(range: LogRange) {
  return useQuery({
    queryKey: ["logs", "summary", range],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/logs/summary", { params: { query: { range } }, signal })),
    placeholderData: keepPreviousData,
    refetchInterval: LOG_REFRESH_MS,
  })
}

export type TurnFilters = {
  range: LogRange
  hasil?: string
  status?: "ok" | "error" | "dibatalkan"
  limit: number
  offset: number
}

export function useLogTurns(filters: TurnFilters) {
  return useQuery({
    queryKey: ["logs", "turns", filters],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/logs/turns", { params: { query: filters }, signal })),
    placeholderData: keepPreviousData,
    refetchInterval: LOG_REFRESH_MS,
  })
}

export function useLogTurn(turnId: string | null) {
  return useQuery({
    queryKey: ["logs", "turn", turnId],
    queryFn: ({ signal }) =>
      unwrap(
        api.GET("/api/admin/logs/turns/{turn_id}", {
          params: { path: { turn_id: turnId ?? "" } },
          signal,
        })
      ),
    enabled: turnId !== null,
    // Giliran yang sudah tercatat tidak berubah lagi.
    staleTime: Infinity,
  })
}

export type AppLogFilters = {
  range: LogRange
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  logger?: string
  q?: string
  limit: number
  offset: number
}

export function useAppLogs(filters: AppLogFilters) {
  return useQuery({
    queryKey: ["logs", "app", filters],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/logs/app", { params: { query: filters }, signal })),
    placeholderData: keepPreviousData,
    refetchInterval: LOG_REFRESH_MS,
  })
}

// --- Kill switch (FR-9) ----------------------------------------------------------

export function useKillSwitch() {
  return useQuery({
    queryKey: ["kill-switch"],
    queryFn: ({ signal }) => unwrap(api.GET("/api/admin/kill-switch", { signal })),
    // Admin lain bisa mematikan layanan; banner di semua halaman harus ikut tahu.
    refetchInterval: 30_000,
  })
}

export function useSetKillSwitch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Schemas["KillSwitchRequest"]) =>
      unwrap(api.POST("/api/admin/kill-switch", { body })),
    onSuccess: (state) => queryClient.setQueryData(["kill-switch"], state),
  })
}

// --- Login (AD-1) ------------------------------------------------------------------

export function useLogin() {
  return useMutation({
    mutationFn: (body: Schemas["LoginRequest"]) =>
      unwrap(api.POST("/api/admin/login", { body })),
  })
}

// --- Akun sendiri dan level akses -----------------------------------------------

/**
 * Akun yang sedang masuk. Level dan unit dibaca ulang dari server, jadi
 * perubahan oleh superadmin terlihat saat tab kembali difokuskan.
 */
export function useMe(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    queryFn: ({ signal }) => unwrap(api.GET("/api/admin/me", { signal })),
    enabled,
    staleTime: 60_000,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: Schemas["PasswordChange"]) =>
      unwrap(api.POST("/api/admin/me/password", { body })),
  })
}

// --- Kelola akun (superadmin) ---------------------------------------------------

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => unwrap(api.GET("/api/admin/users", { signal })),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Schemas["AdminUserCreate"]) =>
      unwrap(api.POST("/api/admin/users", { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas["AdminUserUpdate"] }) =>
      unwrap(
        api.PATCH("/api/admin/users/{user_id}", { params: { path: { user_id: id } }, body })
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["me"] }),
      ]),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(
        api.POST("/api/admin/users/{user_id}/reset-password", {
          params: { path: { user_id: id } },
        })
      ),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE("/api/admin/users/{user_id}", { params: { path: { user_id: id } } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}

// --- Konfigurasi runtime (superadmin) -------------------------------------------

export function useRuntimeConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: ({ signal }) => unwrap(api.GET("/api/admin/config", { signal })),
  })
}

export function useCosts(range: StatsRange | null) {
  return useQuery({
    queryKey: ["costs", range],
    queryFn: ({ signal }) =>
      unwrap(api.GET("/api/admin/costs", { params: { query: range ?? {} }, signal })),
    enabled: range !== null,
    placeholderData: keepPreviousData,
  })
}

export function useUpdateRuntimeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Schemas["RuntimeConfigUpdate"]) =>
      unwrap(api.PATCH("/api/admin/config", { body })),
    onSuccess: (config) => queryClient.setQueryData(["config"], config),
  })
}

export function useResetRuntimeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => unwrap(api.DELETE("/api/admin/config")),
    onSuccess: (config) => queryClient.setQueryData(["config"], config),
  })
}
