import { Component, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'
import { ONB_STYLES } from '../onboarding.ui'
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
          <span class="material-symbols-outlined" aria-hidden="true">storefront</span>
          Paso 2 de {{ store.totalSteps }} · Tu negocio
        </span>
        <h2>¿Cómo se llama tu barbería?</h2>
        <p>Así te encontrarán tus clientes. El enlace será tu página pública de reservas.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form">
    <div class="form-grid">
          <div class="form-group">
            <label for="tradeName">
              Nombre comercial
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
              Razón social
              <span class="required">Requerido</span>
            </label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">receipt_long</span>
              <input
                id="legalName"
                [(ngModel)]="business().legalName"
                name="legalName"
                placeholder="Ej. Inversiones Valhalla S.A.S."
                required
                maxlength="150"
              />
            </div>
            <span class="hint">Debe coincidir con la razón social registrada del negocio.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="countryCode">
            País
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
                <option [value]="country.code">{{ country.name }}</option>
              }
            </select>
          </div>
          <span class="hint">Afecta la moneda, zona horaria y configuración fiscal por defecto.</span>
        </div>

        <div class="form-group slug-group">
          <label for="slug">
            Enlace público de tu negocio
            <span class="required">Requerido</span>
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
              <span class="material-symbols-outlined" aria-hidden="true">
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
          <span class="field-label" id="type-label">Tipo de negocio</span>
          <div class="business-types" role="group" aria-labelledby="type-label">
            @for (type of businessTypes; track type.value) {
              <button
                type="button"
                class="type-card"
                [class.selected]="business().businessType === type.value"
                [attr.aria-pressed]="business().businessType === type.value"
                (click)="selectBusinessType(type.value)"
              >
                <span class="material-symbols-outlined">{{ type.icon }}</span>
                <span class="type-title">{{ type.label }}</span>
                <span class="type-desc">{{ type.description }}</span>
              </button>
            }
          </div>
        </div>

        <div class="form-group">
          <label for="bio">
            Descripción
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
          <span class="hint">Aparece en tu página pública. Cuenta qué te hace distinto.</span>
        </div>
      </form>
    </section>
  `,
  styles: [ONB_STYLES, `
    .slug-group { background: var(--paper); border-radius: 18px; padding: 18px; }
    .slug-input input { color: var(--copper); font-weight: 700; padding-left: 12px; }
    .slug-status { align-items: center; color: var(--green); display: flex; flex: none; font-size: 13px; font-weight: 700; gap: 4px; padding: 0 12px; white-space: nowrap; }
    .slug-status .material-symbols-outlined { font-size: 18px; }
    .slug-status.slug-error { color: var(--red); }
    .slug-info { color: var(--muted-2); font-size: 13px; }
    .slug-preview { color: var(--copper); font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
    .business-types { display: grid; gap: 12px; grid-template-columns: repeat(4, 1fr); }
    .type-card { background: #fff; border: 1.5px solid var(--line); border-radius: 16px; color: inherit; cursor: pointer; display: flex; flex-direction: column; font: inherit; gap: 6px; padding: 16px; text-align: left; transition: border-color .2s, box-shadow .2s, transform .2s; width: 100%; }
    .type-card:hover { border-color: #d8c4ae; transform: translateY(-1px); }
    .type-card.selected { background: var(--copper-soft); border-color: #c4703f; box-shadow: 0 0 0 3px rgba(196,112,63,.15); }
    .type-card .material-symbols-outlined { color: var(--copper); font-size: 26px; }
    .type-title { color: var(--ink); font-size: 15px; font-weight: 700; }
    .type-desc { color: var(--muted); font-size: 13px; line-height: 1.4; }
    .char-count { color: var(--muted-2); font-size: 13px; font-weight: 600; }
    @media (max-width: 900px) { .business-types { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .business-types { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) { .type-card { transition: none; } }
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
