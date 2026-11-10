export type ChartFormat = 'money' | 'number' | 'percent'

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const number = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

export function formatChartValue(v: number, format: ChartFormat, compact = false): string {
  if (format === 'percent') return `${number.format(v)}%`
  const abs = Math.abs(v)
  if (compact && abs >= 1000) {
    const short = abs >= 1_000_000 ? `${number.format(abs / 1_000_000)}M` : `${number.format(abs / 1000)}k`
    return `${v < 0 ? '-' : ''}${format === 'money' ? '$' : ''}${short}`
  }
  return format === 'money' ? money.format(v) : number.format(v)
}

/** Round axis bounds to 1/2/5 × 10^n steps so ticks land on readable values; always includes 0. */
export function niceTicks(min: number, max: number, count = 5): { min: number; max: number; ticks: number[] } {
  if (min === max) max = min + 1
  const raw = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Math.round(t / step) * step)
  return { min: lo, max: hi, ticks }
}
