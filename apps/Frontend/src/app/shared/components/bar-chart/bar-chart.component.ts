import { Component, computed, input, signal } from '@angular/core'
import { ChartFormat, formatChartValue, niceTicks } from '../chart-format'

export interface ChartBar {
  label: string
  value: number
  displayValue: string
  isToday?: boolean
  color?: string
}

export interface ChartSeries {
  name: string
  bars: ChartBar[]
  color?: string
}

interface Group {
  label: string
  isToday: boolean
  bars: { name: string; color: string; display: string; top: number; height: number; neg: boolean }[]
}

const DEFAULT_COLOR = '#b85a2b'

/** Grouped (never stacked) vertical bar chart: one y-axis, zero baseline, hover tooltip and table view. */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <figure class="chart">
      @if (series().length > 1) {
        <div class="legend">
          @for (s of series(); track s.name) {
            <span class="legend-item"><i [style.background]="s.color || fallback"></i>{{ s.name }}</span>
          }
        </div>
      }

      <div class="plot">
        <div class="y-axis" aria-hidden="true">
          @for (t of scale().ticks; track t) {
            <span [style.bottom.%]="pos(t)">{{ fmt(t, true) }}</span>
          }
        </div>
        <div class="area" [style.min-width.px]="groups().length * 28">
          @for (t of scale().ticks; track t) {
            <div class="gridline" [class.zero]="t === 0" [style.bottom.%]="pos(t)"></div>
          }
          <div class="groups">
            @for (g of groups(); track g.label; let i = $index) {
              <div class="group" tabindex="0" [attr.aria-label]="ariaFor(g)"
                   (mouseenter)="active.set(i)" (mouseleave)="active.set(null)" (focus)="active.set(i)" (blur)="active.set(null)">
                <div class="bars">
                  @for (b of g.bars; track b.name) {
                    <div class="bar" [class.neg]="b.neg" [style.background]="b.color" [style.top.%]="b.top" [style.height.%]="b.height"></div>
                  }
                </div>
                <span class="x-label" [class.today]="g.isToday" [class.hide]="!showLabel(i)">{{ g.label }}</span>
                @if (active() === i) {
                  <div class="tooltip" role="tooltip" [class.flip]="i >= groups().length / 2">
                    <strong>{{ g.label }}</strong>
                    @for (b of g.bars; track b.name) {
                      <span><i [style.background]="b.color"></i>{{ b.name }}<b>{{ b.display }}</b></span>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <details class="table-view">
        <summary>Ver como tabla</summary>
        <table>
          <thead><tr><th scope="col">Periodo</th>@for (s of series(); track s.name) { <th scope="col">{{ s.name }}</th> }</tr></thead>
          <tbody>
            @for (g of groups(); track g.label) {
              <tr><th scope="row">{{ g.label }}</th>@for (b of g.bars; track b.name) { <td>{{ b.display }}</td> }</tr>
            }
          </tbody>
        </table>
      </details>
    </figure>
  `,
  styles: [`
    :host { display: block; }
    .chart { margin: 0; --ink: #1c1c16; --ink-2: #57534e; --ink-3: #6f6760; --grid: #ece7df; }
    .legend { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-bottom: 16px; }
    .legend-item { align-items: center; color: var(--ink-2); display: inline-flex; font-size: 13px; font-weight: 600; gap: 8px; }
    .legend-item i, .tooltip i { border-radius: 3px; display: inline-block; flex: none; height: 10px; width: 10px; }
    .plot { display: grid; gap: 10px; grid-template-columns: auto 1fr; overflow-x: auto; padding-top: 8px; }
    .y-axis { height: 240px; min-width: 44px; position: relative; }
    .y-axis span { color: var(--ink-3); font-size: 12px; font-variant-numeric: tabular-nums; position: absolute; right: 0; transform: translateY(50%); white-space: nowrap; }
    .area { height: 240px; margin-bottom: 30px; position: relative; }
    .gridline { border-top: 1px solid var(--grid); left: 0; position: absolute; right: 0; }
    .gridline.zero { border-top-color: #c9bfb3; }
    .groups { display: flex; gap: 6px; inset: 0; position: absolute; }
    .group { border-radius: 6px; flex: 1; min-width: 0; outline: none; position: relative; }
    .group:hover, .group:focus-visible { background: rgba(148,73,40,.06); }
    .group:focus-visible { box-shadow: 0 0 0 2px #c4703f; }
    .bars { display: flex; gap: 2px; height: 100%; justify-content: center; padding: 0 12%; position: relative; }
    .bar { border-radius: 4px 4px 0 0; flex: 1; max-width: 36px; position: relative; transition: height .3s ease, top .3s ease; }
    .bar.neg { border-radius: 0 0 4px 4px; }
    .x-label { color: var(--ink-3); font-size: 12px; left: 50%; position: absolute; top: calc(100% + 8px); transform: translateX(-50%); white-space: nowrap; }
    .x-label.today { color: var(--ink); font-weight: 700; }
    .x-label.hide { visibility: hidden; }
    .tooltip { background: #1f1712; border-radius: 10px; box-shadow: 0 10px 24px rgba(0,0,0,.2); color: #f6eee4; display: grid; font-size: 13px; gap: 4px; left: 50%; min-width: 160px; padding: 10px 12px; pointer-events: none; position: absolute; top: 4px; z-index: 5; }
    .tooltip.flip { left: auto; right: 50%; }
    .tooltip span { align-items: center; display: flex; gap: 8px; }
    .tooltip b { font-variant-numeric: tabular-nums; margin-left: auto; padding-left: 12px; }
    .table-view { margin-top: 4px; }
    .table-view summary { color: var(--ink-2); cursor: pointer; font-size: 13px; font-weight: 600; }
    .table-view table { border-collapse: collapse; font-size: 13px; margin-top: 10px; width: 100%; }
    .table-view th, .table-view td { border-bottom: 1px solid var(--grid); color: var(--ink); padding: 8px; text-align: right; }
    .table-view th:first-child { text-align: left; }
    .table-view td { font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) { .bar { transition: none; } }
  `],
})
export class BarChartComponent {
  series = input<ChartSeries[]>([])
  format = input<ChartFormat>('money')

  readonly fallback = DEFAULT_COLOR
  readonly active = signal<number | null>(null)

  readonly scale = computed(() => {
    const values = this.series().flatMap((s) => s.bars.map((b) => b.value))
    return niceTicks(Math.min(0, ...values), Math.max(0, ...values))
  })

  readonly groups = computed((): Group[] => {
    const labels: string[] = []
    const today = new Set<string>()
    for (const s of this.series()) {
      for (const b of s.bars) {
        if (!labels.includes(b.label)) labels.push(b.label)
        if (b.isToday) today.add(b.label)
      }
    }
    const zeroTop = 100 - this.pos(0)
    return labels.map((label) => ({
      label,
      isToday: today.has(label),
      bars: this.series().map((s) => {
        const bar = s.bars.find((b) => b.label === label)
        const value = bar?.value ?? 0
        const end = 100 - this.pos(value)
        return {
          name: s.name,
          color: s.color || DEFAULT_COLOR,
          display: bar?.displayValue ?? this.fmt(0),
          neg: value < 0,
          top: Math.min(end, zeroTop),
          // Minimum sliver so a zero still reads as "measured, zero" rather than missing.
          height: Math.max(Math.abs(end - zeroTop), 0.8),
        }
      }),
    }))
  })

  pos(v: number): number {
    const { min, max } = this.scale()
    return ((v - min) / (max - min)) * 100
  }

  fmt(v: number, compact = false): string {
    return formatChartValue(v, this.format(), compact)
  }

  showLabel(i: number): boolean {
    const n = this.groups().length
    return i % Math.ceil(n / 12) === 0 || i === n - 1
  }

  ariaFor(g: Group): string {
    return `${g.label}: ${g.bars.map((b) => `${b.name} ${b.display}`).join(', ')}`
  }
}
