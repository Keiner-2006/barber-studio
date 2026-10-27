import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { PlatformAdminStore } from './platform-admin.store'

@Component({
  selector: 'app-platform-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Gestión Global</p>
          <h1>Servicios<span class="accent">.</span></h1>
          <p class="subtitle">Catálogo de servicios configurados en todas las sedes de la plataforma.</p>
        </div>
        <button class="primary-button">+ Nuevo Servicio</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Total Servicios</p>
          <p class="stat-value">{{ store.tenants().length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Sedes Activas</p>
          <p class="stat-value">{{ store.metrics().activeTenants }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Categorías</p>
          <p class="stat-value">—</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>Servicios por Sede</h3>
        </div>
        <div class="card-body">
          @if (store.loading()) {
            <div class="loading">Cargando servicios...</div>
          } @else if (store.tenants().length === 0) {
            <div class="empty-state">
              <p>Sin datos de servicios disponibles</p>
            </div>
          } @else {
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Sede</th>
                    <th>Servicios</th>
                    <th>País</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tenant of store.recentTenants(); track tenant.id) {
                    <tr>
                      <td>{{ tenant.tradeName }}</td>
                      <td>—</td>
                      <td>{{ tenant.countryCode }}</td>
                      <td><span class="status-badge">{{ tenant.status }}</span></td>
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
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; margin: 0; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
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
    .status-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; background: #dcfce7; color: #166534; font-weight: 600; }
    .loading { padding: 40px; text-align: center; color: #6b7280; }
    .empty-state { display: flex; align-items: center; justify-content: center; min-height: 200px; color: #6b7280; }
  `]
})
export class PlatformAdminServicesComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  ngOnInit(): void { this.store.load() }
}
