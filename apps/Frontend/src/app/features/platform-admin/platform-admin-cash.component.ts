import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlatformAdminStore } from './platform-admin.store'

@Component({
  selector: 'app-platform-admin-cash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Consola Central</p>
          <h1>Caja y Pagos<span class="accent">.</span></h1>
          <p class="subtitle">Resumen financiero de todas las sedes activas de la plataforma.</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card highlight">
          <p class="stat-label">Sedes Activas</p>
          <p class="stat-value">{{ store.metrics().activeTenants }}</p>
        </div>
        <div class="stat-card highlight">
          <p class="stat-label">Sedes en Mora</p>
          <p class="stat-value">{{ store.metrics().suspendedTenants }}</p>
        </div>
        <div class="stat-card highlight">
          <p class="stat-label">MRR Disponible</p>
          <p class="stat-value">—</p>
        </div>
        <div class="stat-card highlight">
          <p class="stat-label">Cobertura</p>
          <p class="stat-value">{{ store.countryDistribution().length }} países</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>Estado Financiero por Sede</h3>
        </div>
        <div class="card-body">
          @if (store.tenants().length === 0) {
            <div class="empty-state"><p>Sin datos financieros disponibles</p></div>
          } @else {
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Sede</th>
                    <th>País</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>MRR</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tenant of store.recentTenants(); track tenant.id) {
                    <tr>
                      <td>{{ tenant.tradeName }}</td>
                      <td>{{ tenant.countryCode }}</td>
                      <td><span class="status-badge" [class.active]="tenant.status === 'active'">{{ tenant.status }}</span></td>
                      <td>{{ tenant.createdAt | date:'dd MMM yyyy' }}</td>
                      <td>—</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1400px; margin: 0 auto; font-family: 'Plus Jakarta Sans', sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; margin: 0; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .stat-card.highlight { border-left: 4px solid #b87333; }
    .stat-label { font-size: 13px; color: #6b7280; }
    .stat-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #2d2d2d; margin-top: 8px; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-header { padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 16px; color: #2d2d2d; margin: 0; }
    .card-body { padding: 20px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .data-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .data-table tbody tr:hover { background: #fafaf8; }
    .status-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge:not(.active) { background: #fee2e2; color: #dc2626; }
    .empty-state { display: flex; align-items: center; justify-content: center; min-height: 200px; color: #6b7280; }
  `]
})
export class PlatformAdminCashComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  ngOnInit(): void { this.store.load() }
}
