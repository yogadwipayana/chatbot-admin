"use client"

import {
  FlaskConicalIcon,
  InfoIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  UndoIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { PageHeader, QueryError } from "@/components/common"
import { KillSwitchView } from "@/components/kill-switch/kill-switch-view"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import type { Schemas } from "@/lib/api/client"
import {
  useResetRuntimeConfig,
  useRuntimeConfig,
  useUpdateRuntimeConfig,
} from "@/lib/api/queries"
import { useFormat, useLang, useT } from "@/lib/i18n"
import type { Dict } from "@/lib/i18n/dict"

type Config = Schemas["RuntimeConfig"]
type Values = Schemas["RuntimeConfigValues"]
type Key = keyof Values
type Draft = Partial<Record<Key, string>>

/** Nama dan penjelasan tiap parameter ada di `t.config.fields`; di sini
    hanya batas angkanya, yang bukan teks dan tidak ikut diterjemahkan. */
type Field = {
  key: Key
  min: number
  max: number
  step: number
}

/**
 * Batas di sini harus sama dengan `RuntimeConfigUpdate` di `api/api.yaml`.
 * Yang menegakkan tetap server: ini hanya supaya isian yang jelas keliru
 * ketahuan sebelum dikirim, bukan setelah ditolak.
 */
const PENCARIAN: Field[] = [
  { key: "retrieval_candidates", min: 1, max: 100, step: 1 },
  { key: "retrieval_top_n", min: 1, max: 50, step: 1 },
  { key: "rrf_weight_vector", min: 0, max: 5, step: 0.1 },
  { key: "rrf_weight_fulltext", min: 0, max: 5, step: 0.1 },
  { key: "rrf_k", min: 1, max: 1000, step: 1 },
]

const AMBANG: Field[] = [
  { key: "vector_threshold", min: 0, max: 1, step: 0.01 },
  { key: "lexical_threshold", min: 0, max: 1, step: 0.01 },
]

const POTONGAN: Field[] = [
  { key: "chunk_size", min: 200, max: 4000, step: 10 },
  { key: "chunk_overlap", min: 0, max: 1000, step: 5 },
]

const SEMUA = [...PENCARIAN, ...AMBANG, ...POTONGAN]

export function ConfigView() {
  const t = useT()
  const f = useFormat()
  const config = useRuntimeConfig()
  const simpan = useUpdateRuntimeConfig()
  const kembalikan = useResetRuntimeConfig()
  const [draft, setDraft] = useState<Draft>({})
  const [konfirmasi, setKonfirmasi] = useState(false)

  const data = config.data
  const sibuk = simpan.isPending || kembalikan.isPending

  function nilai(key: Key): string {
    return draft[key] ?? (data ? String(data.nilai[key]) : "")
  }

  const berubah = data ? SEMUA.filter((f) => nilai(f.key) !== String(data.nilai[f.key])) : []
  const keluhan: Partial<Record<Key, string>> = data ? periksa(nilai, t) : {}
  const adaKeluhan = Object.keys(keluhan).length > 0

  function kirim() {
    if (!data || berubah.length === 0 || adaKeluhan) return
    const body = Object.fromEntries(
      berubah.map((f) => [f.key, Number(nilai(f.key))])
    ) as Schemas["RuntimeConfigUpdate"]
    simpan.mutate(body, {
      onSuccess: () => {
        setDraft({})
        toast.success(t.config.saved, { description: t.config.savedBody })
      },
      onError: (error) => toast.error(t.common.saveFailed, { description: error.message }),
    })
  }

  function kembalikanSemua() {
    kembalikan.mutate(undefined, {
      onSuccess: () => {
        setDraft({})
        setKonfirmasi(false)
        toast.success(t.config.resetDone)
      },
      onError: (error) => toast.error(t.config.resetFailed, { description: error.message }),
    })
  }

  return (
    <>
      <PageHeader
        title={t.config.title}
        description={t.config.description}
        actions={
          data ? (
            <>
              <Button
                variant="outline"
                disabled={sibuk || data.diubah.length === 0}
                onClick={() => setKonfirmasi(true)}
              >
                <RotateCcwIcon data-icon="inline-start" />
                {t.config.resetAll}
              </Button>
              <Button disabled={sibuk || berubah.length === 0 || adaKeluhan} onClick={kirim}>
                {simpan.isPending
                  ? t.common.saving
                  : berubah.length > 0
                    ? t.config.saveCount(berubah.length)
                    : t.config.saveChanges}
              </Button>
            </>
          ) : null
        }
      />

      <div className="grid max-w-3xl gap-6">
        {config.error ? (
          <QueryError error={config.error} onRetry={() => config.refetch()} />
        ) : !data ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : (
          <>
          <LanguageCard />

          {data.peringatan ? (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>{t.config.warningTitle}</AlertTitle>
              <AlertDescription>
                <p>
                  {data.peringatan} {t.config.warningBody}
                </p>
              </AlertDescription>
            </Alert>
          ) : null}

          <Kelompok
            judul={t.config.groups.retrieval.title}
            keterangan={t.config.groups.retrieval.description}
            fields={PENCARIAN}
            data={data}
            nilai={nilai}
            keluhan={keluhan}
            disabled={sibuk}
            onChange={(key, v) => setDraft((d) => ({ ...d, [key]: v }))}
          />

          <Kelompok
            judul={t.config.groups.threshold.title}
            keterangan={t.config.groups.threshold.description}
            fields={AMBANG}
            data={data}
            nilai={nilai}
            keluhan={keluhan}
            disabled={sibuk}
            onChange={(key, v) => setDraft((d) => ({ ...d, [key]: v }))}
            catatan={
              <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <FlaskConicalIcon className="size-4 shrink-0" aria-hidden />
                {t.config.thresholdNoteLead}
                <Link href="/uji-coba" className="font-medium text-foreground underline">
                  {t.testQuery.title}
                </Link>
                .
              </p>
            }
          />

          <Kelompok
            judul={t.config.groups.chunking.title}
            keterangan={t.config.groups.chunking.description}
            fields={POTONGAN}
            data={data}
            nilai={nilai}
            keluhan={keluhan}
            disabled={sibuk}
            onChange={(key, v) => setDraft((d) => ({ ...d, [key]: v }))}
            catatan={
              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                {t.config.chunkingNote}
              </p>
            }
          />

          <ModelCard data={data} />

          {data.diperbarui_at ? (
            <p className="text-sm text-muted-foreground">
              {t.config.lastChanged(f.dateTime(data.diperbarui_at))}
              {data.diperbarui_oleh ? t.config.lastChangedBy(data.diperbarui_oleh) : ""}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t.config.untouched}</p>
          )}

          </>
        )}

        <KillSwitchView embedded />
      </div>

      <AlertDialog open={konfirmasi} onOpenChange={(open) => !open && !sibuk && setKonfirmasi(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.config.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.config.confirmBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sibuk}>{t.common.cancel}</AlertDialogCancel>
            <Button variant="destructive" disabled={sibuk} onClick={kembalikanSemua}>
              {kembalikan.isPending ? t.config.resetting : t.config.confirmYes}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Kelompok({
  judul,
  keterangan,
  fields,
  data,
  nilai,
  keluhan,
  disabled,
  onChange,
  catatan,
}: {
  judul: string
  keterangan: string
  fields: Field[]
  data: Config
  nilai: (key: Key) => string
  keluhan: Partial<Record<Key, string>>
  disabled: boolean
  onChange: (key: Key, value: string) => void
  catatan?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{judul}</CardTitle>
        <CardDescription>{keterangan}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field) => (
          <Baris
            key={field.key}
            field={field}
            data={data}
            value={nilai(field.key)}
            keluhan={keluhan[field.key]}
            disabled={disabled}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
        {catatan}
      </CardContent>
    </Card>
  )
}

function Baris({
  field,
  data,
  value,
  keluhan,
  disabled,
  onChange,
}: {
  field: Field
  data: Config
  value: string
  keluhan?: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  const t = useT()
  const teks = t.config.fields[field.key]
  const id = `konfigurasi-${field.key}`
  const nilaiServer = String(data.nilai_env[field.key])
  const ditimpa = data.diubah.includes(field.key)

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="flex flex-wrap items-center gap-2">
          {teks.label}
          {ditimpa ? <Badge variant="secondary">{t.config.changed}</Badge> : null}
        </Label>
        <p className="text-sm text-pretty text-muted-foreground">{teks.help}</p>
        {value !== nilaiServer ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 text-muted-foreground"
            disabled={disabled}
            onClick={() => onChange(nilaiServer)}
          >
            <UndoIcon data-icon="inline-start" />
            {t.config.serverValue(nilaiServer)}
          </Button>
        ) : null}
      </div>
      <div className="space-y-1 sm:w-32">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          className="tabular-nums"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          disabled={disabled}
          aria-invalid={keluhan ? true : undefined}
          aria-describedby={keluhan ? `${id}-galat` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {keluhan ? (
          <p id={`${id}-galat`} className="text-xs text-destructive">
            {keluhan}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Bahasa antarmuka, diletakkan paling atas dengan sengaja: yang mencarinya
 * sedang kesulitan membaca halaman ini, jadi ia harus ditemukan sebelum
 * halamannya perlu dibaca. Ada juga di menu akun pada sidebar, karena
 * halaman ini hanya terbuka untuk superadmin.
 */
function LanguageCard() {
  const t = useT()
  const { lang, setLang } = useLang()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.config.language.title}</CardTitle>
        <CardDescription>{t.config.language.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
        <div className="min-w-0 space-y-1">
          <Label htmlFor="bahasa-inggris">{t.config.language.switchLabel}</Label>
          <p className="text-sm text-pretty text-muted-foreground">
            {t.config.language.switchHint}
          </p>
        </div>
        <Switch
          id="bahasa-inggris"
          checked={lang === "en"}
          onCheckedChange={(aktif) => setLang(aktif ? "en" : "id")}
        />
      </CardContent>
    </Card>
  )
}

function ModelCard({ data }: { data: Config }) {
  const t = useT()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.config.model.title}</CardTitle>
        <CardDescription>
          {t.config.model.descriptionLead}
          <code className="text-foreground">.env</code>
          {t.config.model.descriptionTail}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">{t.config.model.chat}</dt>
          <dd className="min-w-0 font-medium break-words">{data.chat_model}</dd>
          <dt className="text-muted-foreground">{t.config.model.embed}</dt>
          <dd className="min-w-0 font-medium break-words">{data.embed_model}</dd>
          <dt className="text-muted-foreground">{t.config.model.endpoint}</dt>
          <dd className="min-w-0 break-words">
            {data.base_url || t.config.model.officialOpenAI}
          </dd>
          <dt className="text-muted-foreground">{t.config.model.apiKey}</dt>
          <dd>
            {data.api_key_terisi ? (
              <Badge variant="outline">{t.config.model.keySet}</Badge>
            ) : (
              <Badge variant="destructive">{t.config.model.keyMissing}</Badge>
            )}
          </dd>
        </dl>
      </CardContent>
    </Card>
  )
}

/** Isian yang jelas keliru, sebelum dikirim. Server memeriksa ulang semuanya. */
function periksa(nilai: (key: Key) => string, t: Dict): Partial<Record<Key, string>> {
  const hasil: Partial<Record<Key, string>> = {}
  const angka = {} as Record<Key, number>

  for (const field of SEMUA) {
    const teks = nilai(field.key).trim()
    const n = Number(teks)
    if (teks === "" || Number.isNaN(n)) {
      hasil[field.key] = t.config.validation.number
      continue
    }
    if (n < field.min || n > field.max) {
      hasil[field.key] = t.config.validation.between(field.min, field.max)
      continue
    }
    if (field.step === 1 && !Number.isInteger(n)) {
      hasil[field.key] = t.config.validation.integer
      continue
    }
    angka[field.key] = n
  }

  if (
    angka.retrieval_top_n !== undefined &&
    angka.retrieval_candidates !== undefined &&
    angka.retrieval_top_n > angka.retrieval_candidates
  ) {
    hasil.retrieval_top_n = t.config.validation.topN(angka.retrieval_candidates)
  }
  if (
    angka.chunk_overlap !== undefined &&
    angka.chunk_size !== undefined &&
    angka.chunk_overlap >= angka.chunk_size
  ) {
    hasil.chunk_overlap = t.config.validation.overlap(angka.chunk_size)
  }

  return hasil
}
