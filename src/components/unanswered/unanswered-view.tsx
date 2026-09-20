"use client"

import {
  CheckIcon,
  CircleCheckBigIcon,
  FlaskConicalIcon,
  InfoIcon,
  RotateCcwIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState, PageHeader, QueryError } from "@/components/common"
import { StatusLabel } from "@/components/status"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import type { Schemas } from "@/lib/api/client"
import { useMe, useSetResolved, useUnanswered } from "@/lib/api/queries"
import { addDays, toDateInput, truncate } from "@/lib/format"
import { useFormat, useT } from "@/lib/i18n"
import { atLeast } from "@/lib/roles"
import { cn } from "@/lib/utils"

type Group = Schemas["UnansweredGroup"]
type Tab = "belum" | "sudah" | "semua"

const PERIODE = ["7", "30", "90", "semua"] as const

export function UnansweredView() {
  const t = useT()
  const f = useFormat()
  const periodeLabel = {
    "7": t.labels.periods.d7,
    "30": t.labels.periods.d30,
    "90": t.labels.periods.d90,
    semua: t.labels.periods.all,
  }
  const now = useNow()
  const [tab, setTab] = useState<Tab>("belum")
  const [periode, setPeriode] = useState<string>("30")

  const sejak =
    periode === "semua" ? undefined : toDateInput(addDays(new Date(now), -(Number(periode) - 1)))
  const resolved = tab === "semua" ? undefined : tab === "sudah"
  const query = useUnanswered({ resolved, sejak })
  const setResolved = useSetResolved()
  // Staf/dosen boleh melihat (supaya tahu dokumen apa yang dicari mahasiswa),
  // hanya admin ke atas yang menandai selesai.
  const bolehTandai = atLeast(useMe().data, "admin")

  const groups = query.data ?? []
  const totalPertanyaan = groups.reduce((sum, g) => sum + g.jumlah, 0)
  const terbanyak = groups.reduce((max, g) => Math.max(max, g.jumlah), 0)

  function tandai(group: Group, value: boolean) {
    setResolved.mutate(
      { ids: group.ids, resolved: value },
      {
        onSuccess: () =>
          toast.success(value ? t.unanswered.markedDone : t.unanswered.reopened, {
            description: `“${truncate(group.contoh_pertanyaan, 70)}”`,
            action: {
              label: t.common.undo,
              onClick: () => setResolved.mutate({ ids: group.ids, resolved: !value }),
            },
          }),
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <>
      <PageHeader
        title={t.unanswered.title}
        description={t.unanswered.description}
      />

      {bolehTandai ? null : (
        <p className="-mt-3 mb-5 text-sm text-muted-foreground">{t.unanswered.staffNote}</p>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="belum">{t.unanswered.tabs.open}</TabsTrigger>
            <TabsTrigger value="sudah">{t.unanswered.tabs.done}</TabsTrigger>
            <TabsTrigger value="semua">{t.unanswered.tabs.all}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={periode} onValueChange={setPeriode}>
          <SelectTrigger className="w-full sm:w-48" aria-label={t.labels.periods.label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODE.map((p) => (
              <SelectItem key={p} value={p}>
                {periodeLabel[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <GroupListSkeleton />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={CircleCheckBigIcon}
          title={tab === "sudah" ? t.unanswered.emptyDone : t.unanswered.emptyOpen}
          description={
            tab === "sudah" ? t.unanswered.emptyDoneBody : t.unanswered.emptyOpenBody
          }
        />
      ) : (
        <div className={cn("space-y-3 transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground">
            {t.unanswered.summary(f.number(totalPertanyaan), f.number(groups.length))}
          </p>
          <ul className="divide-y rounded-xl border bg-card">
            {groups.map((group) => {
              const sibuk =
                setResolved.isPending && setResolved.variables?.ids === group.ids
              return (
                <li
                  key={group.ids[0]}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex w-full shrink-0 items-center gap-3 sm:w-24 sm:flex-col sm:items-start sm:gap-1.5">
                    <p className="leading-none">
                      <span className="text-2xl font-semibold">{group.jumlah}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {t.unanswered.times}
                      </span>
                    </p>
                    <div className="h-1.5 flex-1 sm:w-full sm:flex-none" aria-hidden>
                      <div
                        className="h-full rounded-r-[4px] bg-series-1"
                        style={{ width: `${(group.jumlah / terbanyak) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-medium break-words">“{group.contoh_pertanyaan}”</p>
                    <p className="text-xs text-muted-foreground">
                      {t.unanswered.lastAsked(f.relative(group.terakhir_ditanyakan, now))}
                      {group.top_score_rata2 != null
                        ? t.unanswered.avgScore(f.score(group.top_score_rata2))
                        : null}
                    </p>
                    {tab === "semua" && group.resolved ? (
                      <StatusLabel level="good" className="text-xs">
                        {t.unanswered.handled}
                      </StatusLabel>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/uji-coba?q=${encodeURIComponent(group.contoh_pertanyaan)}`}>
                        <FlaskConicalIcon data-icon="inline-start" />
                        {t.labels.testQuery}
                      </Link>
                    </Button>
                    {!bolehTandai ? null : group.resolved ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={sibuk}
                        onClick={() => tandai(group, false)}
                      >
                        <RotateCcwIcon data-icon="inline-start" />
                        {t.unanswered.reopen}
                      </Button>
                    ) : (
                      <Button size="sm" disabled={sibuk} onClick={() => tandai(group, true)}>
                        <CheckIcon data-icon="inline-start" />
                        {t.unanswered.markDone}
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="flex gap-2 pt-2 text-xs text-pretty text-muted-foreground">
            <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>{t.unanswered.scoreHint}</span>
          </p>
        </div>
      )}
    </>
  )
}

function GroupListSkeleton() {
  return (
    <div className="divide-y rounded-xl border">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-16" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-7 w-28" />
        </div>
      ))}
    </div>
  )
}
