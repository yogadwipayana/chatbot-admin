"use client"

import { PowerIcon, PowerOffIcon } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { PageHeader, QueryError } from "@/components/common"
import { StatusLabel } from "@/components/status"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useNow } from "@/hooks/use-now"
import { useKillSwitch, useSetKillSwitch } from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"

type Konfirmasi = "matikan" | "nyalakan" | null

export function KillSwitchView({ embedded = false }: { embedded?: boolean }) {
  const t = useT()
  const f = useFormat()
  const now = useNow()
  const state = useKillSwitch()
  const set = useSetKillSwitch()
  const [alasan, setAlasan] = useState("")
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi>(null)

  const data = state.data

  function matikan() {
    set.mutate(
      { engaged: true, alasan: alasan.trim() },
      {
        onSuccess: () => {
          setKonfirmasi(null)
          setAlasan("")
          toast.success(t.killSwitch.turnedOff, { description: t.killSwitch.turnedOffBody })
        },
        onError: (error) =>
          toast.error(t.killSwitch.failedOff, { description: error.message }),
      }
    )
  }

  function nyalakan() {
    set.mutate(
      { engaged: false },
      {
        onSuccess: () => {
          setKonfirmasi(null)
          toast.success(t.killSwitch.turnedOn)
        },
        onError: (error) =>
          toast.error(t.killSwitch.failedOn, { description: error.message }),
      }
    )
  }

  function perbaruiAlasan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    set.mutate(
      { engaged: true, alasan: alasan.trim() },
      {
        onSuccess: () => {
          setAlasan("")
          toast.success(t.killSwitch.noteSaved)
        },
        onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
      }
    )
  }

  return (
    <>
      {!embedded ? (
        <PageHeader
          title={t.killSwitch.title}
          description={t.killSwitch.description}
        />
      ) : null}

      {state.error ? (
        <QueryError error={state.error} onRetry={() => state.refetch()} />
      ) : !data ? (
        <Skeleton className="h-64 w-full max-w-2xl rounded-xl" />
      ) : (
        <div className="grid max-w-2xl gap-6">
          {embedded ? (
            <div>
              <h2 className="text-lg font-semibold">{t.killSwitch.title}</h2>
              <p className="text-sm text-muted-foreground">
                {t.killSwitch.embeddedDescription}
              </p>
            </div>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>{t.killSwitch.statusTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.engaged ? (
                <>
                  <StatusLabel level="critical" className="text-base font-medium">
                    {t.killSwitch.off}
                  </StatusLabel>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    {data.engaged_at ? (
                      <>
                        <dt className="text-muted-foreground">{t.killSwitch.since}</dt>
                        <dd>
                          {f.dateTime(data.engaged_at)}{" "}
                          <span className="text-muted-foreground">
                            ({f.relative(data.engaged_at, now)})
                          </span>
                        </dd>
                      </>
                    ) : null}
                    <dt className="text-muted-foreground">{t.killSwitch.by}</dt>
                    <dd className="min-w-0 break-words">
                      {data.engaged_by ?? t.killSwitch.notRecorded}
                    </dd>
                    <dt className="text-muted-foreground">{t.killSwitch.reason}</dt>
                    <dd className="min-w-0 break-words">{data.reason}</dd>
                  </dl>
                  <div className="rounded-lg bg-muted/60 p-3 text-sm">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t.killSwitch.studentSees}
                    </p>
                    <p>“{t.labels.closedMessage}”</p>
                  </div>
                </>
              ) : (
                <StatusLabel level="good" className="text-base font-medium">
                  {t.killSwitch.on}
                </StatusLabel>
              )}
            </CardContent>
            {data.engaged ? (
              <CardFooter>
                <Button onClick={() => setKonfirmasi("nyalakan")} disabled={set.isPending}>
                  <PowerIcon data-icon="inline-start" />
                  {t.killSwitch.turnOn}
                </Button>
              </CardFooter>
            ) : null}
          </Card>

          {data.engaged ? (
            <Card>
              <CardHeader>
                <CardTitle>{t.killSwitch.updateTitle}</CardTitle>
                <CardDescription>{t.killSwitch.updateDescription}</CardDescription>
              </CardHeader>
              <form onSubmit={perbaruiAlasan}>
                <CardContent>
                  <Label htmlFor="alasan-baru" className="sr-only">
                    {t.killSwitch.newReason}
                  </Label>
                  <Textarea
                    id="alasan-baru"
                    maxLength={500}
                    rows={3}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="mt-4 justify-end">
                  <Button type="submit" variant="outline" disabled={!alasan.trim() || set.isPending}>
                    {t.killSwitch.saveNote}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t.killSwitch.turnOffTitle}</CardTitle>
                <CardDescription>{t.killSwitch.turnOffDescription}</CardDescription>
              </CardHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setKonfirmasi("matikan")
                }}
              >
                <CardContent className="space-y-2">
                  <Label htmlFor="alasan">{t.killSwitch.reasonLabel}</Label>
                  <Textarea
                    id="alasan"
                    required
                    maxLength={500}
                    rows={3}
                    placeholder={t.killSwitch.reasonPlaceholder}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="mt-4 justify-end">
                  <Button type="submit" variant="destructive" disabled={!alasan.trim() || set.isPending}>
                    <PowerOffIcon data-icon="inline-start" />
                    {t.killSwitch.turnOffTitle}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t.killSwitch.notesTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-4 text-sm text-pretty text-muted-foreground">
                <li>{t.killSwitch.notes.test}</li>
                <li>
                  {t.killSwitch.notes.memoryLead}
                  <code className="text-foreground">KILL_SWITCH_ENABLED</code>
                  {t.killSwitch.notes.memoryTail}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog
        open={konfirmasi !== null}
        onOpenChange={(open) => !open && !set.isPending && setKonfirmasi(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {konfirmasi === "matikan"
                ? t.killSwitch.confirmOffTitle
                : t.killSwitch.confirmOnTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {konfirmasi === "matikan"
                ? t.killSwitch.confirmOffBody(t.labels.closedMessage)
                : t.killSwitch.confirmOnBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={set.isPending}>{t.common.cancel}</AlertDialogCancel>
            {konfirmasi === "matikan" ? (
              <Button variant="destructive" disabled={set.isPending} onClick={matikan}>
                {set.isPending ? t.killSwitch.turningOff : t.killSwitch.confirmOff}
              </Button>
            ) : (
              <Button disabled={set.isPending} onClick={nyalakan}>
                {set.isPending ? t.killSwitch.turningOn : t.killSwitch.confirmOn}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
