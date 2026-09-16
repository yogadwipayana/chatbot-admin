"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

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
