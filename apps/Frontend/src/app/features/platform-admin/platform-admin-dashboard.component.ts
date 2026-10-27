import { Component, OnInit, computed, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { PlatformAdminStore } from './platform-admin.store'
import {
  TENANT_STATUS_LABELS,
  TenantStatus,
} from './platform-admin.models'
import {
  businessTypeLabel,
  countryName,
  relativeTime,
  statusChipClass,
  statusDotClass,
} from './platform-admin.view-helpers'

@Component({
  selector: 'app-platform-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div>
          <p class="greeting-label">Consola de Administración</p>
          <h1 class="greeting">BarberShop Management System<span class="accent">.</span></h1>
          <p class="subtitle">Panel de control de la plataforma multi-tenant</p>
        </div>
        <button class="primary-button" (click)="store.refresh()" [disabled]="store.loading()">
          <span *ngIf="!store.loading(); else loadingSpinner" class="material-symbols-outlined" style="font-size:16px">sync</span>
          <ng-template #loadingSpinner><span class="material-symbols-outlined" style="font-size:16px;animation:spin 1s linear infinite">sync</span></ng-template>
          {{ store.loading() ? 'Sincronizando...' : 'Actualizar Datos' }}
        </button>
      </div>

      @if (store.error(); as message) {
        <div class="error-banner">
          <span class="material-symbols-outlined">error</span>
          {{ message }}
          <button class="dismiss-btn" (click)="store.clearError()">✕</button>
        </div>
      }

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Negocios Registrados</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">storefront</span></div>
          </div>
          <div class="kpi-value">{{ store.totalNegocios() ?? '—' }}</div>
          <div class="kpi-detail">{{ store.loading() ? 'Cargando...' : (store.offline() ? 'Sin conexión' : store.negocios().length + ' registros') }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Activos</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">check_circle</span></div>
          </div>
          <div class="kpi-value">{{ store.metrics().activeNegocios }}</div>
           <div class="kpi-trend positive">
            {{ ((store.metrics().activeRatio * 100) | number:'1.0-0') }}% activos
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">En Provisioning</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">autorenew</span></div>
          </div>
          <div class="kpi-value">{{ store.metrics().provisioningNegocios }}</div>
          <div class="kpi-detail">Cola de aprovisionamiento activa</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Suspendidos</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">warning</span></div>
          </div>
          <div class="kpi-value">{{ store.metrics().suspendedNegocios }}</div>
          <div class="kpi-trend negative">Requiere atención</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Países</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">public</span></div>
          </div>
          <div class="kpi-value">{{ store.countryDistribution().length }}</div>
          <div class="kpi-detail">Cobertura geográfica</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Último Sync</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">cloud_sync</span></div>
          </div>
          <div class="kpi-value" style="font-size:18px">
            {{ store.lastSyncedAt() ? (store.lastSyncedAt() | date:'HH:mm:ss') : '—' }}
          </div>
          <div class="kpi-detail">{{ store.offline() ? 'API offline' : 'Conectado' }}</div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <div>
              <h3>Distribución por Estado</h3>
              <p>Conteos reales del servidor</p>
            </div>
          </div>
          <div class="card-body">
            @if (store.loading()) {
              <div class="loading">Cargando...</div>
            } @else if (store.totalTenants() === 0 || store.totalTenants() === null) {
              <div class="empty-state">
                <span class="material-symbols-outlined" style="font-size:36px">search_off</span>
                <p>Sin datos de plataforma para graficar.</p>
              </div>
            } @else {
              <div class="status-bars">
                @for (slice of store.statusDistribution(); track slice.status) {
                  <div class="status-bar-row">
                    <div class="status-bar-info">
                      <span class="status-bar-label">{{ slice.label }}</span>
                      <span class="status-bar-count">{{ slice.count }} ({{ (slice.ratio * 100) | number:'1.0-1' }}%)</span>
                    </div>
                    <div class="status-bar-track">
                      <div class="status-bar-fill" [class]="slice.barClass" [style.width.%]="slice.ratio * 100"></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3>Pipeline de Provisioning</h3>
              <p>Tenants en curso</p>
            </div>
            <span class="badge-pending">{{ store.provisioningQueue().length }} activos</span>
          </div>
          <div class="card-body">
            @if (store.provisioningQueue().length === 0) {
              <div class="empty-state">
                <p>No hay aprovisionamientos en curso</p>
              </div>
            } @else {
              <div class="provisioning-list">
                @for (tenant of store.provisioningQueue(); track tenant.id) {
                  <div class="provisioning-item">
                    <div class="provisioning-icon"><span class="material-symbols-outlined">sync</span></div>
                    <div class="provisioning-info">
                      <span class="provisioning-name">{{ tenant.tradeName }}</span>
                      <span class="provisioning-meta">{{ tenant.slug }} · {{ relativeTime(tenant.createdAt) }}</span>
                    </div>
                    <span class="badge-pending">Provisioning</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3>Negocios Recientes</h3>
            <p>Los últimos estudios registrados en la plataforma</p>
          </div>
          <a routerLink="/platform-admin/negocios" class="link-button">Ver todos →</a>
        </div>
        <div class="card-body" style="padding:0">
          @if (store.recentNegocios().length === 0) {
            <div class="empty-state">
              <p>Sin negocios registrados</p>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Negocio</th>
                  <th>Dueño</th>
                  <th>Ubicación</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                @for (negocio of store.recentNegocios(); track negocio.id; let i = $index) {
                  <tr>
                    <td>
                      <div class="tenant-name">
                        <span class="tenant-initial" [class]="i === 0 ? 'primary' : ''">{{ i + 1 }}</span>
                        <div>
                          <span class="tenant-title">{{ negocio.tradeName }}</span>
                          <span class="tenant-slug">{{ negocio.slug }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div *ngIf="negocio.owner; else noOwner" class="tenant-owner">
                        <span class="tenant-owner-name">{{ negocio.owner.name }}</span>
                        <span class="tenant-owner-email">{{ negocio.owner.email }}</span>
                      </div>
                      <ng-template #noOwner><span class="text-pa-on-surface-variant">—</span></ng-template>
                    </td>
                    <td>{{ countryName(negocio.countryCode) }}</td>
                    <td>{{ businessTypeLabel(negocio.businessType) }}</td>
                    <td><span class="status-badge" [class]="statusChipClass(negocio.status)">{{ negocio.status }}</span></td>
                    <td class="date-cell">{{ negocio.createdAt | date:'dd MMM yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard { padding: 32px; max-width: 1400px; margin: 0 auto; font-family: 'Plus Jakarta Sans', sans-serif; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .greeting-label { font-size: 13px; color: #574238; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .greeting { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1b1c1a; margin: 0; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #574238; margin-top: 8px; }
    .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .primary-button:hover { background: #a06028; }
    .primary-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 24px; color: #dc2626; font-size: 14px; }
    .dismiss-btn { margin-left: auto; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 16px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .kpi-label { font-size: 13px; color: #574238; font-weight: 500; }
    .kpi-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 8px; color: #b87333; }
    .kpi-icon .material-symbols-outlined { font-size: 18px; }
    .kpi-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1b1c1a; }
    .kpi-trend { font-size: 12px; margin-top: 4px; font-weight: 500; }
    .kpi-trend.positive { color: #22c55e; }
    .kpi-trend.negative { color: #dc2626; }
    .kpi-detail { font-size: 12px; color: #574238; margin-top: 4px; }
    .content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 16px; color: #1b1c1a; margin: 0 0 4px; }
    .card-header p { font-size: 12px; color: #574238; margin: 0; }
    .card-body { padding: 20px; }
    .link-button { font-size: 13px; color: #b87333; text-decoration: none; font-weight: 500; }
    .link-button:hover { text-decoration: underline; }
    .status-bars { display: flex; flex-direction: column; gap: 16px; }
    .status-bar-row { display: flex; flex-direction: column; gap: 6px; }
    .status-bar-info { display: flex; justify-content: space-between; align-items: center; }
    .status-bar-label { font-size: 13px; color: #1b1c1a; font-weight: 500; }
    .status-bar-count { font-size: 12px; color: #574238; font-family: 'Plus Jakarta Sans', monospace; }
    .status-bar-track { width: 100%; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .status-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
    .badge-pending { font-size: 11px; padding: 4px 10px; border-radius: 20px; background: #fef3c7; color: #92400e; font-weight: 600; }
    .loading { padding: 40px; text-align: center; color: #574238; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; color: #574238; gap: 12px; }
    .empty-state p { font-size: 14px; margin: 0; }
    .provisioning-list { display: flex; flex-direction: column; gap: 12px; }
    .provisioning-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fafaf8; border-radius: 8px; }
    .provisioning-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: #b87333; }
    .provisioning-info { flex: 1; display: flex; flex-direction: column; }
    .provisioning-name { font-size: 13px; font-weight: 500; color: #1b1c1a; }
    .provisioning-meta { font-size: 11px; color: #574238; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #574238; }
    .data-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1b1c1a; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover { background: #fafaf8; }
    .tenant-name { display: flex; align-items: center; gap: 12px; }
    .tenant-initial { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 12px; font-weight: 700; color: white; background: #b87333; }
    .tenant-initial:not(.primary) { background: #e5e7eb; color: #6b7280; }
    .tenant-title { font-weight: 500; color: #1b1c1a; display: block; }
    .tenant-slug { font-size: 11px; color: #574238; font-family: monospace; }
    .status-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
    .date-cell { font-size: 12px; color: #574238; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class PlatformAdminDashboardComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)

  ngOnInit(): void {
    this.store.load()
  }

  relativeTime = relativeTime
  statusChipClass = statusChipClass
  statusDotClass = statusDotClass
  businessTypeLabel = businessTypeLabel
  countryName = countryName
}
