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

  readonly salesChart = computed((): ChartSeries[] => {
    const bars: ChartBar[] = this._sales().map((r) => ({
      label: this.formatDate(r.date),
      value: parseFloat(r.totalSales) || 0,
      displayValue: `$${parseFloat(r.totalSales).toLocaleString('es-MX')}`,
      isToday: r.date === new Date().toISOString().split('T')[0],
    }))
    return [{
      name: 'Ventas',
      bars,
      color: '#b87333',
    }] as ChartSeries[]
  })

  readonly occupancyChart = computed((): ChartSeries[] => {
    const bars: ChartBar[] = this._occupancy().map((r) => ({
      label: this.formatDate(r.date),
      value: r.occupiedSlots,
      displayValue: `${r.occupiedSlots} / ${r.totalSlots}`,
      isToday: r.date === new Date().toISOString().split('T')[0],
    }))
    return [{
      name: 'Ocupación',
      bars,
      color: '#22c55e',
    }] as ChartSeries[]
  })

  readonly servicesChart = computed((): HBar[] => {
    return this._services().map((r) => ({
      label: r.name,
      value: parseFloat(r.totalSales) || 0,
      displayValue: `$${parseFloat(r.totalSales).toLocaleString('es-MX')}`,
      secondary: `${r.quantity} vendidos`,
      color: '#b87333',
    })) as HBar[]
  })

  readonly inventoryChart = computed((): HBar[] => {
    return this._inventory().map((r) => ({
      label: r.name,
      value: parseFloat(r.totalValue) || 0,
      displayValue: `$${parseFloat(r.totalValue).toLocaleString('es-MX')}`,
      secondary: `Stock: ${r.currentStock}`,
      color: '#3b82f6',
    })) as HBar[]
  })

  readonly cashChart = computed((): ChartSeries[] => {
    const salesBars = this._cash().map((r) => ({
      label: this.formatDate(r.date),
      value: parseFloat(r.sales) || 0,
      displayValue: `$${parseFloat(r.sales).toLocaleString('es-MX')}`,
      color: '#22c55e',
    }))
    const expenseBars = this._cash().map((r) => ({
      label: this.formatDate(r.date),
      value: parseFloat(r.expenses) || 0,
      displayValue: `$${parseFloat(r.expenses).toLocaleString('es-MX')}`,
      color: '#ef4444',
    }))
    const netBars = this._cash().map((r) => ({
      label: this.formatDate(r.date),
      value: parseFloat(r.net) || 0,
      displayValue: `$${parseFloat(r.net).toLocaleString('es-MX')}`,
      color: '#b87333',
    }))
    return [
      { name: 'Ventas', bars: salesBars, color: '#22c55e' },
      { name: 'Gastos', bars: expenseBars, color: '#ef4444' },
      { name: 'Neto', bars: netBars, color: '#b87333' },
    ] as ChartSeries[]
  })

  private formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }
}
