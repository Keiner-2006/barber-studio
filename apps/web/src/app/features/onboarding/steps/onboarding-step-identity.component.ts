import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'
import { OnboardingApi } from '../onboarding.api'
import { BusinessType } from '../onboarding.models'

@Component({
  selector: 'app-onboarding-step-identity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-icons text-sm">badge</span>
          Paso 2 de {{ store.totalSteps }} · Datos Fundamentales
        </span>
        <h2>Configura la identidad de tu barbería o estudio</h2>
        <p>Tu atelier operará bajo una base de datos aislada con URL pública personalizada e indexación SEO local inmediata.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="tradeName">
              Nombre Comercial del Atelier
              <span class="required">Requerido</span>
            </label>
            <div class="input-wrap">
              <span class="material-icons">storefront</span>
              <input
                id="tradeName"
                [(ngModel)]="business().tradeName"
                name="tradeName"
                placeholder="Ej. Valhalla Barber Club"
                required
              />
            </div>
            <span class="hint">Aparecerá en el portal de reservas públicas para tus clientes.</span>
          </div>

          <div class="form-group">
            <label for="legalName">
              Razón Social / Registro DIAN
              <span class="optional">Facturación</span>
            </label>
            <div class="input-wrap">
              <span class="material-icons">receipt_long</span>
              <input
                id="legalName"
                [(ngModel)]="business().legalName"
                name="legalName"
                placeholder="Ej. Inversiones Valhalla S.A.S."
              />
            </div>
            <span class="hint">Para emisión de comprobantes fiscales y configuración de facturas.</span>
          </div>
        </div>

        <div class="form-group slug-group">
          <label for="slug">
            <span class="material-icons text-sm">link</span>
            Slug de Subdominio Exclusivo
          </label>
          <div class="input-wrap slug-input">
            <div class="slug-prefix">
              <span class="material-icons text-sm">dns</span>
              https://navajastudio.com/
            </div>
            <input
              id="slug"
              [(ngModel)]="business().slug"
              name="slug"
              placeholder="nombre-estudio"
              required
            />
            <span class="slug-status" *ngIf="business().slug">
              <span class="material-icons text-xs">check_circle</span>
              Disponible
            </span>
          </div>
          <div class="slug-info">
            <span>Solo letras minúsculas, números y guiones. Sin espacios ni tildes.</span>
            <span class="ssl">SSL HTTPS Automático</span>
          </div>
        </div>

        <div class="form-group">
          <label>Tipo de Negocio & Enfoque Operativo</label>
          <div class="business-types">
            @for (type of businessTypes; track type.value) {
              <div
                class="type-card"
                [class.selected]="business().businessType === type.value"
                (click)="selectBusinessType(type.value)"
              >
                <span class="material-icons">{{ type.icon }}</span>
                <span class="type-title">{{ type.label }}</span>
                <span class="type-desc">{{ type.description }}</span>
              </div>
            }
          </div>
        </div>

        <div class="form-group">
          <label>Rol Principal en la Plataforma</label>
          <div class="role-pills">
            @for (role of roles; track role) {
              <button
                type="button"
                class="role-pill"
                [class.active]="selectedRole === role"
                (click)="selectedRole = role"
              >
                {{ role }}
              </button>
            }
          </div>
        </div>

        <div class="form-group">
          <label for="bio">
            Descripción y Manifiesto de Marca
            <span class="char-count">{{ business().description.length }} / 320</span>
          </label>
          <textarea
            id="bio"
            [(ngModel)]="business().description"
            name="bio"
            placeholder="Describe el estilo, la experiencia y los pilares de tu barbería..."
            rows="3"
            maxlength="320"
          ></textarea>
          <span class="hint">Se mostrará en la cabecera de tu página pública y resúmenes de Google Business.</span>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .step-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 3px 20px #4a2e1b0d; }
    .step-header { margin-bottom: 28px; }
    .step-badge { display: inline-flex; align-items: center; gap: 6px; color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
    .step-header h2 { color: #412311; font: 700 28px/1.1 'Vollkorn', serif; margin: 8px 0; }
    .step-header p { color: #50443e; font-size: 14px; margin: 0; }
    .step-form { display: flex; flex-direction: column; gap: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { color: #412311; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; justify-content: space-between; }
    .required { color: #944928; font-size: 10px; font-weight: 600; }
    .optional { color: #50443e; font-size: 10px; font-weight: 400; }
    .input-wrap { display: flex; align-items: center; position: relative; }
    .input-wrap .material-icons { position: absolute; left: 12px; color: #50443e; font-size: 18px; }
    .input-wrap input { width: 100%; padding: 12px 14px 12px 38px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .input-wrap input:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .hint { font-size: 11px; color: #50443e; }
    .slug-group { background: #f5f0e8; border-radius: 8px; padding: 16px; }
    .slug-input { background: white; border: 1px solid #e6e2d9; border-radius: 8px; overflow: hidden; }
    .slug-input .material-icons { position: static; margin: 0; }
    .slug-prefix { display: flex; align-items: center; gap: 6px; background: #f5f0e8; padding: 12px; font-size: 13px; color: #50443e; white-space: nowrap; border-right: 1px solid #e6e2d9; }
    .slug-input input { flex: 1; padding: 12px; border: none; font-size: 14px; font-weight: 700; color: #944928; }
    .slug-input input:focus { outline: none; box-shadow: none; }
    .slug-status { display: flex; align-items: center; gap: 4px; color: #4D7C5D; font-size: 12px; font-weight: 600; padding-right: 12px; white-space: nowrap; }
    .slug-info { display: flex; justify-content: space-between; font-size: 11px; color: #50443e; }
    .ssl { color: #944928; font-weight: 600; }
    .business-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .type-card { display: flex; flex-direction: column; gap: 6px; padding: 16px; border-radius: 8px; background: #f5f0e8; cursor: pointer; transition: all .2s; border: 2px solid transparent; }
    .type-card:hover { background: #e6e2d9; }
    .type-card.selected { border-color: #944928; background: #fdf9f0; }
    .type-card .material-icons { color: #944928; font-size: 24px; }
    .type-title { font-weight: 700; color: #412311; font-size: 14px; }
    .type-desc { font-size: 11px; color: #50443e; }
    .role-pills { display: flex; flex-wrap: wrap; gap: 8px; }
    .role-pill { padding: 8px 16px; border-radius: 999px; border: 1px solid #e6e2d9; background: white; color: #50443e; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .2s; }
    .role-pill.active { background: #944928; color: white; border-color: #944928; font-weight: 600; }
    .role-pill:hover:not(.active) { border-color: #944928; color: #412311; }
    textarea { width: 100%; padding: 12px 14px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; resize: none; box-sizing: border-box; }
    textarea:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .char-count { font-size: 11px; color: #50443e; font-weight: 400; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .business-types { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .business-types { grid-template-columns: 1fr; } }
  `],
})
export class OnboardingStepIdentityComponent {
  businessTypes = [
    { value: 'barberia' as BusinessType, icon: 'content_cut', label: 'Barbería Clásica', description: 'Cortes tradicionales, toalla caliente y navaja libre.' },
    { value: 'peluqueria' as BusinessType, icon: 'auto_fix_high', label: 'Peluquería & Salón', description: 'Estilistas, colorimetría, visagismo y lavado premium.' },
    { value: 'grooming' as BusinessType, icon: 'spa', label: 'Grooming & Spa', description: 'Cuidado facial, manicura ejecutiva, masajes capilares.' },
    { value: 'otro' as BusinessType, icon: 'workspace_premium', label: 'Estudio Boutique', description: 'Atención 1 a 1 por cita privada con barra lounge.' },
  ]

  roles = ['Propietario / Dueño', 'Gerente General', 'Master Barber & Fundador', 'Administrador de Sede']
  selectedRole = 'Propietario / Dueño'

  constructor(
    public store: OnboardingStore,
    private api: OnboardingApi,
  ) {}

  business() { return this.store.business() }
  location() { return this.store.location() }

  selectBusinessType(type: BusinessType): void {
    this.store.updateBusiness({ businessType: type })
  }

  onContinue(): void {
    if (!this.store.business().tradeName || !this.store.business().slug) return
    this.store.nextStep()
  }
}
