import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SettingsStore } from './settings.store'
import {
  FullBranch,
  StaffMember,
  CreateBranch,
} from './settings.models'

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Configuración</p>
          <h1>Ajustes<span class="accent">.</span></h1>
          <p class="subtitle">Administra sucursales, personal y preferencias de tu barbería.</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="tab() === 'tenant'" (click)="setTab('tenant')">Preferencias</button>
        <button class="tab" [class.active]="tab() === 'branches'" (click)="setTab('branches')">Sucursales</button>
        <button class="tab" [class.active]="tab() === 'staff'" (click)="setTab('staff')">Personal</button>
      </div>

      <div class="tab-content">
        @if (tab() === 'tenant') {
          <div class="card">
            <div class="card-header">
              <h3>Información del estudio</h3>
            </div>
            <div class="card-body">
              @if (store.loading()) {
                <div class="loading-rows">
                  <div class="loading-row"></div>
                  <div class="loading-row"></div>
                  <div class="loading-row"></div>
                </div>
              } @else if (store.tenant()) {
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">{{ store.tenant()?.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Slug</span>
                    <span class="info-value">{{ store.tenant()?.slug }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Moneda</span>
                    <span class="info-value">{{ store.tenant()?.currencyCode }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">País</span>
                    <span class="info-value">{{ store.tenant()?.countryCode }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Zona horaria</span>
                    <span class="info-value">{{ store.tenant()?.timezone }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (tab() === 'branches') {
          <div class="card">
            <div class="card-header">
              <h3>Sucursales</h3>
              <button class="primary-button" (click)="openBranchDialog()">+ Nueva sucursal</button>
            </div>
            <div class="card-body">
              @if (store.loading()) {
                <div class="loading-rows">
                  <div class="loading-row"></div>
                  <div class="loading-row"></div>
                </div>
              } @else if (store.branches().length === 0) {
                <p class="empty">No hay sucursales registradas</p>
              } @else {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Ciudad</th>
                      <th>Teléfono</th>
                      <th>Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (b of store.branches(); track b.id) {
                      <tr>
                        <td><code>{{ b.code }}</code></td>
                        <td>{{ b.name }}</td>
                        <td>{{ b.city || '—' }}</td>
                        <td>{{ b.phone || '—' }}</td>
                        <td>
                          <span class="badge" [class.active]="b.status === 'active'">{{ b.status }}</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>
        }

        @if (tab() === 'staff') {
          <div class="card">
            <div class="card-header">
              <h3>Personal</h3>
            </div>
            <div class="card-body">
              @if (store.loading()) {
                <div class="loading-rows">
                  <div class="loading-row"></div>
                  <div class="loading-row"></div>
                </div>
              } @else if (store.staff().length === 0) {
                <p class="empty">No hay personal registrado</p>
              } @else {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Comisión</th>
                      <th>Reservable</th>
                      <th>Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of store.staff(); track s.id) {
                      <tr>
                        <td>{{ s.displayName }}</td>
                        <td>{{ s.userEmail || '—' }}</td>
                        <td>{{ s.commissionRate }}%</td>
                        <td>{{ s.isBookable ? 'Sí' : 'No' }}</td>
                        <td>
                          <span class="badge" [class.active]="s.status === 'active'">{{ s.status }}</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>
        }
      </div>

      @if (showBranchDialog()) {
        <div class="dialog-backdrop" (click)="closeBranchDialog()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <h3>Nueva sucursal</h3>
            <div class="form-group">
              <label>Código</label>
              <input [(ngModel)]="newBranch().code" placeholder="Ej. SUC-002" />
            </div>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="newBranch().name" placeholder="Nombre de la sucursal" />
            </div>
            <div class="form-group">
              <label>Ciudad</label>
              <input [(ngModel)]="newBranch().city" placeholder="Ciudad" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input [(ngModel)]="newBranch().phone" placeholder="Teléfono" />
            </div>
            <div class="form-group">
              <label>Dirección</label>
              <input [(ngModel)]="newBranch().address" placeholder="Dirección" />
            </div>
            <div class="form-group">
              <label>País</label>
              <input [(ngModel)]="newBranch().country" placeholder="MX" />
            </div>
            <div class="dialog-actions">
              <button class="secondary-button" (click)="closeBranchDialog()">Cancelar</button>
              <button class="primary-button" (click)="createBranch()" [disabled]="store.saving()">Guardar</button>
            </div>
          </div>
        </div>
      }
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
    .tab { padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 14px; color: #6b7280; }
    .tab.active { color: #b87333; border-bottom-color: #b87333; font-weight: 500; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 16px; color: #2d2d2d; }
    .card-body { padding: 20px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .data-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table code { font-family: 'Fira Code', monospace; font-size: 12px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .info-value { font-size: 14px; color: #2d2d2d; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; text-transform: capitalize; background: #f3f4f6; color: #6b7280; }
    .badge.active { background: #dcfce7; color: #166534; }
    .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .primary-button:hover { transform: translateY(-1px); }
    .primary-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .secondary-button { padding: 12px 20px; background: transparent; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .loading-rows { display: flex; flex-direction: column; gap: 12px; }
    .loading-row { height: 40px; background: #f3f4f6; border-radius: 4px; }
    .loading-rows .loading-row:last-child { margin-bottom: 0; }
    .empty { padding: 32px; text-align: center; color: #6b7280; }
    .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .dialog { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 420px; }
    .dialog h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; margin-top: 0; margin-bottom: 16px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
    .form-group input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
    .form-group input:focus { border-color: #b87333; outline: none; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
  `]
})
export class SettingsComponent implements OnInit {
  tab = signal<'tenant' | 'branches' | 'staff'>('tenant')
  showBranchDialog = signal(false)
  newBranch = signal<CreateBranch>({ code: '', name: '' })

  constructor(private store: SettingsStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  setTab(tab: 'tenant' | 'branches' | 'staff'): void {
    this.tab.set(tab)
  }

  openBranchDialog(): void {
    this.newBranch.set({ code: '', name: '', city: '', phone: '', address: '', country: '' })
    this.showBranchDialog.set(true)
  }

  closeBranchDialog(): void {
    this.showBranchDialog.set(false)
  }

  createBranch(): void {
    const branch = this.newBranch()
    if (!branch.code || !branch.name) return
    this.store.createBranch(branch)
    this.closeBranchDialog()
  }
}
