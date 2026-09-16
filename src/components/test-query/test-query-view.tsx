"use client"

import {
  BanIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HeartHandshakeIcon,
  MessageSquareTextIcon,
  SearchIcon,
  SmileIcon,
} from "lucide-react"
import { Fragment, useState, type FormEvent } from "react"

import { PageHeader, Spinner } from "@/components/common"
import { ScoreMeter } from "@/components/test-query/score-meter"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
import { useTestQuery } from "@/lib/api/queries"
import { formatDuration, formatScore } from "@/lib/format"
import { KIND_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"

type Result = Schemas["TestQueryResponse"]

const AMBANG_BAWAAN = 0.35

export function TestQueryView({ initialQuestion }: { initialQuestion: string }) {
  const [question, setQuestion] = useState(initialQuestion)
  const [pakaiAmbang, setPakaiAmbang] = useState(false)
  // null = ikuti ambang server; nilainya baru diketahui setelah uji coba pertama.
  const [ambang, setAmbang] = useState<number | null>(null)
  const test = useTestQuery()
  const hasil = test.data

  const ambangTampil = ambang ?? hasil?.ambang.vector ?? AMBANG_BAWAAN

  function uji(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    test.mutate({
      question: question.trim(),
      vector_threshold: pakaiAmbang ? ambangTampil : null,
    })
  }

  return (
    <>
      <PageHeader
        title="Uji coba jawaban"
        description="Ajukan pertanyaan seperti mahasiswa, lalu lihat potongan dokumen yang ditemukan beserta skornya. Alat utama saat ada laporan “jawabannya salah”. Uji coba tidak dicatat ke statistik."
      />

      <Card className="mb-6">
        <CardContent>
          <form onSubmit={uji} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pertanyaan">Pertanyaan</Label>
              <Textarea
                id="pertanyaan"
                required
                maxLength={2000}
                rows={3}
                placeholder="Kapan pengisian KRS semester ganjil dibuka?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit()
                }}
              />
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
                <Label htmlFor="pakai-ambang">Coba ambang lain</Label>
              </div>
              <div className={cn("flex flex-1 items-center gap-3", !pakaiAmbang && "opacity-50")}>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={!pakaiAmbang}
                  value={[ambangTampil]}
                  onValueChange={([v]) => setAmbang(v)}
                  aria-label="Ambang kemiripan vektor"
                />
                <span className="w-12 text-right text-sm tabular-nums">{formatScore(ambangTampil)}</span>
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Ambang sementara hanya berlaku untuk uji coba ini; mahasiswa tetap memakai ambang
              yang diatur di server.
            </p>

            <div className="flex items-center justify-end gap-3">
              {test.isPending ? <Spinner label="Mencari dan menyusun jawaban…" /> : null}
              <Button type="submit" disabled={!question.trim() || test.isPending}>
                <SearchIcon data-icon="inline-start" />
                Uji
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {test.error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Uji coba gagal</AlertTitle>
          <AlertDescription>{test.error.message}</AlertDescription>
        </Alert>
      ) : null}

      {hasil ? (
        <div className={cn("space-y-6 transition-opacity", test.isPending && "opacity-60")}>
          <div className="grid items-start gap-6 lg:grid-cols-5">
            <OutcomeCard hasil={hasil} />
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
} as const

function OutcomeCard({ hasil }: { hasil: Result }) {
  const Icon = KIND_ICON[hasil.kind]
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Yang dilihat mahasiswa</CardTitle>
          <Badge variant={hasil.kind === "answer" ? "default" : "secondary"}>
            <Icon data-icon="inline-start" />
            {KIND_LABELS[hasil.kind]}
          </Badge>
        </div>
        <CardDescription>
          {hasil.kind === "answer"
            ? "Jawaban disusun model AI hanya dari potongan yang lolos ambang."
            : hasil.kind === "refusal"
              ? "Model AI tidak dipanggil: sumbernya dinilai terlalu lemah."
              : hasil.kind === "support"
                ? "Pertanyaan bernuansa tekanan mental: tidak dicarikan di dokumen."
                : "Sapaan atau basa-basi: dibalas singkat tanpa retrieval."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{hasil.text}</p>
        {hasil.escalated && hasil.contacts.length > 0 ? (
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Kontak yang ditampilkan sebagai banner
            </p>
            <ul className="space-y-1.5 text-sm">
              {hasil.contacts.map((c) => (
                <li key={`${c.unit}-${c.kontak}`}>
                  <span className="font-medium">{c.unit}</span>{" "}
                  <span className="text-muted-foreground">
                    · {c.jam_layanan} · {c.kontak}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">Waktu proses {formatDuration(hasil.latency_ms)}</p>
      </CardContent>
    </Card>
  )
}

const REASON_TEXT: Record<NonNullable<Result["decision"]>["reason"], string> = {
  ok: "Lolos: minimal satu skor mencapai ambangnya, sehingga model AI dipanggil.",
  below_threshold:
    "Ditolak: kedua skor terbaik di bawah ambang. Dokumennya mungkin belum ada, atau kalimatnya terlalu berbeda.",
  no_results: "Ditolak: tidak ada satu pun potongan dokumen aktif yang ditemukan.",
}

function DecisionCard({ hasil }: { hasil: Result }) {
  const d = hasil.decision
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Keputusan ambang</CardTitle>
        <CardDescription>
          {d ? REASON_TEXT[d.reason] : "Pertanyaan sensitif dialihkan sebelum pencarian dokumen."}
        </CardDescription>
      </CardHeader>
      {d ? (
        <CardContent className="space-y-5">
          <ScoreMeter
            label="Kemiripan makna"
            hint="Pencarian vektor, 0–1"
            score={d.top_vector_score}
            threshold={hasil.ambang.vector}
            max={1}
          />
          <ScoreMeter
            label="Kecocokan kata"
            hint="Pencarian teks penuh"
            score={d.top_lexical_score}
            threshold={hasil.ambang.fulltext}
            max={Math.max(hasil.ambang.fulltext * 2, d.top_lexical_score ?? 0) * 1.1}
          />
        </CardContent>
      ) : null}
    </Card>
  )
}

function ScoreCell({ value, threshold }: { value: number | undefined; threshold: number }) {
  if (value === undefined) {
    return (
      <span className="text-muted-foreground">
        —<span className="sr-only">tidak ditemukan sumber ini</span>
      </span>
    )
  }
  const lolos = value >= threshold
  return (
    <span className="inline-flex items-center justify-end gap-1 tabular-nums">
      {formatScore(value)}
      {lolos ? (
        <>
          <CheckIcon className="size-3.5 text-status-good" aria-hidden />
          <span className="sr-only">mencapai ambang</span>
        </>
      ) : (
        <span className="inline-block size-3.5" aria-hidden />
      )}
    </span>
  )
}

function RetrievedCard({ hasil }: { hasil: Result }) {
  const [terbuka, setTerbuka] = useState<Set<string>>(new Set())

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
        <CardTitle>Potongan yang ditemukan</CardTitle>
        <CardDescription>
          Urutan hasil penggabungan dua pencarian. Yang menentukan penolakan adalah skor mentah
          per sumber, bukan skor gabungan: skor gabungan hanya mencerminkan peringkat, jadi potongan
          terbaik dari sekumpulan potongan yang tidak relevan tetap mendapat nilai tertinggi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasil.retrieved.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {hasil.decision ? "Tidak ada potongan yang ditemukan." : "Tidak ada pencarian dokumen."}
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-3">#</TableHead>
                  <TableHead className="min-w-56">Dokumen</TableHead>
                  <TableHead className="text-right">Makna</TableHead>
                  <TableHead className="text-right">Kata</TableHead>
                  <TableHead className="pr-3 text-right text-muted-foreground">Gabungan</TableHead>
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
                              <span className="font-medium">{chunk.judul}</span>
                              <span className="text-muted-foreground"> · hal. {chunk.halaman}</span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <ScoreCell value={chunk.raw_scores.vector} threshold={hasil.ambang.vector} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ScoreCell value={chunk.raw_scores.fulltext} threshold={hasil.ambang.fulltext} />
                        </TableCell>
                        <TableCell className="pr-3 text-right text-muted-foreground tabular-nums">
                          {chunk.rrf_score.toFixed(4)}
                        </TableCell>
                      </TableRow>
                      {buka ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={5} className="bg-muted/40 px-4 py-3 whitespace-normal">
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {chunk.konten}
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
