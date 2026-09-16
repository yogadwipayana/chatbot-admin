import { StatusLabel } from "@/components/status"
import { formatScore } from "@/lib/format"

/**
 * Skor mentah terhadap ambang penolakan (FR-3).
 *
 * Isi batang = skor, garis tegak = ambang. Lolos/tidak ditulis sebagai label
 * berikon di bawahnya, sehingga tidak bergantung pada membaca posisi garis.
 */
export function ScoreMeter({
  label,
  hint,
  score,
  threshold,
  max,
}: {
  label: string
  hint: string
  score: number | null | undefined
  threshold: number
  max: number
}) {
  const skala = max > 0 ? max : 1
  const isi = score == null ? 0 : Math.min(score / skala, 1) * 100
  const posisiAmbang = Math.min(threshold / skala, 1) * 100
  const lolos = score != null && score >= threshold

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{score == null ? "—" : formatScore(score)}</span>
          <span className="text-muted-foreground"> / ambang {formatScore(threshold)}</span>
        </p>
      </div>
      <div className="relative h-2.5" aria-hidden>
        <div className="absolute inset-0 overflow-hidden rounded-full bg-series-1-track">
          <div className="h-full rounded-r-[4px] bg-series-1" style={{ width: `${isi}%` }} />
        </div>
        <div
          className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-foreground"
          style={{ left: `calc(${posisiAmbang}% - 1px)` }}
        />
      </div>
      <StatusLabel level={lolos ? "good" : "serious"} className="text-xs">
        {score == null
          ? "Tidak ada potongan dari sumber ini"
          : lolos
            ? "Mencapai ambang"
            : "Di bawah ambang"}
      </StatusLabel>
    </div>
  )
}
