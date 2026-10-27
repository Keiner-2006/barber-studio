import { Component, input, signal, effect, computed } from '@angular/core'

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

interface BarEntry {
  label: string
  displayValue: string
  isToday?: boolean
  height: number
}

interface GroupedBar {
  label: string
  displayValue: string
  isToday?: boolean
  totalHeight: number
  bars: Map<string, BarEntry>
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <div class="bar-chart" [class.multi]="series().length > 1">
      <div class="chart-legend">
        @for (s of series(); track s.name) {
          <span class="legend-item">
            <span class="legend-dot" [style.background]="s.color || '#b87333'"></span>
            <span class="legend-label">{{ s.name }}</span>
          </span>
        }
      </div>

      <div class="chart-area">
        <div class="y-axis">
          @for (tick of yTicks(); track tick) {
            <span class="y-tick">{{ tick }}</span>
          }
        </div>

        <div class="bars-container">
          @for (group of groupedBars(); track group.label) {
            <div class="bar-column">
              <div class="bar-stack" [style.height.%]="group.totalHeight">
                @for (s of series(); track s.name) {
                  @let bar = group.bars.get(s.name);
                  @if (bar) {
                    <div
                      class="bar-segment"
                      [style.height.%]="bar.height"
                      [style.background]="s.color || '#b87333'"
                      [title]="bar.displayValue"></div>
                  }
                }
              </div>
              <span class="bar-value">{{ group.displayValue }}</span>
              <span class="bar-label" [class.today]="group.isToday">{{ group.label }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bar-chart { display: flex; flex-direction: column; gap: 16px; }
    .chart-legend { display: flex; gap: 16px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; }
    .legend-label { }
    .chart-area { display: flex; flex-direction: column; gap: 8px; }
    .y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 200px; padding-right: 8px; }
    .y-tick { font-size: 10px; color: #9ca3af; text-align: right; }
    .bars-container { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; height: 200px; padding: 0 4px; border-bottom: 1px solid #e5e7eb; }
    .bar-column { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; }
    .bar-stack { width: 100%; max-width: 40px; display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch; height: 100%; }
    .bar-segment { width: 100%; border-radius: 2px 2px 0 0; transition: height 0.3s ease; min-height: 2px; }
    .bar-value { font-size: 10px; color: #6b7280; text-align: center; }
    .bar-label { font-size: 10px; color: #9ca3af; text-align: center; }
    .bar-label.today { color: #b87333; font-weight: 600; }
  `]
})
export class BarChartComponent {
  series = input<ChartSeries[]>([])

  groupedBars = signal<GroupedBar[]>([])
  yTicks = signal<string[]>([])

  private autoCompute = effect(() => {
    this.compute()
  })

  compute() {
    const labels = new Set<string>()
    const labelInfo = new Map<string, { isToday?: boolean }>()

    this.series().forEach((s) => {
      s.bars.forEach((b) => {
        labels.add(b.label)
        if (b.isToday) labelInfo.set(b.label, { isToday: true })
      })
    })

    let maxVal = 0
    this.series().forEach((s) => {
      s.bars.forEach((b) => {
        if (b.value > maxVal) maxVal = b.value
      })
    })
    maxVal = maxVal || 1

    const groupedMap = new Map<string, GroupedBar>()
    labels.forEach((label) => {
      const bars = new Map<string, BarEntry>()
      let totalHeight = 0
      let displayValue = ''
      this.series().forEach((s) => {
        const barData = s.bars.find((b) => b.label === label)
        if (barData) {
          const height = (barData.value / maxVal) * 100
          bars.set(s.name, {
            label: barData.label,
            displayValue: barData.displayValue,
            isToday: barData.isToday,
            height,
          })
          totalHeight += height
          if (!displayValue) displayValue = barData.displayValue
        }
      })
      groupedMap.set(label, {
        label,
        displayValue,
        isToday: labelInfo.get(label)?.isToday,
        totalHeight: Math.min(totalHeight, 100),
        bars,
      })
    })

    // Convertir Map a Array para que Angular pueda iterarlo
    const groupedArray = Array.from(groupedMap.values())

    const ticks: string[] = []
    const step = Math.ceil(maxVal / 5) || 1
    for (let i = 5; i >= 0; i--) {
      ticks.push(this.formatTick(i * step))
    }
    this.yTicks.set(ticks)
    this.groupedBars.set(groupedArray)
  }

  private formatTick(v: number): string {
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
    return `$${Math.round(v)}`
  }
}