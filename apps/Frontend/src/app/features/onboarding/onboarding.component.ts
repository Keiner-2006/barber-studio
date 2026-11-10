import { Component, computed } from '@angular/core'
import { RouterLink } from '@angular/router'
import { OnboardingStore } from './onboarding.store'
import { OnboardingStep } from './onboarding.models'
import { OnboardingStepAccountComponent } from './steps/onboarding-step-account.component'
import { OnboardingStepIdentityComponent } from './steps/onboarding-step-identity.component'
import { OnboardingStepLocationComponent } from './steps/onboarding-step-location.component'
import { OnboardingStepServicesComponent } from './steps/onboarding-step-services.component'
import { OnboardingStepBrandingComponent } from './steps/onboarding-step-branding.component'
import { OnboardingStepActivationComponent } from './steps/onboarding-step-activation.component'

const STEPS: { label: string; detail: string; icon: string }[] = [
  { label: 'Tu cuenta', detail: 'Datos del propietario y contraseña', icon: 'person' },
  { label: 'Tu negocio', detail: 'Nombre, enlace y tipo de negocio', icon: 'storefront' },
  { label: 'Ubicación', detail: 'Dirección y canales de contacto', icon: 'location_on' },
  { label: 'Horario y servicios', detail: 'Jornada y catálogo inicial', icon: 'schedule' },
  { label: 'Marca', detail: 'Logo, color y redes', icon: 'palette' },
  { label: 'Activación', detail: 'Revisa y crea tu negocio', icon: 'rocket_launch' },
]

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    RouterLink,
    OnboardingStepAccountComponent,
    OnboardingStepIdentityComponent,
    OnboardingStepLocationComponent,
    OnboardingStepServicesComponent,
    OnboardingStepBrandingComponent,
    OnboardingStepActivationComponent,
  ],
  template: `
    <div class="onb">
      <aside class="rail">
        <div class="glow" aria-hidden="true"></div>
        <a routerLink="/" class="brand">
          <span class="brand-mark" aria-hidden="true"><span class="material-symbols-outlined">content_cut</span></span>
          <span class="brand-text">BarberShop<small>Inscripción de negocio</small></span>
        </a>

        <ol class="steps" aria-label="Pasos de la inscripción">
          @for (s of steps; track s.label; let i = $index) {
            <li>
              <button type="button" class="step" [class.active]="store.currentStep() === i + 1" [class.done]="store.currentStep() > i + 1"
                      [disabled]="i + 1 > store.currentStep()" (click)="goToStep(i + 1)" [attr.aria-current]="store.currentStep() === i + 1 ? 'step' : null">
                <span class="num" aria-hidden="true">
                  @if (store.currentStep() > i + 1) { <span class="material-symbols-outlined">check</span> } @else { {{ i + 1 }} }
                </span>
                <span class="txt"><strong>{{ s.label }}</strong><small>{{ s.detail }}</small></span>
              </button>
            </li>
          }
        </ol>

        <div class="preview" aria-label="Vista previa de tu negocio">
          <span class="pv-label">Vista previa</span>
          <div class="pv-card">
            <span class="pv-logo" [style.background]="store.branding().primaryColor || null">
              @if (store.branding().logoUrl) { <img [src]="store.branding().logoUrl" alt="" /> } @else { {{ initials() }} }
            </span>
            <div class="pv-text">
              <strong>{{ store.business().tradeName || 'Tu barbería' }}</strong>
              <small>/b/{{ store.business().slug || 'tu-enlace' }}</small>
            </div>
          </div>
          <ul class="pv-facts">
            <li><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ store.location().city || 'Ciudad por definir' }}</li>
            <li><span class="material-symbols-outlined" aria-hidden="true">content_cut</span>{{ servicesCount() }} {{ servicesCount() === 1 ? 'servicio' : 'servicios' }}</li>
          </ul>
        </div>
      </aside>

      <main class="content">
        <header class="mobile-head">
          <a routerLink="/" class="brand dark"><span class="brand-mark" aria-hidden="true"><span class="material-symbols-outlined">content_cut</span></span><span class="brand-text">BarberShop</span></a>
          <span class="count">Paso {{ store.currentStep() }} de {{ store.totalSteps }}</span>
        </header>
        <div class="bar" role="progressbar" aria-label="Progreso de la inscripción" [attr.aria-valuenow]="store.currentStep()" aria-valuemin="1" [attr.aria-valuemax]="store.totalSteps">
          <div class="bar-fill" [style.width.%]="store.progressPercent"></div>
        </div>

        <div class="step-wrap">
          @switch (store.currentStep()) {
            @case (1) { <app-onboarding-step-account /> }
            @case (2) { <app-onboarding-step-identity /> }
            @case (3) { <app-onboarding-step-location /> }
            @case (4) { <app-onboarding-step-services /> }
            @case (5) { <app-onboarding-step-branding /> }
            @case (6) { <app-onboarding-step-activation /> }
          }
        </div>

        @if (store.currentStep() > 1 && store.currentStep() < store.totalSteps) {
          <div class="actions">
            <button class="btn btn-secondary" (click)="store.prevStep()" type="button">
              <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span> Anterior
            </button>
            <div class="next">
              @if (attempted && !store.canContinue()) { <span class="need" role="alert">{{ missingHint }}</span> }
              <button class="btn btn-primary" (click)="nextStep()" [disabled]="store.submitting()" type="button">
                {{ store.submitting() ? 'Procesando…' : 'Continuar: ' + steps[store.currentStep()].label }}
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .onb { background: #fbf7ef; color: #1c1c16; display: grid; font: 16px/1.55 'Plus Jakarta Sans', sans-serif; grid-template-columns: 340px minmax(0, 1fr); min-height: 100vh; }
    .material-symbols-outlined { font-size: 20px; line-height: 1; }
    a:focus-visible, button:focus-visible { outline: 3px solid #e09a68; outline-offset: 2px; }

    .rail { background: #17100c; color: #f6eee4; display: flex; flex-direction: column; gap: 28px; height: 100vh; overflow-y: auto; padding: 28px 22px; position: sticky; top: 0; }
    .glow { background: radial-gradient(360px 300px at 90% 0%, rgba(196,112,63,.35), transparent 70%); inset: 0; pointer-events: none; position: absolute; }
    .rail > *:not(.glow) { position: relative; }
    .brand { align-items: center; color: inherit; display: inline-flex; gap: 10px; text-decoration: none; }
    .brand-mark { align-items: center; background: linear-gradient(135deg, #e09a68, #c4703f); border-radius: 10px; color: #17100c; display: flex; height: 38px; justify-content: center; width: 38px; }
    .brand-text { display: flex; flex-direction: column; font: 700 20px/1 'Vollkorn', serif; }
    .brand-text small { color: #e09a68; font: 700 11px/1.5 'Plus Jakarta Sans', sans-serif; letter-spacing: .14em; text-transform: uppercase; }

    .steps { display: grid; gap: 4px; list-style: none; margin: 0; padding: 0; }
    .step { align-items: center; background: none; border: 0; border-radius: 14px; color: #b9ab9e; cursor: pointer; display: flex; font: inherit; gap: 12px; padding: 10px; text-align: left; transition: background .2s; width: 100%; }
    .step:disabled { cursor: default; }
    .step:not(:disabled):hover { background: rgba(255,255,255,.05); }
    .num { align-items: center; border: 1.5px solid rgba(255,255,255,.25); border-radius: 50%; display: flex; flex: none; font-size: 14px; font-weight: 800; height: 34px; justify-content: center; width: 34px; }
    .txt strong { color: #e8ddd2; display: block; font-size: 15px; }
    .txt small { display: block; font-size: 13px; }
    .step.active { background: rgba(224,154,104,.14); }
    .step.active .num { background: linear-gradient(135deg, #e09a68, #c4703f); border-color: transparent; color: #17100c; }
    .step.active .txt strong { color: #ffdbca; }
    .step.done .num { background: rgba(95,212,154,.18); border-color: transparent; color: #a6f0c8; }
    .step.done .num .material-symbols-outlined { font-size: 18px; }

    .preview { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 18px; margin-top: auto; padding: 16px; }
    .pv-label { color: #a99a8c; display: block; font-size: 12px; font-weight: 700; letter-spacing: .14em; margin-bottom: 10px; text-transform: uppercase; }
    .pv-card { align-items: center; display: flex; gap: 12px; }
    .pv-logo { align-items: center; background: rgba(224,154,104,.25); border-radius: 12px; color: #ffdbca; display: flex; flex: none; font-weight: 800; height: 46px; justify-content: center; overflow: hidden; width: 46px; }
    .pv-logo img { height: 100%; object-fit: cover; width: 100%; }
    .pv-text { min-width: 0; }
    .pv-text strong { display: block; font: 600 18px 'Vollkorn', serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pv-text small { color: #e09a68; display: block; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pv-facts { display: grid; gap: 6px; list-style: none; margin: 12px 0 0; padding: 0; }
    .pv-facts li { align-items: center; color: #d9cdc1; display: flex; font-size: 14px; gap: 8px; }
    .pv-facts .material-symbols-outlined { color: #e09a68; font-size: 18px; }

    .content { display: flex; flex-direction: column; margin: 0 auto; max-width: 920px; min-width: 0; padding: clamp(16px, 4vw, 48px); width: 100%; }
    .mobile-head { display: none; }
    .bar { background: #ece4d7; border-radius: 999px; height: 6px; margin-bottom: 24px; overflow: hidden; }
    .bar-fill { background: linear-gradient(90deg, #e09a68, #b85a2b); border-radius: 999px; height: 100%; transition: width .4s ease; }
    .step-wrap { animation: rise .35s ease both; }
    @keyframes rise { from { opacity: 0; transform: translateY(10px); } }

    .actions { align-items: center; background: rgba(251,247,239,.92); backdrop-filter: blur(8px); border-top: 1px solid #e6dccc; bottom: 0; display: flex; gap: 12px; justify-content: space-between; margin-top: 24px; padding: 16px 0; position: sticky; }
    .next { align-items: center; display: flex; gap: 14px; }
    .need { color: #8c1d12; font-size: 14px; font-weight: 600; max-width: 32ch; text-align: right; }
    .btn { align-items: center; border: 0; border-radius: 14px; cursor: pointer; display: inline-flex; font: 700 16px 'Plus Jakarta Sans', sans-serif; gap: 8px; justify-content: center; min-height: 52px; padding: 0 22px; transition: transform .2s, box-shadow .2s; }
    .btn:disabled { cursor: not-allowed; opacity: .55; }
    .btn-primary { background: linear-gradient(135deg, #e09a68, #c4703f); box-shadow: 0 10px 24px rgba(196,112,63,.3); color: #17100c; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-secondary { background: #fff; border: 1.5px solid #e6dccc; color: #2a1b12; }

    @media (max-width: 1000px) {
      .onb { grid-template-columns: 1fr; }
      .rail { display: none; }
      .mobile-head { align-items: center; display: flex; justify-content: space-between; margin-bottom: 14px; }
      .brand.dark { color: #2a1b12; }
      .count { color: #b85a2b; font-size: 14px; font-weight: 700; }
    }
    @media (max-width: 560px) {
      .actions { flex-direction: column-reverse; align-items: stretch; }
      .next { flex-direction: column-reverse; align-items: stretch; }
      .need { max-width: none; text-align: center; }
      .btn { width: 100%; }
    }
    @media (prefers-reduced-motion: reduce) { .step-wrap { animation: none; } .bar-fill, .btn, .step { transition: none; } }
  `],
})
export class OnboardingComponent {
  readonly steps = STEPS
  attempted = false

