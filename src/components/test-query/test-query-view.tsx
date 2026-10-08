"use client"

import {
  BanIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartHandshakeIcon,
  MessageSquareTextIcon,
  SearchIcon,
  ShieldBanIcon,
  SmileIcon,
  WorkflowIcon,
} from "lucide-react"
import Link from "next/link"
import { Fragment, useState, type FormEvent } from "react"

import { PageHeader, RichText, Spinner } from "@/components/common"
import { ScoreMeter } from "@/components/test-query/score-meter"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { Schemas } from "@/lib/api/client"
import { useMe, useTestQuery, useUnits } from "@/lib/api/queries"
import { useFormat, useT } from "@/lib/i18n"
import { atLeast } from "@/lib/roles"
import type { Dict } from "@/lib/i18n/dict"
import { cn } from "@/lib/utils"

type Result = Schemas["TestQueryResponse"]

const AMBANG_BAWAAN = 0.35

/** Nilai Select untuk "Semua unit": Select tidak menerima string kosong. */
const SEMUA_UNIT = "__semua__"

export function TestQueryView({
  initialQuestion,
  initialUnit,
}: {
  initialQuestion: string
  /** Dari `?unit=`: tautan Uji coba di Tak terjawab dan Umpan balik membawa
      unit yang dipilih mahasiswa saat bertanya. */
  initialUnit: string
}) {
  const t = useT()
  const f = useFormat()
  const [question, setQuestion] = useState(initialQuestion)
  const [unit, setUnit] = useState(initialUnit)
  const units = useUnits()
  // Unit dari tautan tetap dapat dipilih walau tidak ada di daftar (mis. sudah
  // diganti namanya); server yang memutuskan unit itu sah atau tidak.
  const pilihanUnit = unit && !units.includes(unit) ? [unit, ...units] : units
  const [pakaiAmbang, setPakaiAmbang] = useState(false)
  // null = ikuti ambang server; nilainya baru diketahui setelah uji coba pertama.
  const [ambang, setAmbang] = useState<number | null>(null)
  const test = useTestQuery()
  const hasil = test.data

  const ambangTampil = ambang ?? hasil?.thresholds.vector ?? AMBANG_BAWAAN

  function uji(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    test.mutate({
      question: question.trim(),
      vector_threshold: pakaiAmbang ? ambangTampil : null,
      unit: unit || null,
    })
  }

  return (
    <>
      <PageHeader
        title={t.testQuery.title}
        description={t.testQuery.description}
      />

      <Card className="mb-6">
        <CardContent>
          <form onSubmit={uji} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pertanyaan">{t.testQuery.question}</Label>
              <Textarea
                id="pertanyaan"
                required
                maxLength={2000}
                rows={3}
                placeholder={t.testQuery.questionPlaceholder}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit()
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-uji">{t.testQuery.unit}</Label>
              <Select
                value={unit || SEMUA_UNIT}
                onValueChange={(v) => setUnit(v === SEMUA_UNIT ? "" : v)}
              >
                <SelectTrigger id="unit-uji" className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEMUA_UNIT}>{t.testQuery.allUnits}</SelectItem>
                  {pilihanUnit.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t.testQuery.unitHint}</p>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Switch
                  id="pakai-ambang"
                  checked={pakaiAmbang}
                  onCheckedChange={(v) => {
                    setPakaiAmbang(v)
                    if (v) setAmbang(ambangTampil)
                  }}
                />
                <Label htmlFor="pakai-ambang">{t.testQuery.tryThreshold}</Label>
              </div>
              <div className={cn("flex flex-1 items-center gap-3", !pakaiAmbang && "opacity-50")}>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={!pakaiAmbang}
                  value={[ambangTampil]}
                  onValueChange={([v]) => setAmbang(v)}
                  aria-label={t.testQuery.thresholdLabel}
                />
                <span className="w-12 text-right text-sm tabular-nums">
                  {f.score(ambangTampil)}
                </span>
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">{t.testQuery.thresholdNote}</p>

            <div className="flex items-center justify-end gap-3">
              {test.isPending ? <Spinner label={t.testQuery.running} /> : null}
              <Button type="submit" disabled={!question.trim() || test.isPending}>
                <SearchIcon data-icon="inline-start" />
                {t.testQuery.submit}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {test.error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{t.testQuery.failed}</AlertTitle>
          <AlertDescription>{test.error.message}</AlertDescription>
        </Alert>
      ) : null}

      {hasil ? (
        <div className={cn("space-y-6 transition-opacity", test.isPending && "opacity-60")}>
          <div className="grid items-start gap-6 lg:grid-cols-5">
            {/* Unit milik uji coba yang menghasilkan `hasil`, bukan isian saat ini. */}
            <OutcomeCard hasil={hasil} unit={test.variables?.unit ?? null} />
            <DecisionCard hasil={hasil} />
          </div>
          <RetrievedCard hasil={hasil} />
        </div>
      ) : null}
    </>
  )
}

