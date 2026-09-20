"use client"

import { enUS as localeEn, id as localeId } from "date-fns/locale"
import { CalendarIcon, TriangleAlertIcon, XIcon } from "lucide-react"
import { useState, type ReactNode } from "react"
import type { DateRange, Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNow } from "@/hooks/use-now"
import { parseDateOnly, toDateInput } from "@/lib/format"
import { useFormat, useLang, useT } from "@/lib/i18n"
import type { Lang } from "@/lib/i18n/lang"
import { cn } from "@/lib/utils"

const SEHARI = 86_400_000

/**
 * Gaya kalender yang berlaku untuk seluruh pemilih tanggal di dashboard.
 *
 * Dipusatkan di sini supaya dua pemilih yang berbeda -- satu tanggal dan
 * rentang -- tidak pelan-pelan berbeda bahasanya atau bentuk judulnya setiap
 * kali salah satunya disunting. Nama bulan dan hari datang dari locale
 * date-fns, jadi kalendernya ikut berganti bahasa bersama sisa dashboard.
 */
function useGayaKalender() {
  const { lang } = useLang()
  return {
    locale: LOCALE_KALENDER[lang],
    captionLayout: "dropdown",
    autoFocus: true,
  } as const
}

const LOCALE_KALENDER = { id: localeId, en: localeEn } satisfies Record<
  Lang,
  typeof localeId
>

/**
 * Hari yang tidak dapat dipilih, dari `min`/`max` bergaya `YYYY-MM-DD`.
 *
 * Satu-satunya tempat batas itu diterjemahkan, sehingga kedua pemilih tanggal
 * memvalidasi dengan aturan yang sama persis.
 */
function batasHari(min?: string, max?: string): Matcher[] | undefined {
  const batas: Matcher[] = []
  if (min) batas.push({ before: parseDateOnly(min) })
  if (max) batas.push({ after: parseDateOnly(max) })
  return batas.length > 0 ? batas : undefined
}

function Tebal({ children }: { children: ReactNode }) {
  return <span className="text-foreground">{children}</span>
}

function Pemisah() {
  return <span className="mx-1.5 text-border">|</span>
}

/**
 * Baris keterangan di bawah kalender.
 *
 * Bentuknya sama untuk semua pemilih tanggal: tanggal yang dipilih, pemisah,
 * lalu artinya ("8 hari lagi", "30 hari"). Tanggal sendirian tidak memberi
 * tahu apa pun -- justru sisi kanan pemisah itulah yang menjawab "lalu
 * kenapa".
 */
