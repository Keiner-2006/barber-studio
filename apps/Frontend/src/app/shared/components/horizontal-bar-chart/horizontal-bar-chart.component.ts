import { Component, input, signal, effect } from '@angular/core'

export interface HBar {
  label: string
  value: number
  displayValue: string
  color?: string
  secondary?: string
}

interface BarHeight {
  label: string
  displayValue: string
  height: number
  color?: string
  secondary?: string
}

@Component({
  selector: 'app-horizontal-bar-chart',
  standalone: true,
  template: `
    <div class="hbar-chart">
      <div class="hbar-y-axis">
        @for (tick of yTicks(); track tick) {
          <span class="hbar-y-tick">{{ tick }}</span>
        }
      </div>
      <div class="hbar-container">
        @for (bar of heights(); track bar.label) {
          <div class="hbar-row">
            <span class="hbar-label" [title]="bar.label">{{ bar.label }}</span>
            <div class="hbar-track">
              <div
                class="hbar-fill"
                [style.width.%]="bar.height"
                [style.background]="bar.color || '#b87333'"
                [title]="bar.displayValue"></div>
            </div>
            <span class="hbar-value">{{ bar.displayValue }}</span>
            @if (bar.secondary) {
              <span class="hbar-secondary">{{ bar.secondary }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .hbar-chart { display: flex; flex-direction: column; gap: 8px; }
    .hbar-y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 200px; padding-right: 8px; align-items: flex-end; }
    .hbar-y-tick { font-size: 10px; color: #9ca3af; }
    .hbar-container { flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 6px; }
    .hbar-row { display: flex; align-items: center; gap: 10px; }
    .hbar-label { font-size: 11px; color: #374151; width: 120px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hbar-track { flex: 1; height: 18px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .hbar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; min-width: 2px; }
    .hbar-value { font-size: 11px; color: #6b7280; width: 70px; text-align: right; }
    .hbar-secondary { font-size: 10px; color: #9ca3af; width: 60px; text-align: right; }
  `]
})
export class HorizontalBarChartComponent {
  bars = input<HBar[]>([])

  heights = signal<BarHeight[]>([])
  yTicks = signal<string[]>([])

  private autoCompute = effect(() => {
    this.compute()
  })

  compute() {
    let maxVal = 0
    this.bars().forEach((b) => {
      if (b.value > maxVal) maxVal = b.value
    })
    maxVal = maxVal || 1

    this.heights.set(this.bars().map((b) => ({
      label: b.label,
      displayValue: b.displayValue,
      height: (b.value / maxVal) * 100,
      color: b.color,
      secondary: b.secondary,
    })))

    const ticks: string[] = []
    const step = Math.ceil(maxVal / 5) || 1
    for (let i = 0; i <= 5; i++) {
      ticks.push(this.formatTick(i * step))
    }
    this.yTicks.set(ticks)
  }

  private formatTick(v: number): string {
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
    return `$${Math.round(v)}`
  }
}