const KIND_ICON = {
  answer: MessageSquareTextIcon,
  refusal: BanIcon,
  support: HeartHandshakeIcon,
  smalltalk: SmileIcon,
  rejected: ShieldBanIcon,
} as const

function OutcomeCard({ hasil, unit }: { hasil: Result; unit: string | null }) {
  const t = useT()
  const me = useMe().data
  const f = useFormat()
  const Icon = KIND_ICON[hasil.kind]
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{t.testQuery.outcomeTitle}</CardTitle>
          <Badge variant={hasil.kind === "answer" ? "default" : "secondary"}>
            <Icon data-icon="inline-start" />
            {t.labels.kind[hasil.kind]}
          </Badge>
        </div>
        <CardDescription>
          {hasil.kind === "refusal" && hasil.refusal_source === "llm"
            ? t.testQuery.refusalByLlm
            : hasil.kind === "rejected" && hasil.rejection_source
              ? t.testQuery.rejectedBy[hasil.rejection_source]
              : t.testQuery.outcome[hasil.kind]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          <RichText text={hasil.text} />
        </p>
        {hasil.attachments.map((lampiran, index) => (
          <LampiranDaftar key={index} lampiran={lampiran} />
        ))}
        <p className="text-xs text-muted-foreground">
          {unit ? t.testQuery.searchedUnit(unit) : t.testQuery.searchedAll}
        </p>
        {hasil.gate ? (
          <p className="text-xs text-muted-foreground">
            {hasil.gate.error
              ? t.testQuery.gateError(hasil.gate.error)
              : t.testQuery.gate(
                  t.testQuery.gateSource[hasil.gate.source ?? "jev"],
                  t.testQuery.gateLabel[hasil.gate.label],
                  f.percent(hasil.gate.confidence, 0),
                  hasil.gate.blocked
                )}
          </p>
        ) : null}
        {hasil.escalated && hasil.contacts.length > 0 ? (
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t.testQuery.contactsTitle}
            </p>
            <ul className="space-y-1.5 text-sm">
              {hasil.contacts.map((c) => (
                <li key={`${c.unit}-${c.contact}`}>
                  <span className="font-medium">{c.unit}</span>{" "}
                  <span className="text-muted-foreground">
                    · {c.service_hours} · {c.contact}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t.testQuery.latency(f.duration(hasil.latency_ms))}
          </p>
          {/* Halaman Log minimal admin; staf tidak diberi tautan yang berujung 403. */}
          {hasil.turn_id && atLeast(me, "admin") ? (
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link href={`/log?tab=graf&giliran=${encodeURIComponent(hasil.turn_id)}`}>
                <WorkflowIcon data-icon="inline-start" />
                {t.testQuery.openLog}
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

/** Sama dengan widget mahasiswa (`BARIS_PER_HALAMAN` di client chat-message.tsx). */
const BARIS_PER_HALAMAN = 10

/**
 * Lampiran tool (api/docs/tool-call.md §10a) seperti yang tampil di widget:
 * daftar dari SADS di bawah jawaban, per 10 baris. Tanpa ini admin hanya
 * membaca "Ada 25 dosen bergelar Dr." dan tidak dapat memeriksa daftar yang
 * sebenarnya dilihat mahasiswa.
 */
function LampiranDaftar({ lampiran }: { lampiran: Schemas["AttachmentOut"] }) {
  const t = useT()
  const f = useFormat()
  const [pilihan, setHalaman] = useState(0)
  const total = lampiran.items.length
  const terakhir = Math.max(0, Math.ceil(total / BARIS_PER_HALAMAN) - 1)
  // Uji coba berikutnya memakai ulang komponen ini (kunci = indeks): halaman 3
  // dari 220 nama tidak boleh menjadi daftar kosong untuk hasil 25 nama.
  const halaman = Math.min(pilihan, terakhir)
  const awal = halaman * BARIS_PER_HALAMAN
  const akhir = Math.min(awal + BARIS_PER_HALAMAN, total)
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{lampiran.title}</p>
        <p className="text-xs text-muted-foreground">{lampiran.source}</p>
      </div>
      <ol
        start={awal + 1}
        className="list-decimal space-y-0.5 pl-10 text-sm break-words marker:text-muted-foreground"
      >
        {lampiran.items.slice(awal, akhir).map((item, index) => (
          <li key={awal + index}>{item}</li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{t.testQuery.attachmentNote}</span>
        {terakhir > 0 ? (
          <div className="flex items-center gap-2">
            <span>{t.documents.range(f.number(awal + 1), f.number(akhir), f.number(total))}</span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={halaman === 0}
              onClick={() => setHalaman(halaman - 1)}
              aria-label={t.documents.previous}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={halaman >= terakhir}
              onClick={() => setHalaman(halaman + 1)}
              aria-label={t.documents.next}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function DecisionCard({ hasil }: { hasil: Result }) {
  const t = useT()
  const d = hasil.decision
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t.testQuery.decisionTitle}</CardTitle>
        <CardDescription>
          {d
            ? t.testQuery.reason[d.reason]
            : hasil.kind === "rejected"
              ? t.testQuery.decisionRejected
              : hasil.kind === "smalltalk"
                ? t.testQuery.decisionSmalltalk
                : t.testQuery.decisionSensitive}
        </CardDescription>
      </CardHeader>
      {d ? (
        <CardContent className="space-y-5">
          <ScoreMeter
            label={t.testQuery.vectorLabel}
            hint={t.testQuery.vectorHint}
            score={d.top_vector_score}
            threshold={hasil.thresholds.vector}
            max={1}
          />
          <ScoreMeter
            label={t.testQuery.lexicalLabel}
            hint={t.testQuery.lexicalHint}
            score={d.top_lexical_score}
            threshold={hasil.thresholds.fulltext}
            max={Math.max(hasil.thresholds.fulltext * 2, d.top_lexical_score ?? 0) * 1.1}
          />
        </CardContent>
      ) : null}
    </Card>
  )
}

function ScoreCell({
  value,
  threshold,
  t,
  f,
}: {
  value: number | undefined
  threshold: number
  t: Dict
  f: ReturnType<typeof useFormat>
}) {
  if (value === undefined) {
    return (
      <span className="text-muted-foreground">
        —<span className="sr-only">{t.testQuery.noSource}</span>
      </span>
    )
  }
  const lolos = value >= threshold
  return (
    <span className="inline-flex items-center justify-end gap-1 tabular-nums">
      {f.score(value)}
      {lolos ? (
        <>
          <CheckIcon className="size-3.5 text-status-good" aria-hidden />
          <span className="sr-only">{t.testQuery.reachedThreshold}</span>
        </>
      ) : (
        <span className="inline-block size-3.5" aria-hidden />
      )}
    </span>
  )
}

function RetrievedCard({ hasil }: { hasil: Result }) {
  const t = useT()
  const f = useFormat()
  const [terbuka, setTerbuka] = useState<Set<string>>(new Set())
  // Nomor baris (1-based) per potongan, untuk label "lanjutan dari #n".
  const nomor = new Map(hasil.retrieved.map((chunk, i) => [chunk.chunk_id, i + 1]))

  function alih(id: string) {
    setTerbuka((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.testQuery.retrievedTitle}</CardTitle>
        <CardDescription>{t.testQuery.retrievedDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasil.retrieved.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {hasil.decision
              ? t.testQuery.noChunks
              : hasil.kind === "rejected" && hasil.rejection_source === "jev"
                ? t.testQuery.searchStopped
                : t.testQuery.noSearch}
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-3">#</TableHead>
                  <TableHead className="min-w-56">{t.testQuery.columns.document}</TableHead>
                  <TableHead className="text-right">{t.testQuery.columns.semantic}</TableHead>
                  <TableHead className="text-right">{t.testQuery.columns.keyword}</TableHead>
                  <TableHead className="pr-3 text-right text-muted-foreground">
                    {t.testQuery.columns.fused}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasil.retrieved.map((chunk, i) => {
                  const buka = terbuka.has(chunk.chunk_id)
                  return (
                    <Fragment key={chunk.chunk_id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => alih(chunk.chunk_id)}
                      >
                        <TableCell className="pl-3 tabular-nums text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="whitespace-normal">
                          <button
                            type="button"
                            className="flex items-start gap-1.5 text-left"
                            aria-expanded={buka}
                            onClick={(e) => {
                              e.stopPropagation()
                              alih(chunk.chunk_id)
                            }}
                          >
                            {buka ? (
                              <ChevronDownIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                            ) : (
                              <ChevronRightIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                            )}
                            <span>
                              <span className="font-medium">{chunk.title}</span>
                              {/* Entri tanya jawab tidak berhalaman; "hal. 1" hanya menyesatkan. */}
                              <span className="text-muted-foreground">
                                {chunk.type === "tanya_jawab"
                                  ? t.testQuery.faqSource
                                  : t.testQuery.pageSource(chunk.page)}
                              </span>
                            </span>
                          </button>
                        </TableCell>
                        {chunk.neighbor_of && nomor.has(chunk.neighbor_of) ? (
                          <TableCell
                            colSpan={3}
                            className="pr-3 text-right text-xs whitespace-normal text-muted-foreground"
                          >
                            {t.testQuery.neighborOf(nomor.get(chunk.neighbor_of) ?? 0)}
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="text-right">
                              <ScoreCell
                                value={chunk.raw_scores.vector}
                                threshold={hasil.thresholds.vector}
                                t={t}
                                f={f}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <ScoreCell
                                value={chunk.raw_scores.fulltext}
                                threshold={hasil.thresholds.fulltext}
                                t={t}
                                f={f}
                              />
                            </TableCell>
                            <TableCell className="pr-3 text-right text-muted-foreground tabular-nums">
                              {chunk.rrf_score.toFixed(4)}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                      {buka ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={5} className="bg-muted/40 px-4 py-3 whitespace-normal">
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {chunk.content}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