  readonly servicesCount = computed(() => this.store.schedule().services.filter((s) => s.selected).length)
  readonly initials = computed(() =>
    (this.store.business().tradeName || 'TB').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join(''),
  )

  constructor(public store: OnboardingStore) {}

  get missingHint(): string {
    switch (this.store.currentStep()) {
      case 2: return 'Completa nombre, razón social y un enlace disponible.'
      case 3: return 'Indica la ciudad y la dirección del negocio.'
      case 4: return 'Selecciona al menos un servicio.'
      default: return 'Revisa los datos de este paso.'
    }
  }

  goToStep(step: number): void {
    if (step <= this.store.currentStep()) this.store.setStep(step as OnboardingStep)
  }

  nextStep(): void {
    this.attempted = true
    if (!this.store.canContinue()) return
    const current = this.store.currentStep()
    if (current >= this.store.totalSteps) return
    this.attempted = false
    if (current === 1) {
      this.store.registerAndLogin()
      return
    }
    if (current === 3) this.normalizeWhatsapp()
    this.store.nextStep()
  }

  /** The location step only normalized on its own (never-used) form submit; do it on "Continuar". */
  private normalizeWhatsapp(): void {
    const dial: Record<string, string> = { CO: '+57', MX: '+52', AR: '+54', CL: '+56', PE: '+51', US: '+1', ES: '+34' }
    const raw = (this.store.location().whatsapp || '').trim()
    if (!raw) return
    const digits = raw.replace(/\D/g, '')
    this.store.updateLocation({ whatsapp: raw.startsWith('+') ? `+${digits}` : `${dial[this.store.business().countryCode] ?? '+57'}${digits}` })
  }
}
