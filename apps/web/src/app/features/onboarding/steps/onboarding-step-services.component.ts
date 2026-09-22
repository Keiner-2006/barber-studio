import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'

@Component({
  selector: 'app-onboarding-step-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-icons text-sm">schedule</span>
          Paso 4 de {{ store.totalSteps }} · Catálogo & Disponibilidad
        </span>
        <h2>Horarios Semanales y Catálogo Inicial</h2>
        <p>Establece las franjas de operación para tus sillas de barbero y tus servicios insignia cotizados en Pesos Colombianos (COP).</p>
      </div>

      <div class="step-form">
        <div class="info-card">
          <div class="info-card-header">
            <span class="title">Jornada Regular de Atención</span>
            <span class="badge">Horario Colombia (GMT-5)</span>
          </div>
          <div class="schedule-list">
            @for (s of store.schedule().schedules; track s.days) {
              <div class="schedule-row">
                <label class="day-label">
                  <input type="checkbox" [(ngModel)]="s.active" />
                  <span [class]="s.active ? 'active-day' : 'inactive-day'">{{ s.days }}</span>
                </label>
                <div class="time-range" *ngIf="s.active">
                  <input type="time" [(ngModel)]="s.open" class="time-input" />
                  <span class="separator">a</span>
                  <input type="time" [(ngModel)]="s.close" class="time-input" />
                </div>
                <span class="tag" [class.active-tag]="s.active">
                  {{ s.active ? 'Activo' : 'Desactivado' }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="services-section">
          <div class="services-header">
            <span class="title">Servicios Preconfigurados (COP $)</span>
            <button class="add-btn" type="button">
              <span class="material-icons text-sm">add_circle</span>
              Añadir Otro Servicio
            </button>
          </div>
          <div class="services-list">
            @for (service of store.schedule().services; track service.id) {
              <div class="service-row">
                <div class="service-info">
                  <div class="service-icon">
                    <span class="material-icons">{{ getServiceIcon(service.name) }}</span>
                  </div>
                  <div class="service-details">
                    <span class="service-name">{{ service.name }}</span>
                    <span class="service-desc">{{ service.description }}</span>
                  </div>
                </div>
                <div class="service-actions">
                  <span class="price">&#36;{{ service.price | number }} COP</span>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="service.selected" />
                  </label>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .step-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 3px 20px #4a2e1b0d; }
    .step-header { margin-bottom: 28px; }
    .step-badge { display: inline-flex; align-items: center; gap: 6px; color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
    .step-header h2 { color: #412311; font: 700 28px/1.1 'Vollkorn', serif; margin: 8px 0; }
    .step-header p { color: #50443e; font-size: 14px; margin: 0; }
    .step-form { display: flex; flex-direction: column; gap: 24px; }
    .info-card { background: #f5f0e8; border-radius: 8px; padding: 20px; }
    .info-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .info-card-header .title { font-weight: 700; color: #412311; font-size: 16px; }
    .badge { font-size: 11px; color: #944928; text-transform: uppercase; font-weight: 700; letter-spacing: .05em; }
    .schedule-list { display: flex; flex-direction: column; gap: 8px; }
    .schedule-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 6px; background: white; gap: 12px; flex-wrap: wrap; }
    .day-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; }
    .day-label input { width: 18px; height: 18px; accent-color: #944928; cursor: pointer; }
    .active-day { color: #412311; font-weight: 600; }
    .inactive-day { color: #50443e; }
    .time-range { display: flex; align-items: center; gap: 8px; }
    .time-input { padding: 6px 10px; border: 1px solid #e6e2d9; border-radius: 6px; font-size: 13px; color: #412311; font-family: 'Fira Code', monospace; }
    .time-input:focus { outline: none; border-color: #944928; }
    .separator { color: #50443e; font-size: 12px; }
    .tag { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #f3f4f6; color: #6b7280; }
    .active-tag { background: #dcfce7; color: #166534; }
    .services-section { display: flex; flex-direction: column; gap: 12px; }
    .services-header { display: flex; justify-content: space-between; align-items: center; }
    .services-header .title { font-weight: 700; color: #412311; font-size: 16px; }
    .add-btn { display: flex; align-items: center; gap: 4px; background: none; border: none; color: #944928; font-size: 13px; font-weight: 600; cursor: pointer; }
    .add-btn:hover { color: #412311; }
    .services-list { display: flex; flex-direction: column; gap: 10px; }
    .service-row { display: flex; justify-content: space-between; align-items: center; padding: 14px; border-radius: 8px; background: #f5f0e8; gap: 12px; }
    .service-info { display: flex; align-items: center; gap: 12px; }
    .service-icon { width: 40px; height: 40px; border-radius: 8px; background: white; display: flex; align-items: center; justify-content: center; color: #944928; }
    .service-details { display: flex; flex-direction: column; }
    .service-name { font-weight: 600; color: #412311; font-size: 14px; }
    .service-desc { font-size: 11px; color: #50443e; }
    .service-actions { display: flex; align-items: center; gap: 16px; }
    .price { font-weight: 700; color: #944928; font-family: 'Fira Code', monospace; font-size: 14px; white-space: nowrap; }
    .checkbox-label input { width: 18px; height: 18px; accent-color: #944928; cursor: pointer; }
    @media (max-width: 768px) { .service-row { flex-direction: column; align-items: flex-start; } }
  `],
})
export class OnboardingStepServicesComponent {
  constructor(public store: OnboardingStore) {}

  getServiceIcon(name: string): string {
    if (name.includes('Corte') || name.includes('Fade')) return 'content_cut'
    if (name.includes('Barba')) return 'face'
    if (name.includes('Combo')) return 'workspace_premium'
    return 'beauty_rest'
  }
}
