import { Component, OnInit } from '@angular/core'
import { ReportsStore } from './reports.store'
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component'
import { HorizontalBarChartComponent } from '../../shared/components/horizontal-bar-chart/horizontal-bar-chart.component'

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [BarChartComponent, HorizontalBarChartComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Análisis y métricas</p>
          <h1>Reportes<span class="accent">.</span></h1>
          <p class="subtitle">Visualiza el rendimiento de tu barbería.</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="store.activeReport() === 'sales'" (click)="store.setActive('sales')">Ventas</button>
        <button class="tab" [class.active]="store.activeReport() === 'occupancy'" (click)="store.setActive('occupancy')">Ocupación</button>
        <button class="tab" [class.active]="store.activeReport() === 'services'" (click)="store.setActive('services')">Servicios</button>
        <button class="tab" [class.active]="store.activeReport() === 'inventory'" (click)="store.setActive('inventory')">Inventario</button>
        <button class="tab" [class.active]="store.activeReport() === 'cash'" (click)="store.setActive('cash')">Caja</button>
      </div>

      <div class="report-content" [class.loading]="store.loading()">
        @if (store.loading()) {
          <div class="skeleton-rows">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton-row"></div>
            }
          </div>
        } @else {
          <div class="chart-wrapper">
            @switch (store.activeReport()) {
              @case ('sales') {
                @if (store.salesChart().length === 0) {
                  <div class="empty-state">Sin datos de ventas</div>
                } @else {
                  <app-bar-chart [series]="store.salesChart()"></app-bar-chart>
                }
              }
              @case ('occupancy') {
                @if (store.occupancyChart().length === 0) {
                  <div class="empty-state">Sin datos de ocupación</div>
                } @else {
                  <app-bar-chart [series]="store.occupancyChart()"></app-bar-chart>
                }
              }
              @case ('services') {
                @if (store.servicesChart().length === 0) {
                  <div class="empty-state">Sin datos de servicios</div>
                } @else {
                  <app-horizontal-bar-chart [bars]="store.servicesChart()"></app-horizontal-bar-chart>
                }
              }
              @case ('inventory') {
                @if (store.inventoryChart().length === 0) {
                  <div class="empty-state">Sin datos de inventario</div>
                } @else {
                  <app-horizontal-bar-chart [bars]="store.inventoryChart()"></app-horizontal-bar-chart>
                }
                @if (store.lowStockItems() > 0) {
                  <div class="alert">⚠️ {{ store.lowStockItems() }} productos con stock bajo</div>
                }
              }
              @case ('cash') {
                @if (store.cashChart().length === 0) {
                  <div class="empty-state">Sin datos de caja</div>
                } @else {
                  <app-bar-chart [series]="store.cashChart()"></app-bar-chart>
                }
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; flex-wrap: wrap; }
    .tab { padding: 10px 16px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 13px; color: #6b7280; }
    .tab.active { color: #b87333; border-bottom-color: #b87333; font-weight: 500; }
    .chart-wrapper { padding: 24px; }
    .empty-state { display: flex; align-items: center; justify-content: center; min-height: 200px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; color: #6b7280; }
    .alert { padding: 12px 16px; background: #fef3c7; border-radius: 8px; margin-top: 16px; font-size: 13px; color: #92400e; }
    .report-content { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .skeleton-rows { padding: 20px; }
    .skeleton-row { height: 40px; background: #f3f4f6; border-radius: 4px; margin-bottom: 8px; }
    .skeleton-rows .skeleton-row:last-child { margin-bottom: 0; }
    .report-content.loading { min-height: 200px; }
  `]
})
export class ReportsComponent implements OnInit {
  constructor(public store: ReportsStore) {}

  ngOnInit(): void {
    this.store.load()
  }
}
