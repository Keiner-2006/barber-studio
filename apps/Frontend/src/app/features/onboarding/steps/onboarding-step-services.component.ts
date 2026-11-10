import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'
import { ONB_STYLES } from '../onboarding.ui'

@Component({
  selector: 'app-onboarding-step-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
          Paso 4 de {{ store.totalSteps }} · Horario y servicios
        </span>
        <h2>Tu horario y tus primeros servicios</h2>
        <p>Los usaremos para crear tu sede y tu catálogo. Podrás cambiarlos cuando quieras desde el panel.</p>
      </div>

      <div class="step-form">
        <div class="info-card">
          <div class="info-card-header">
            <span class="title">Horario de atención</span>
            <span class="badge">Hora de Colombia (GMT-5)</span>
          </div>
          <div class="schedule-list">
            @for (s of store.schedule().schedules; track s.days) {
              <div class="schedule-row">
                <label class="day-label">
                  <input type="checkbox" [(ngModel)]="s.active" [attr.aria-label]="'Atender ' + s.days" />
                  <span [class]="s.active ? 'active-day' : 'inactive-day'">{{ s.days }}</span>
                </label>
                <div class="time-range" *ngIf="s.active">
                  <input type="time" [(ngModel)]="s.open" class="time-input" [attr.aria-label]="'Apertura ' + s.days" />
                  <span class="separator">a</span>
                  <input type="time" [(ngModel)]="s.close" class="time-input" [attr.aria-label]="'Cierre ' + s.days" />
                </div>
                <span class="tag" [class.active-tag]="s.active">
                  {{ s.active ? 'Abierto' : 'Cerrado' }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="services-section">
          <div class="services-header">
            <span class="title">Servicios iniciales</span>
            <span class="badge">{{ selectedCount }} seleccionados · {{ currencyCode }}</span>
          </div>
          <span class="price-hint">Marca los que ofreces y ajusta el precio.</span>
          <div class="services-list">
            @for (service of store.schedule().services; track service.id) {
              <div class="service-row" [class.on]="service.selected">
                <div class="service-info">
                  <div class="service-icon">
                    <span class="material-symbols-outlined" aria-hidden="true">{{ getServiceIcon(service.name) }}</span>
                  </div>
                  <div class="service-details">
                    <span class="service-name">{{ service.name }}</span>
                    <span class="service-desc">{{ service.description }}</span>
                  </div>
                </div>
                <div class="service-actions">
                  <label class="price-field">
                    <span>Precio {{ currencyCode }}</span>
                    <input type="number" min="0" step="100" [(ngModel)]="service.price" [name]="'price-' + service.id" [attr.aria-label]="'Precio de ' + service.name" />
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="service.selected" [attr.aria-label]="'Ofrecer ' + service.name" /> Ofrezco
                  </label>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [ONB_STYLES, `
    .info-card { background: var(--paper); border-radius: 18px; padding: 18px; }
    .info-card-header, .services-header { align-items: center; display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; margin-bottom: 12px; }
    .title { color: var(--ink); font: 600 20px 'Vollkorn', serif; }
    .badge { background: #fff; border-radius: 999px; color: var(--muted); font-size: 13px; font-weight: 600; padding: 4px 10px; }
    .schedule-list, .services-list { display: flex; flex-direction: column; gap: 8px; }
    .schedule-row { align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 14px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; padding: 10px 14px; }
    .day-label { align-items: center; cursor: pointer; display: flex; font-size: 15px; gap: 10px; min-width: 190px; }
    .active-day { color: var(--ink); font-weight: 700; }
    .inactive-day { color: var(--muted-2); }
    .time-range { align-items: center; display: flex; gap: 8px; }
    .time-input { border: 1.5px solid var(--line); border-radius: 10px; color: var(--ink); font: 600 15px 'Plus Jakarta Sans', sans-serif; font-variant-numeric: tabular-nums; min-height: 42px; padding: 0 10px; }
    .time-input:focus { border-color: #c4703f; box-shadow: 0 0 0 3px rgba(196,112,63,.15); outline: none; }
    .separator { color: var(--muted); font-size: 14px; }
    .tag { background: #f1f0ee; border-radius: 999px; color: #4f4a44; font-size: 12px; font-weight: 700; padding: 4px 10px; }
    .active-tag { background: #e5f4ec; color: var(--green); }
    .services-section { display: flex; flex-direction: column; gap: 10px; }
    .price-hint { color: var(--muted-2); font-size: 13px; }
    .service-row { align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 16px; display: flex; gap: 14px; justify-content: space-between; padding: 14px; transition: border-color .2s, background .2s; }
    .service-row.on { background: #fffaf5; border-color: #ecc3a6; }
    .service-info { align-items: center; display: flex; gap: 12px; min-width: 0; }
    .service-icon { align-items: center; background: var(--copper-soft); border-radius: 12px; color: #8c4029; display: flex; flex: none; height: 44px; justify-content: center; width: 44px; }
    .service-details { display: flex; flex-direction: column; min-width: 0; }
    .service-name { color: var(--ink); font-size: 15px; font-weight: 700; }
    .service-desc { color: var(--muted); font-size: 13px; }
    .service-actions { align-items: center; display: flex; flex: none; gap: 14px; }
    .price-field { color: var(--muted); display: flex; flex-direction: column; font-size: 12px; font-weight: 700; gap: 4px; }
    .price-field input { border: 1.5px solid var(--line); border-radius: 10px; color: var(--ink); font: 700 15px 'Plus Jakarta Sans', sans-serif; font-variant-numeric: tabular-nums; min-height: 42px; padding: 0 10px; width: 140px; }
    .price-field input:focus { border-color: #c4703f; box-shadow: 0 0 0 3px rgba(196,112,63,.15); outline: none; }
    .checkbox-label { align-items: center; cursor: pointer; display: flex; font-size: 13px; font-weight: 700; gap: 6px; }
    @media (max-width: 720px) { .service-row { align-items: flex-start; flex-direction: column; } }
  `],
})
export class OnboardingStepServicesComponent {
  constructor(public store: OnboardingStore) {}

  get currencyCode(): string {
    const currencies: Record<string, string> = {
      CO: 'COP',
      MX: 'MXN',
      AR: 'ARS',
      CL: 'CLP',
      PE: 'PEN',
      US: 'USD',
      ES: 'EUR',
    }
    return currencies[this.store.business().countryCode] || 'COP'
  }

  get selectedCount(): number {
    return this.store.schedule().services.filter((s) => s.selected).length
  }

  getServiceIcon(name: string): string {
    if (name.includes('Corte') || name.includes('Fade')) return 'content_cut'
    if (name.includes('Barba')) return 'face'
    if (name.includes('Combo')) return 'workspace_premium'
    return 'self_improvement'
  }
}
