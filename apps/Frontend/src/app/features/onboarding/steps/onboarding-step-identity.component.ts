import { Component, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'
import { OnboardingApi } from '../onboarding.api'
import { BusinessType } from '../onboarding.models'
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-onboarding-step-identity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-symbols-outlined text-sm">badge</span>
          Paso 2 de {{ store.totalSteps }} · Datos Fundamentales
        </span>
        <h2>Configura la identidad de tu barbería o estudio</h2>
        <p>Elige cómo se verá tu negocio y personaliza el enlace de tu perfil público.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form">
    <div class="form-grid">
          <div class="form-group">
            <label for="tradeName">
              Nombre Comercial del Atelier
              <span class="required">Requerido</span>
            </label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">storefront</span>
              <input
                id="tradeName"
                [(ngModel)]="business().tradeName"
                (ngModelChange)="onTradeNameChange($event)"
                name="tradeName"
                placeholder="Ej. Valhalla Barber Club"
                required
              />
            </div>
            <span class="hint">Aparecerá en tu perfil público para que tus clientes identifiquen tu negocio.</span>
          </div>

          <div class="form-group">
            <label for="legalName">
              Razón Social / Registro DIAN
              <span class="optional">Opcional</span>
            </label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">receipt_long</span>
              <input
                id="legalName"
                [(ngModel)]="business().legalName"
                name="legalName"
                placeholder="Ej. Inversiones Valhalla S.A.S."
              />
            </div>
            <span class="hint">Puedes agregarla después desde la configuración del negocio.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="countryCode">
            País de Operación
            <span class="required">Requerido</span>
          </label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">public</span>
            <select
              id="countryCode"
              [(ngModel)]="business().countryCode"
              name="countryCode"
              required
            >
              @for (country of countries; track country.code) {
                <option [value]="country.code">{{ country.flag }} {{ country.name }}</option>
              }
            </select>
          </div>
          <span class="hint">Afecta la moneda, zona horaria y configuración fiscal por defecto.</span>
        </div>

        <div class="form-group slug-group">
          <label for="slug">
            <span class="material-symbols-outlined text-sm">link</span>
            Enlace público de tu negocio
          </label>
          <div class="input-wrap slug-input">
            <div class="slug-prefix">
              {{ publicUrlPrefix }}
            </div>
            <input
              id="slug"
              [(ngModel)]="business().slug"
              (ngModelChange)="onSlugChange($event)"
              name="slug"
              placeholder="nombre-estudio"
              required
              maxlength="50"
              autocomplete="off"
              aria-describedby="slug-info slug-status"
            />
            <span class="slug-status" id="slug-status" [class.slug-error]="store.slugAvailability() === 'taken' || store.slugAvailability() === 'invalid' || store.slugAvailability() === 'error'" *ngIf="business().slug">
              <span class="material-symbols-outlined text-xs">
                {{ store.slugAvailability() === 'available' ? 'check_circle' : store.slugAvailability() === 'checking' ? 'sync' : store.slugAvailability() === 'taken' || store.slugAvailability() === 'invalid' || store.slugAvailability() === 'error' ? 'error' : 'info' }}
              </span>
              {{ slugStatusText }}
            </span>
          </div>
          <div class="slug-info" id="slug-info">
            <span>Se sugiere desde el nombre y puedes editarlo. Usa letras, números y guiones.</span>
          </div>
          <div *ngIf="store.slugAvailability() === 'available'" class="slug-preview">
            {{ publicUrl }} · Se activará al crear tu negocio.
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
                <span class="material-symbols-outlined">{{ type.icon }}</span>
                <span class="type-title">{{ type.label }}</span>
                <span class="type-desc">{{ type.description }}</span>
              </div>
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
    .input-wrap .material-symbols-outlined { position: absolute; left: 12px; color: #50443e; font-size: 18px; user-select: none; }
    .input-wrap input { width: 100%; padding: 12px 14px 12px 38px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .input-wrap input:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .hint { font-size: 11px; color: #50443e; }
    .slug-group { background: #f5f0e8; border-radius: 8px; padding: 16px; }
    .slug-input { background: white; border: 1px solid #e6e2d9; border-radius: 8px; overflow: hidden; }
    .slug-input .material-symbols-outlined { position: static; margin: 0; }
    .slug-prefix { display: flex; align-items: center; gap: 6px; background: #f5f0e8; padding: 12px; font-size: 13px; color: #50443e; white-space: nowrap; border-right: 1px solid #e6e2d9; }
    .slug-input input { flex: 1; padding: 12px; border: none; font-size: 14px; font-weight: 700; color: #944928; }
    .slug-input input:focus { outline: none; box-shadow: none; }
    .slug-status { display: flex; align-items: center; gap: 4px; color: #4D7C5D; font-size: 12px; font-weight: 600; padding-right: 12px; white-space: nowrap; }
    .slug-status.slug-error { color: #b42318; }
    .slug-info { display: flex; justify-content: space-between; font-size: 11px; color: #50443e; }
    .slug-preview { color: #944928; font-size: 12px; font-weight: 600; overflow-wrap: anywhere; }
    .business-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .type-card { display: flex; flex-direction: column; gap: 6px; padding: 16px; border-radius: 8px; background: #f5f0e8; cursor: pointer; transition: all .2s; border: 2px solid transparent; }
    .type-card:hover { background: #e6e2d9; }
    .type-card.selected { border-color: #944928; background: #fdf9f0; }
    .type-card .material-symbols-outlined { color: #944928; font-size: 24px; }
    .type-title { font-weight: 700; color: #412311; font-size: 14px; }
    .type-desc { font-size: 11px; color: #50443e; }
    textarea { width: 100%; padding: 12px 14px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; resize: none; box-sizing: border-box; }
    textarea:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .char-count { font-size: 11px; color: #50443e; font-weight: 400; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .business-types { grid-template-columns: 1fr 1fr; } }
    .input-wrap select {
      width: 100%;
      padding: 12px 14px 12px 38px;
      border: 1px solid #e6e2d9;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      box-sizing: border-box;
      appearance: none;
    }
    .input-wrap select:focus {
      outline: none;
      border-color: #944928;
      box-shadow: 0 0 0 3px #94492822;
    }
    @media (max-width: 480px) { .business-types { grid-template-columns: 1fr; } }
  `],
})
export class OnboardingStepIdentityComponent implements OnDestroy {
  private slugCheckTimer?: ReturnType<typeof setTimeout>
  readonly publicUrlPrefix = `${environment.frontendUrl.replace(/\/$/, '')}/b/`

  businessTypes = [
    { value: 'barberia' as BusinessType, icon: 'content_cut', label: 'Barbería Clásica', description: 'Cortes tradicionales, toalla caliente y navaja libre.' },
    { value: 'peluqueria' as BusinessType, icon: 'auto_fix_high', label: 'Peluquería & Salón', description: 'Estilistas, colorimetría, visagismo y lavado premium.' },
    { value: 'grooming' as BusinessType, icon: 'spa', label: 'Grooming & Spa', description: 'Cuidado facial, manicura ejecutiva, masajes capilares.' },
    { value: 'otro' as BusinessType, icon: 'workspace_premium', label: 'Estudio Boutique', description: 'Atención 1 a 1 por cita privada con barra lounge.' },
  ]

  countries = [
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
  ]

  constructor(
    public store: OnboardingStore,
    private api: OnboardingApi,
  ) {}

  ngOnDestroy(): void {
    if (this.slugCheckTimer) clearTimeout(this.slugCheckTimer)
  }

  business() { return this.store.business() }
  location() { return this.store.location() }

  get publicUrl(): string {
    return `${this.publicUrlPrefix}${this.business().slug}`
  }

  get slugStatusText(): string {
    const labels = {
      idle: 'Escribe un enlace',
      checking: 'Comprobando...',
      available: 'Disponible',
      taken: 'No disponible',
      invalid: 'Formato no válido',
      error: 'No se pudo comprobar',
    } as const
    return labels[this.store.slugAvailability()]
  }

  onTradeNameChange(value: string): void {
    if (this.store.slugManuallyEdited()) return
    this.updateSlug(this.slugify(value))
  }

  onSlugChange(value: string): void {
    this.store.setSlugManuallyEdited(true)
    this.updateSlug(this.slugify(value))
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)
      .replace(/-+$/g, '')
  }

  private updateSlug(slug: string): void {
    this.store.updateBusiness({ slug })
    if (this.slugCheckTimer) clearTimeout(this.slugCheckTimer)
    if (!slug) {
      this.store.setSlugAvailability('idle')
      return
    }
    if (slug.length < 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      this.store.setSlugAvailability('invalid')
      return
    }

    this.store.setSlugAvailability('checking')
    this.slugCheckTimer = setTimeout(() => {
      this.api.checkSlugAvailability(slug).subscribe({
        next: (response) => {
          if (this.business().slug === slug) {
            this.store.setSlugAvailability(response.data.available ? 'available' : 'taken')
          }
        },
        error: () => {
          if (this.business().slug === slug) this.store.setSlugAvailability('error')
        },
      })
    }, 350)
  }

  selectBusinessType(type: BusinessType): void {
    this.store.updateBusiness({ businessType: type })
  }

  onContinue(): void {
    if (this.store.canContinue(2)) this.store.nextStep()
  }
}
