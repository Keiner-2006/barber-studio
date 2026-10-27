import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PlatformAdminApi, CreateTenantInput } from './platform-admin.api';
import { ClientsStore } from './clients/clients.store';
import { PlatformOwner } from './clients/clients.api';

@Component({
  selector: 'app-platform-admin-new-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Nuevo Negocio</p>
          <h1>Agregar Negocio<span class="accent">.</span></h1>
          <p class="subtitle">Registra un nuevo negocio y asígnalo a un dueño existente o crea uno nuevo.</p>
        </div>
        <a routerLink="/platform-admin/negocios" class="back-link">← Volver al Directorio</a>
      </div>

      <div class="form-grid">
        <div class="card">
          <div class="card-header"><h3>Información del Negocio</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label>Nombre Comercial *</label>
              <input [(ngModel)]="form.tradeName" placeholder="Ej: Barbería El Aristocracia" />
            </div>
            <div class="form-group">
              <label>Razón Social *</label>
              <input [(ngModel)]="form.legalName" placeholder="Razón legal del negocio" />
            </div>
            <div class="form-group">
              <label>Slug *</label>
              <input [(ngModel)]="form.slug" placeholder="Ej: el-aristocracia" />
              <small>URL única del negocio. Solo letras, números y guiones.</small>
            </div>
            <div class="form-group">
              <label>Tipo de Negocio</label>
              <select [(ngModel)]="form.businessType">
                <option value="barberia">Barbería</option>
                <option value="peluqueria">Peluquería</option>
                <option value="grooming">Grooming</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Código de País</label>
              <select [(ngModel)]="form.countryCode">
                <option value="CO">CO - Colombia</option>
                <option value="MX">MX - México</option>
                <option value="CL">CL - Chile</option>
                <option value="AR">AR - Argentina</option>
                <option value="PE">PE - Perú</option>
                <option value="US">US - Estados Unidos</option>
                <option value="ES">ES - España</option>
              </select>
            </div>
            <div class="form-group">
              <label>Color de Marca</label>
              <div class="color-input">
                <input type="color" [(ngModel)]="form.primaryColor" />
                <span>{{ form.primaryColor }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Dueño / Cliente *</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label>Seleccionar Dueño Existente</label>
              <select [(ngModel)]="selectedOwnerId" (ngModelChange)="onOwnerChange($event)">
                <option [ngValue]="null">-- Crear nuevo dueño --</option>
                @for (owner of store.owners(); track owner.id) {
                  <option [ngValue]="owner.id">{{ owner.name }} ({{ owner.email }}) - {{ owner.tradeName }}</option>
                }
              </select>
            </div>
            @if (!selectedOwnerId) {
              <div class="form-group">
                <label>Nombre del Dueño *</label>
                <input [(ngModel)]="form.ownerName" placeholder="Nombre completo" />
              </div>
              <div class="form-group">
                <label>Email del Dueño *</label>
                <input type="email" [(ngModel)]="form.email" placeholder="email@ejemplo.com" />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input [(ngModel)]="form.phone" placeholder="+57 300 1234567" />
              </div>
            } @else {
              <div class="info-box">
                <p>Se asignará al negocio al dueño seleccionado.</p>
                <strong>{{ getSelectedOwner()?.name }}</strong>
                <span>{{ getSelectedOwner()?.email }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="button button-light" (click)="onCancel()">Cancelar</button>
        <button class="button button-dark" (click)="onSubmit()" [disabled]="form.loading || !canSubmit()">
          {{ form.loading ? 'Creando...' : 'Crear Negocio' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { padding: 32px; max-width: 1200px; margin: 0 auto; font-family: 'Plus Jakarta Sans', sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1b1c1a; margin: 0; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .back-link { font-size: 14px; color: #b87333; text-decoration: none; display: flex; align-items: center; }
    .back-link:hover { text-decoration: underline; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-header { padding: 20px; border-bottom: 1px solid #e5e7eb; background: #fafaf8; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 18px; color: #1b1c1a; margin: 0; }
    .card-body { padding: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #b87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-group small { display: block; font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .color-input { display: flex; align-items: center; gap: 12px; }
    .color-input input[type="color"] { width: 40px; height: 40px; border: none; cursor: pointer; }
    .info-box { padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; }
    .info-box p { margin: 0 0 8px; font-size: 14px; color: #166534; }
    .info-box strong { display: block; font-size: 16px; }
    .info-box span { font-size: 13px; color: #6b7280; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; }
    .button { padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; }
    .button-dark { background: #1b1c1a; color: white; }
    .button-dark:hover:not(:disabled) { background: #374151; }
    .button-dark:disabled { opacity: 0.5; cursor: not-allowed; }
    .button-light { background: #f3f4f6; color: #374151; }
    .button-light:hover { background: #e5e7eb; }
  `]
})
export class PlatformAdminNewTenantComponent implements OnInit {
  private api = inject(PlatformAdminApi)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  readonly store = inject(ClientsStore)

  form = {
    tradeName: '',
    legalName: '',
    slug: '',
    businessType: 'barberia' as const,
    countryCode: 'CO',
    email: '',
    ownerName: '',
    phone: '',
    primaryColor: '#b87333',
    loading: false,
  }
  selectedOwnerId: string | null = null

  canSubmit(): boolean {
    return this.form.tradeName.length > 0 &&
      this.form.legalName.length > 0 &&
      this.form.slug.length > 0 &&
      (this.selectedOwnerId !== null || (this.form.ownerName.length > 0 && this.form.email.length > 0))
  }

  ngOnInit(): void {
    this.store.load()
  }

  onOwnerChange(ownerId: string | null): void {
    this.selectedOwnerId = ownerId
  }

  getSelectedOwner() {
    return this.store.owners().find(o => o.id === this.selectedOwnerId)
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    this.form.loading = true
    const input: CreateTenantInput = {
      legalName: this.form.legalName,
      tradeName: this.form.tradeName,
      slug: this.form.slug,
      businessType: this.form.businessType,
      email: this.form.email,
      ownerName: this.form.ownerName,
      phone: this.form.phone || undefined,
      countryCode: this.form.countryCode,
      primaryColor: this.form.primaryColor,
    }
    this.api.createTenant(input).pipe(
      catchError(() => { this.form.loading = false; return of(null); })
    ).subscribe({
      next: () => {
        this.router.navigate(['/platform-admin/negocios'])
      },
      error: () => { this.form.loading = false; }
    })
  }

  onCancel(): void {
    this.router.navigate(['/platform-admin/negocios'])
  }
}