function KakiKalender({
  keterangan,
  peringatan,
  aksi,
}: {
  keterangan?: ReactNode
  peringatan?: boolean
  aksi?: ReactNode
}) {
  if (!keterangan && !aksi) return null
  return (
    <div className="space-y-2 border-t p-2">
      {keterangan ? (
        <p
          className={cn(
            "flex items-start gap-1.5 px-1 text-xs text-pretty",
            peringatan ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {peringatan ? (
            <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-status-warning" />
          ) : null}
          <span>{keterangan}</span>
        </p>
      ) : null}
      {aksi}
    </div>
  )
}

/**
 * Pemilih satu tanggal.
 *
 * Nilainya tetap berupa `YYYY-MM-DD` seperti yang diminta API, bukan objek
 * `Date`: satu-satunya tempat zona waktu diterjemahkan adalah `parseDateOnly`
 * dan `toDateInput`, sehingga "31 Agu" tidak pernah berubah menjadi 30 Agustus
 * di peramban yang zonanya di belakang UTC.
 *
 * Menggantikan `<input type="date">`, yang tampilannya ditentukan sistem
 * operasi dan karena itu tidak pernah cocok dengan sisa dashboard.
 */
export function DateField({
  id,
  value,
  onChange,
  disabled,
  min,
  max,
  placeholder,
  clearLabel,
  spanFrom,
  className,
}: {
  id?: string
  /** `YYYY-MM-DD`, atau kosong bila belum dipilih. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Batas tanggal yang boleh dipilih, `YYYY-MM-DD`. */
  min?: string
  max?: string
  placeholder?: string
  /** Bila diisi, popover membawa tombol untuk mengosongkan pilihan. */
  clearLabel?: string
  /**
   * Titik awal hitungan, `YYYY-MM-DD` (biasanya hari ini). Bila diisi, hari di
   * antara keduanya ditandai dan kaki kalender menyebutkan sisa waktunya.
   */
  spanFrom?: string
  className?: string
}) {
  const t = useT()
  const f = useFormat()
  const gaya = useGayaKalender()
  const [open, setOpen] = useState(false)
  const terpilih = value ? parseDateOnly(value) : undefined

  // Rentang dropdown bulan/tahun mengikuti batas yang diberikan; tanpa batas,
  // lima tahun ke belakang dan sepuluh ke depan sudah mencakup masa berlaku
  // dokumen mana pun tanpa membuat daftar tahunnya sepanjang satu abad.
  const sekarang = new Date()
  const batasBawah = min ? parseDateOnly(min) : new Date(sekarang.getFullYear() - 5, 0, 1)
  // Nilai yang tersimpan mungkin lebih tua dari `min` (mis. dokumen yang masa
  // berlakunya sudah habis). Biarkan bulannya tetap dapat dibuka supaya admin
  // melihat tanggalnya; harinya tetap tidak dapat dipilih karena `disabled`.
  const awalPilihan = terpilih && terpilih < batasBawah ? terpilih : batasBawah
  const akhirPilihan = max ? parseDateOnly(max) : new Date(sekarang.getFullYear() + 10, 11, 31)

  const awal = spanFrom ? parseDateOnly(spanFrom) : undefined
  const selisih =
    awal && terpilih ? Math.round((terpilih.getTime() - awal.getTime()) / SEHARI) : null
  const sudahLewat = selisih !== null && selisih < 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            "w-full justify-start font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {value ? f.date(value) : (placeholder ?? t.dateField.placeholder)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          {...gaya}
          mode="single"
          startMonth={awalPilihan}
          endMonth={akhirPilihan}
          defaultMonth={terpilih ?? (max ? parseDateOnly(max) : undefined)}
          selected={terpilih}
          disabled={batasHari(min, max)}
          modifiers={
            awal && terpilih && !sudahLewat ? { rentang: { from: awal, to: terpilih } } : undefined
          }
          // Sewarna dengan tengah rentang pada pemilih rentang, supaya kedua
          // kalender menyampaikan hal yang sama dengan cara yang sama.
          modifiersClassNames={{ rentang: "rounded-none bg-primary/10" }}
          onSelect={(tanggal) => {
            onChange(tanggal ? toDateInput(tanggal) : "")
            setOpen(false)
          }}
        />
        <KakiKalender
          peringatan={sudahLewat}
          keterangan={
            awal && value ? (
              sudahLewat ? (
                <>{t.dateField.expired(f.date(value))}</>
              ) : (
                <>
                  {t.dateField.endsOn}
                  <Tebal>{f.date(value)}</Tebal>
                  <Pemisah />
                  {selisih === 0 ? t.dateField.today : t.dateField.inTime(f.lama(selisih!))}
                </>
              )
            ) : null
          }
          aksi={
            clearLabel && value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
              >
                <XIcon data-icon="inline-start" />
                {clearLabel}
              </Button>
            ) : null
          }
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * Pemilih rentang tanggal: satu kalender dua bulan, awal dan akhir terlihat
 * sekaligus beserta hari-hari di antaranya.
 *
 * Dipakai untuk periode statistik. Dua isian tanggal terpisah memaksa pembaca
 * merangkai sendiri "dari ... sampai ..." di kepalanya, dan tidak pernah
 * memperlihatkan berapa panjang periode yang sedang dilihat.
 */
export function DateRangeField({
  id,
  value,
  onChange,
  min,
  max,
  className,
}: {
  id?: string
  /** Keduanya `YYYY-MM-DD`; string kosong berarti belum dipilih. */
  value: { sejak: string; sampai: string }
  onChange: (value: { sejak: string; sampai: string }) => void
  /** Batas tanggal yang boleh dipilih, `YYYY-MM-DD`. */
  min?: string
  max?: string
  className?: string
}) {
  const t = useT()
  const f = useFormat()
  const gaya = useGayaKalender()
  const [open, setOpen] = useState(false)
  const now = useNow()

  // Rentang yang sedang dipilih: ada isinya hanya di antara klik pertama dan
  // kedua. Rentang yang sudah berlaku tidak ikut berubah sebelum keduanya
  // dipilih, supaya grafik di belakang tidak berkedip setengah jalan.
  const [draf, setDraf] = useState<DateRange | undefined>()

  const tersimpan: DateRange | undefined = value.sejak
    ? {
        from: parseDateOnly(value.sejak),
        to: value.sampai ? parseDateOnly(value.sampai) : undefined,
      }
    : undefined
  const terpilih = draf ?? tersimpan

  const hari =
    value.sejak && value.sampai
      ? Math.round(
          (parseDateOnly(value.sampai).getTime() - parseDateOnly(value.sejak).getTime()) / SEHARI
        ) + 1
      : null

  let label: string = t.dateField.rangePlaceholder
  if (value.sejak && value.sampai) label = `${f.date(value.sejak)} – ${f.date(value.sampai)}`
  else if (value.sejak) label = t.dateField.rangePartial(f.date(value.sejak))

  return (
    <Popover
      open={open}
      onOpenChange={(terbuka) => {
        setOpen(terbuka)
        if (!terbuka) setDraf(undefined)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          data-empty={!value.sejak}
          className={cn(
            "justify-start font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          {...gaya}
          mode="range"
          numberOfMonths={2}
          startMonth={min ? parseDateOnly(min) : new Date(new Date(now).getFullYear() - 5, 0, 1)}
          endMonth={max ? parseDateOnly(max) : undefined}
          // Mulai dari bulan tanggal awal: dengan dua bulan berdampingan,
          // sebagian besar rentang yang dipakai admin terlihat utuh sekaligus.
          defaultMonth={terpilih?.from}
          selected={terpilih}
          disabled={batasHari(min, max)}
          onSelect={(_rentang, hariDiklik) => {
            // Dua klik, selalu: yang pertama memulai rentang baru, yang kedua
            // mengakhirinya. Tanpa aturan ini, satu klik di dalam rentang yang
            // sudah ada hanya menggeser salah satu ujungnya lalu menutup
            // kalender -- dan pengguna tidak pernah tahu ujung yang mana.
            if (!draf?.from || draf.to) {
              setDraf({ from: hariDiklik, to: undefined })
              return
            }
            // Urutannya dibetulkan sendiri: klik kedua yang jatuh sebelum klik
            // pertama menjadi awal rentang, bukan rentang terbalik yang ditolak
            // server.
            const [dari, sampai] =
              hariDiklik < draf.from ? [hariDiklik, draf.from] : [draf.from, hariDiklik]
            setDraf(undefined)
            onChange({ sejak: toDateInput(dari), sampai: toDateInput(sampai) })
            setOpen(false)
          }}
        />
        <KakiKalender
          keterangan={
            draf?.from && !draf.to ? (
              <>
                {t.dateField.startsOn}
                <Tebal>{f.date(draf.from)}</Tebal>
                <Pemisah />
                {t.dateField.pickEnd}
              </>
            ) : hari !== null ? (
              <>
                <Tebal>
                  {f.date(value.sejak)} – {f.date(value.sampai)}
                </Tebal>
                <Pemisah />
                {t.dateField.rangeDays(hari)}
              </>
            ) : (
              <>{t.dateField.rangeHint}</>
            )
          }
        />
      </PopoverContent>
    </Popover>
  )
}
