import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlatformAdminStore } from './platform-admin.store'

@Component({
  selector: 'app-platform-admin-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Consola Global</p>
          <h1>Citas<span class="accent">.</span></h1>
          <p class="subtitle">Resumen de citas programadas en todas las sedes de la plataforma.</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Sedes Activas</p>
          <p class="stat-value">{{ store.metrics().activeTenants }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Total Tenants</p>
          <p class="stat-value">{{ store.totalTenants() ?? '—' }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Cobertura</p>
          <p class="stat-value">{{ store.countryDistribution().length }} países</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>Distribución de Tenants por País</h3>
        </div>
        <div class="card-body">
          @if (store.countryDistribution().length === 0) {
            <div class="empty-state"><p>Sin datos de ubicación disponibles</p></div>
          } @else {
            <div class="country-list">
              @for (slice of store.countryDistribution(); track slice.code) {
                <div class="country-row">
                  <span class="country-name">{{ slice.code }}</span>
                  <span class="country-count">{{ slice.count }} sedes</span>
                  <div class="country-bar-track">
                    <div class="country-bar-fill" [style.width.%]="slice.ratio * 100"></div>
                  </div>
                </div>
              }
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
    .stat-label { font-size: 13px; color: #6b7280; }
    .stat-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #2d2d2d; margin-top: 8px; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-header { padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 16px; color: #2d2d2d; margin: 0; }
    .card-body { padding: 20px; }
    .country-list { display: flex; flex-direction: column; gap: 12px; }
    .country-row { display: flex; align-items: center; gap: 12px; }
    .country-name { font-weight: 500; color: #2d2d2d; min-width: 60px; }
    .country-count { font-size: 13px; color: #6b7280; min-width: 80px; }
    .country-bar-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .country-bar-fill { height: 100%; background: #b87333; border-radius: 4px; transition: width 0.3s; }
    .empty-state { display: flex; align-items: center; justify-content: center; min-height: 200px; color: #6b7280; }
  `]
})
export class PlatformAdminAppointmentsComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  ngOnInit(): void { this.store.load() }
}
