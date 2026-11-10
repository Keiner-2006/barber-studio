import { Injectable, signal, computed } from '@angular/core'
import {
  SalesReport,
  OccupancyReport,
  ServiceReport,
  InventoryReport,
  CashReport,
  ReportType,
} from './reports.models'
import { ReportsApi } from './reports.api'
import { ChartBar, ChartSeries } from '../../shared/components/bar-chart/bar-chart.component'
import { HBar } from '../../shared/components/horizontal-bar-chart/horizontal-bar-chart.component'
import { formatChartValue } from '../../shared/components/chart-format'

@Injectable({ providedIn: 'root' })
export class ReportsStore {
  private _sales = signal<SalesReport[]>([])
  private _occupancy = signal<OccupancyReport[]>([])
  private _services = signal<ServiceReport[]>([])
  private _inventory = signal<InventoryReport[]>([])
  private _cash = signal<CashReport[]>([])
  private _loading = signal(true)
  private _activeReport = signal<ReportType>('sales')
  private _lowStockItems = signal(0)

  readonly loading = this._loading.asReadonly()
  readonly activeReport = this._activeReport.asReadonly()
  readonly lowStockItems = this._lowStockItems.asReadonly()

  constructor(private api: ReportsApi) {}

  setActive(report: string): void {
    this._activeReport.set(report as ReportType)
    this.loadReport(report as ReportType)
  }

  load(): void {
    this.loadReport(this._activeReport())
  }

  loadReport(report: ReportType): void {
    this._loading.set(true)
    switch (report) {
      case 'sales':
        this.api.getSales().subscribe({
          next: (d) => { this._sales.set(d ?? []); this._loading.set(false) },
          error: () => this._loading.set(false),
        })
        break
      case 'occupancy':
        this.api.getOccupancy().subscribe({
          next: (d) => { this._occupancy.set(d ?? []); this._loading.set(false) },
          error: () => this._loading.set(false),
        })
        break
      case 'services':
        this.api.getServices().subscribe({
          next: (d) => { this._services.set(d ?? []); this._loading.set(false) },
          error: () => this._loading.set(false),
        })
        break
      case 'inventory':
        this.api.getInventory().subscribe({
          next: (d) => {
            this._inventory.set(d ?? [])
            this._lowStockItems.set(d.filter(i => i.currentStock <= i.minStock).length)
            this._loading.set(false)
          },
          error: () => this._loading.set(false),
        })
        break
      case 'cash':
        this.api.getCash().subscribe({
          next: (d) => { this._cash.set(d ?? []); this._loading.set(false) },
          error: () => this._loading.set(false),
        })
        break
    }
  }

  readonly salesChart = computed((): ChartSeries[] => [{
    name: 'Ventas',
    color: SERIES.sales,
    bars: this._sales().map((r): ChartBar => ({
      label: this.formatDate(r.date),
      value: num(r.totalSales),
      displayValue: money(num(r.totalSales)),
      isToday: r.date === localToday(),
    })),
  }])

  readonly occupancyChart = computed((): ChartSeries[] => [{
    name: 'Ocupación',
    color: SERIES.sales,
    bars: this._occupancy().map((r): ChartBar => {
      const rate = r.totalSlots > 0 ? (r.occupiedSlots / r.totalSlots) * 100 : 0
      return {
        label: this.formatDate(r.date),
        value: Math.round(rate * 10) / 10,
        displayValue: `${Math.round(rate)}% · ${r.occupiedSlots}/${r.totalSlots} turnos`,
        isToday: r.date === localToday(),
      }
    }),
  }])

  readonly servicesChart = computed((): HBar[] =>
    this._services().map((r) => ({
      label: r.name,
      value: num(r.totalSales),
      displayValue: money(num(r.totalSales)),
      secondary: `${r.quantity} ${r.quantity === 1 ? 'vendido' : 'vendidos'}`,
      color: SERIES.sales,
    })),
  )

  readonly inventoryChart = computed((): HBar[] =>
    this._inventory().map((r) => ({
      label: r.name,
      value: num(r.totalValue),
      displayValue: money(num(r.totalValue)),
      secondary: `Stock: ${r.currentStock} · mínimo ${r.minStock}`,
      warning: r.currentStock <= r.minStock ? 'Stock bajo' : undefined,
      color: SERIES.expenses,
    })),
  )

  readonly cashChart = computed((): ChartSeries[] => {
    const rows = this._cash()
    const series = (name: string, color: string, pick: (r: CashReport) => string): ChartSeries => ({
      name,
      color,
      bars: rows.map((r) => ({ label: this.formatDate(r.date), value: num(pick(r)), displayValue: money(num(pick(r))), isToday: r.date === localToday() })),
    })
    return [
      series('Ventas', SERIES.sales, (r) => r.sales),
      series('Gastos', SERIES.expenses, (r) => r.expenses),
      series('Neto', SERIES.net, (r) => r.net),
    ]
  })

  /** Headline numbers shown above the active chart. */
  readonly summary = computed((): { label: string; value: string }[] => {
    switch (this._activeReport()) {
      case 'sales': {
        const rows = this._sales()
        const total = rows.reduce((s, r) => s + num(r.totalSales), 0)
        const orders = rows.reduce((s, r) => s + (r.totalOrders || 0), 0)
        return [
          { label: 'Ventas totales', value: money(total) },
          { label: 'Órdenes', value: orders.toLocaleString('es-CO') },
          { label: 'Ticket promedio', value: money(orders ? total / orders : 0) },
        ]
      }
      case 'occupancy': {
        const rows = this._occupancy()
        const occ = rows.reduce((s, r) => s + r.occupiedSlots, 0)
        const all = rows.reduce((s, r) => s + r.totalSlots, 0)
        return [
          { label: 'Ocupación promedio', value: `${all ? Math.round((occ / all) * 100) : 0}%` },
          { label: 'Turnos ocupados', value: occ.toLocaleString('es-CO') },
          { label: 'Turnos disponibles', value: all.toLocaleString('es-CO') },
        ]
      }
      case 'services': {
        const rows = this._services()
        return [
          { label: 'Ingresos por servicios', value: money(rows.reduce((s, r) => s + num(r.totalSales), 0)) },
          { label: 'Servicios vendidos', value: rows.reduce((s, r) => s + r.quantity, 0).toLocaleString('es-CO') },
          { label: 'Servicios distintos', value: String(rows.length) },
        ]
      }
      case 'inventory': {
        const rows = this._inventory()
        return [
          { label: 'Valor del inventario', value: money(rows.reduce((s, r) => s + num(r.totalValue), 0)) },
          { label: 'Productos', value: String(rows.length) },
          { label: 'Con stock bajo', value: String(this._lowStockItems()) },
        ]
      }
      case 'cash': {
        const rows = this._cash()
        return [
          { label: 'Ventas', value: money(rows.reduce((s, r) => s + num(r.sales), 0)) },
          { label: 'Gastos', value: money(rows.reduce((s, r) => s + num(r.expenses), 0)) },
          { label: 'Neto', value: money(rows.reduce((s, r) => s + num(r.net), 0)) },
        ]
      }
    }
  })

  private formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const d = new Date(dateStr.slice(0, 10) + 'T00:00:00')
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }
}

// Categorical slots validated with the dataviz palette checker (light surface, all pairs).
const SERIES = { sales: '#b85a2b', expenses: '#2a78d6', net: '#00875a' }

const num = (v: string | number | null | undefined): number => Number(v) || 0
const money = (v: number): string => formatChartValue(v, 'money')
const localToday = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
