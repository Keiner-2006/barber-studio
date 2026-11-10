import { Component, computed, input } from '@angular/core'

export interface HBar {
  label: string
  value: number
  displayValue: string
  color?: string
  secondary?: string
  /** Flags the row (e.g. stock below minimum) with an icon + text, never color alone. */
  warning?: string
}

/** Ranked horizontal bars: sorted desc, value labels in ink, no fake axis. */
@Component({
  selector: 'app-horizontal-bar-chart',
  standalone: true,
  template: `
    <ol class="hbar-chart">
      @for (bar of rows(); track bar.label) {
        <li class="row" [title]="bar.label + ': ' + bar.displayValue">
          <div class="meta">
            <span class="label">{{ bar.label }}</span>
            <span class="value">{{ bar.displayValue }}</span>
          </div>
          <div class="track"><div class="fill" [style.width.%]="bar.width" [style.background]="bar.color || '#b85a2b'"></div></div>
          @if (bar.secondary || bar.warning) {
            <div class="sub">
              @if (bar.secondary) { <span>{{ bar.secondary }}</span> }
              @if (bar.warning) { <span class="warn"><span class="material-symbols-outlined" aria-hidden="true">warning</span>{{ bar.warning }}</span> }
            </div>
          }
        </li>
      }
    </ol>
  `,
  styles: [`
    :host { display: block; }
    .hbar-chart { display: grid; gap: 16px; list-style: none; margin: 0; padding: 0; }
    .meta { align-items: baseline; display: flex; gap: 12px; justify-content: space-between; margin-bottom: 6px; }
    .label { color: #1c1c16; font-size: 14px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .value { color: #1c1c16; flex: none; font-size: 14px; font-variant-numeric: tabular-nums; font-weight: 700; }
    .track { background: #f1ece4; border-radius: 4px; height: 12px; overflow: hidden; }
    .fill { border-radius: 0 4px 4px 0; height: 100%; min-width: 3px; transition: width .3s ease; }
    .sub { color: #57534e; display: flex; flex-wrap: wrap; font-size: 13px; gap: 4px 14px; margin-top: 6px; }
    .warn { align-items: center; color: #8a4a00; display: inline-flex; font-weight: 600; gap: 4px; }
    .warn .material-symbols-outlined { font-size: 16px; }
    @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }
  `],
})
export class HorizontalBarChartComponent {
  bars = input<HBar[]>([])

  readonly rows = computed(() => {
    const max = Math.max(1, ...this.bars().map((b) => b.value))
    return [...this.bars()]
      .sort((a, b) => b.value - a.value)
      .map((b) => ({ ...b, width: (Math.max(b.value, 0) / max) * 100 }))
  })
}
