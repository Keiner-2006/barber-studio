import { Component, OnInit } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { ReportsStore } from './reports.store'
import { ReportType } from './reports.models'
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component'
import { HorizontalBarChartComponent } from '../../shared/components/horizontal-bar-chart/horizontal-bar-chart.component'

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgTemplateOutlet, BarChartComponent, HorizontalBarChartComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <p class="eyebrow">Análisis y métricas</p>
        <h1>Reportes</h1>
        <p class="subtitle">Revisa cómo va tu barbería: ventas, ocupación, servicios, inventario y caja.</p>
      </header>

      <div class="tabs" role="tablist" aria-label="Tipo de reporte">
        @for (t of tabs; track t.id) {
          <button type="button" role="tab" class="tab" [class.active]="store.activeReport() === t.id" [attr.aria-selected]="store.activeReport() === t.id" (click)="store.setActive(t.id)">
            <span class="material-symbols-outlined" aria-hidden="true">{{ t.icon }}</span>{{ t.label }}
          </button>
        }
      </div>

      @if (store.loading()) {
        <div class="skeleton" aria-busy="true" aria-label="Cargando reporte">
          <div class="sk-tiles">@for (i of [1, 2, 3]; track i) { <div></div> }</div>
          <div class="sk-chart"></div>
        </div>
      } @else {
        <div class="tiles">
          @for (s of store.summary(); track s.label) {
            <div class="tile"><span>{{ s.label }}</span><strong>{{ s.value }}</strong></div>
          }
        </div>

        <section class="card">
          <h2>{{ current().title }}</h2>
          <p class="hint">{{ current().hint }}</p>
          @switch (store.activeReport()) {
            @case ('sales') {
              @if (store.salesChart()[0].bars.length) { <app-bar-chart [series]="store.salesChart()" format="money" /> } @else { <ng-container *ngTemplateOutlet="empty" /> }
            }
            @case ('occupancy') {
              @if (store.occupancyChart()[0].bars.length) { <app-bar-chart [series]="store.occupancyChart()" format="percent" /> } @else { <ng-container *ngTemplateOutlet="empty" /> }
            }
            @case ('services') {
              @if (store.servicesChart().length) { <app-horizontal-bar-chart [bars]="store.servicesChart()" /> } @else { <ng-container *ngTemplateOutlet="empty" /> }
            }
            @case ('inventory') {
              @if (store.lowStockItems() > 0) {
                <div class="alert" role="status"><span class="material-symbols-outlined" aria-hidden="true">warning</span>{{ store.lowStockItems() }} {{ store.lowStockItems() === 1 ? 'producto tiene' : 'productos tienen' }} stock bajo</div>
              }
              @if (store.inventoryChart().length) { <app-horizontal-bar-chart [bars]="store.inventoryChart()" /> } @else { <ng-container *ngTemplateOutlet="empty" /> }
            }
            @case ('cash') {
              @if (store.cashChart()[0].bars.length) { <app-bar-chart [series]="store.cashChart()" format="money" /> } @else { <ng-container *ngTemplateOutlet="empty" /> }
            }
          }
        </section>
      }

      <ng-template #empty>
        <div class="empty"><span class="material-symbols-outlined" aria-hidden="true">insights</span><p>Aún no hay datos para este reporte.</p></div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { color: #1c1c16; margin: 0 auto; max-width: 1200px; padding: clamp(20px, 4vw, 40px); }
    .page-header { margin-bottom: 24px; }
    .eyebrow { color: #944928; font-size: 13px; font-weight: 700; letter-spacing: .12em; margin: 0 0 6px; text-transform: uppercase; }
    h1 { color: #1c1c16; font: 700 clamp(30px, 4vw, 40px)/1.1 'Vollkorn', serif; margin: 0; }
    .subtitle { color: #57534e; font-size: 15px; margin: 8px 0 0; }
    .tabs { border-bottom: 1px solid #e6dfd5; display: flex; gap: 4px; margin-bottom: 24px; overflow-x: auto; }
    .tab { align-items: center; background: none; border: 0; border-bottom: 2px solid transparent; color: #57534e; cursor: pointer; display: inline-flex; flex: none; font: 600 14px 'Plus Jakarta Sans', sans-serif; gap: 6px; margin-bottom: -1px; min-height: 44px; padding: 0 14px; transition: color .2s, border-color .2s; }
    .tab .material-symbols-outlined { font-size: 18px; }
    .tab:hover { color: #1c1c16; }
    .tab.active { border-bottom-color: #944928; color: #1c1c16; }
    .tab.active .material-symbols-outlined { color: #944928; }
    .tab:focus-visible { border-radius: 6px; outline: 2px solid #c4703f; outline-offset: -2px; }
    .tiles { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 16px; }
    .tile { background: #fff; border: 1px solid #e6dfd5; border-radius: 14px; padding: 16px 18px; }
    .tile span { color: #57534e; display: block; font-size: 13px; font-weight: 600; }
    .tile strong { color: #1c1c16; display: block; font: 700 26px/1.2 'Vollkorn', serif; font-variant-numeric: tabular-nums; margin-top: 4px; }
    .card { background: #fff; border: 1px solid #e6dfd5; border-radius: 16px; padding: clamp(18px, 3vw, 28px); }
    .card h2 { color: #1c1c16; font: 600 20px 'Vollkorn', serif; margin: 0; }
    .hint { color: #57534e; font-size: 14px; margin: 4px 0 20px; }
    .alert { align-items: center; background: #fff4e0; border: 1px solid #f3d29a; border-radius: 10px; color: #6b3a00; display: flex; font-size: 14px; font-weight: 600; gap: 8px; margin-bottom: 20px; padding: 12px 14px; }
    .empty { align-items: center; border: 2px dashed #e6dfd5; border-radius: 12px; color: #57534e; display: flex; flex-direction: column; gap: 8px; justify-content: center; min-height: 220px; }
    .empty .material-symbols-outlined { color: #a08d7e; font-size: 32px; }
    .empty p { margin: 0; }
    .skeleton { display: grid; gap: 16px; }
    .sk-tiles { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .sk-tiles div, .sk-chart { animation: pulse 1.4s ease-in-out infinite; background: #f1ece4; border-radius: 14px; height: 84px; }
    .sk-chart { height: 320px; }
    @keyframes pulse { 50% { opacity: .55; } }
    @media (prefers-reduced-motion: reduce) { .sk-tiles div, .sk-chart { animation: none; } }
  `],
})
export class ReportsComponent implements OnInit {
  readonly tabs: { id: ReportType; label: string; icon: string; title: string; hint: string }[] = [
    { id: 'sales', label: 'Ventas', icon: 'payments', title: 'Ventas por día', hint: 'Total vendido cada día. Pasa el cursor sobre una barra para ver el detalle.' },
    { id: 'occupancy', label: 'Ocupación', icon: 'event_seat', title: 'Ocupación por día', hint: 'Porcentaje de turnos ocupados sobre los disponibles.' },
    { id: 'services', label: 'Servicios', icon: 'content_cut', title: 'Servicios más vendidos', hint: 'Ordenados por ingresos generados.' },
    { id: 'inventory', label: 'Inventario', icon: 'inventory_2', title: 'Valor del inventario por producto', hint: 'Stock actual por costo unitario, de mayor a menor.' },
    { id: 'cash', label: 'Caja', icon: 'account_balance_wallet', title: 'Ventas, gastos y neto por día', hint: 'Compara entradas y salidas de caja de cada día.' },
  ]

  constructor(public store: ReportsStore) {}

  current() {
    return this.tabs.find((t) => t.id === this.store.activeReport()) ?? this.tabs[0]
  }

  ngOnInit(): void {
    this.store.load()
  }
}
