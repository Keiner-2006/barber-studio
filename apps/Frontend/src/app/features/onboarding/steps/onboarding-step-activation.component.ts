import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { OnboardingStore } from '../onboarding.store'
import { ONB_STYLES } from '../onboarding.ui'
import { OnboardingApi } from '../onboarding.api'
import { OnboardingSubmitData } from '../onboarding.models'
import { AuthService } from '../../../core/auth/auth.service'
import { TenantService } from '../../../core/tenancy/tenant.service'
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-onboarding-step-activation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-symbols-outlined" aria-hidden="true">rocket_launch</span>
          Paso {{ store.currentStep() }} de {{ store.totalSteps }} · Último paso
        </span>
        <h2>Todo listo para abrir</h2>
        <p>Revisa los datos. Al crear tu negocio queda activo de inmediato, con tu sede y tus servicios.</p>
      </div>

      <div *ngIf="!isSubmitting && !isComplete" class="summary-section">
        <div class="summary-card">
          <div class="summary-header">
            <div class="summary-brand">
              <div class="brand-avatar" [style.background]="store.branding().primaryColor || null">@if (store.branding().logoUrl) { <img [src]="store.branding().logoUrl" alt="" /> } @else { {{ brandInitials }} }</div>
              <div>
                <h3>{{ store.business().tradeName || 'Tu Negocio' }}</h3>
                <span class="legal">{{ store.business().legalName }}</span>
              </div>
            </div>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Enlace público</span>
              <a *ngIf="isComplete; else pendingPublicUrl" class="value public-url" [href]="publicUrl" target="_blank" rel="noopener noreferrer">{{ publicUrl }}</a>
              <ng-template #pendingPublicUrl><span class="value public-url">{{ publicUrl }}</span></ng-template>
            </div>
            <div class="summary-item">
              <span class="label">Moneda</span>
              <span class="value">{{ currencyCode }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Servicios</span>
              <span class="value">{{ activeServicesCount }} Servicios</span>
            </div>
            <div class="summary-item">
              <span class="label">Ciudad</span>
              <span class="value">{{ store.location().city || '—' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">WhatsApp público</span>
              <span *ngIf="publicWhatsApp; else noPublicWhatsApp" class="value">{{ publicWhatsApp }}</span>
              <ng-template #noPublicWhatsApp><span class="value">Sin WhatsApp público</span></ng-template>
            </div>
          </div>
        </div>

        <div class="info-banner">
          <span class="material-symbols-outlined text-lg">verified</span>
          <div>
            <span class="title">Cuenta del propietario</span>
            <span class="text">{{ store.account().name }} {{ store.account().lastName }}</span>
            <span class="text">{{ store.account().email }}</span>
            <span *ngIf="store.account().documentType && store.account().documentNumber" class="text">{{ store.account().documentType }} {{ store.account().documentNumber }}</span>
            <span *ngIf="store.account().phone" class="text">{{ store.account().phone }}</span>
            <span *ngIf="publicWhatsApp" class="text">WhatsApp público del negocio: {{ publicWhatsApp }}</span>
            <span *ngIf="store.account().city" class="text">{{ store.account().city }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="isSubmitting" class="provisioning-section">
        <div class="provisioning-header">
          <div class="status-dots">
            <span class="dot dot-ping"></span>
            <span class="dot"></span>
          </div>
          <span>{{ submittingMessage }}</span>
          <span class="percent">{{ submittingPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="fill" [style.width.%]="submittingPercent"></div>
        </div>
        <div class="terminal-log">
          @for (log of terminalLogs; track log) {
            <div class="log-line">
              <span class="prompt">&gt;</span>
              {{ log }}
            </div>
          }
        </div>
      </div>

      <div *ngIf="activationError" class="activation-error" role="alert">
        {{ activationError }}
        <a routerLink="/login">Iniciar sesión</a>
      </div>

      <div *ngIf="!isSubmitting && !isComplete" class="action-bar">
        <button class="btn btn-primary" (click)="provision()" [disabled]="submitting" type="button">
          <span class="material-symbols-outlined" aria-hidden="true">rocket_launch</span>
          Crear mi negocio
        </button>
        <span class="terms">Podrás cambiar todos estos datos después desde tu panel.</span>
      </div>

      <div *ngIf="isComplete" class="success-section">
        <div class="success-icon"><span class="material-symbols-outlined" aria-hidden="true">check</span></div>
        <h3>¡Tu barbería está lista!</h3>
        <p>Ya puedes empezar a recibir reservas.</p>
        <a class="btn btn-primary" routerLink="/dashboard">Ir a mi panel</a>
      </div>
    </section>
  `,
  styles: [ONB_STYLES, `
    .summary-card { background: var(--paper); border-radius: 20px; margin-bottom: 18px; padding: 20px; }
    .summary-header { align-items: center; border-bottom: 1px solid var(--line); display: flex; gap: 12px; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; }
    .summary-brand { align-items: center; display: flex; gap: 12px; min-width: 0; }
    .brand-avatar { align-items: center; background: var(--copper-soft); border-radius: 14px; color: #74361f; display: flex; flex: none; font-size: 18px; font-weight: 800; height: 52px; justify-content: center; overflow: hidden; width: 52px; }
    .brand-avatar img { height: 100%; object-fit: cover; width: 100%; }
    .summary-brand h3 { color: var(--ink); font: 700 22px 'Vollkorn', serif; margin: 0; }
    .legal { color: var(--muted); font-size: 14px; }
    .summary-grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }
    .summary-item { background: #fff; border-radius: 14px; display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; }
    .summary-item .label { color: var(--muted); font-size: 13px; font-weight: 600; }
    .summary-item .value { color: var(--ink); font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }
    .summary-item .public-url { color: var(--copper); }
    .info-banner { align-items: flex-start; background: #fff; border: 1px solid var(--line); border-radius: 16px; display: flex; gap: 12px; margin-bottom: 18px; padding: 16px; }
    .info-banner > .material-symbols-outlined { color: var(--copper); font-size: 24px; }
    .info-banner .title { color: var(--ink); display: block; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .info-banner .text { color: var(--muted); display: block; font-size: 14px; }
    .provisioning-section { margin-bottom: 18px; }
    .provisioning-header { align-items: center; display: flex; gap: 12px; justify-content: space-between; margin-bottom: 12px; }
    .provisioning-header > span:nth-child(2) { color: var(--ink); flex: 1; font-size: 16px; font-weight: 700; }
    .provisioning-header .percent { color: var(--copper); font-variant-numeric: tabular-nums; font-weight: 800; }
    .status-dots { display: flex; gap: 8px; }
    .dot { background: #c4703f; border-radius: 50%; height: 12px; position: relative; width: 12px; }
    .dot-ping::after { animation: ping 1.5s ease-in-out infinite; background: #c4703f; border-radius: 50%; content: ''; inset: 0; position: absolute; }
    @keyframes ping { 50% { opacity: 0; transform: scale(1.8); } }
    .progress-bar { background: #ece4d7; border-radius: 999px; height: 10px; margin-bottom: 12px; overflow: hidden; }
    .fill { background: linear-gradient(90deg, #e09a68, #b85a2b); height: 100%; transition: width .3s ease; }
    .terminal-log { background: var(--paper); border-radius: 14px; color: var(--muted); font-size: 14px; max-height: 200px; overflow-y: auto; padding: 12px 14px; }
    .log-line { padding: 2px 0; }
    .log-line .prompt { color: var(--copper); margin-right: 8px; }
    .action-bar { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .action-bar .btn { width: 100%; }
    .terms { color: var(--muted); font-size: 14px; text-align: center; }
    .activation-error { background: #fdecea; border: 1px solid #f2bdb8; border-radius: 14px; color: var(--red); font-size: 15px; margin-top: 16px; padding: 14px; }
    .activation-error a { color: inherit; font-weight: 700; margin-left: 6px; }
    .success-section { padding: 32px 12px; text-align: center; }
    .success-icon { align-items: center; background: #e5f4ec; border-radius: 50%; color: var(--green); display: flex; height: 72px; justify-content: center; margin: 0 auto 16px; width: 72px; }
    .success-icon .material-symbols-outlined { font-size: 36px; }
    .success-section h3 { color: var(--ink); font: 700 28px 'Vollkorn', serif; margin: 0 0 8px; }
    .success-section p { color: var(--muted); margin: 0 0 20px; }
    @media (prefers-reduced-motion: reduce) { .dot-ping::after { animation: none; } .fill { transition: none; } }
  `],
})
export class OnboardingStepActivationComponent {
  isSubmitting = false
  isComplete = false
  submitting = false
  submittingPercent = 15
  submittingMessage = 'Creando tu negocio…'
  terminalLogs: string[] = []
  activationError = ''

  constructor(
    public store: OnboardingStore,
    private api: OnboardingApi,
    private router: Router,
    private authService: AuthService,
    private tenantService: TenantService,
  ) {}

  get brandInitials(): string {
    const name = this.store.business().tradeName || ''
    return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('')
  }

  get activeServicesCount(): number {
    return this.store.schedule().services.filter((s) => s.selected).length
  }

  get publicUrl(): string {
    return `${environment.frontendUrl.replace(/\/$/, '')}/b/${this.store.business().slug}`
  }

  get publicWhatsApp(): string {
    return this.store.location().whatsapp
  }

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

  provision(): void {
    this.activationError = ''
    this.submitting = true
    this.isSubmitting = true
    this.submittingPercent = 15
    this.submittingMessage = 'Creando tu negocio…'
    this.terminalLogs = []

    const data: OnboardingSubmitData = {
      consentAccepted: this.store.termsAccepted(),
      account: {
        name: this.store.account().name,
        lastName: this.store.account().lastName,
        email: this.store.account().email,
        documentType: this.store.account().documentType,
        documentNumber: this.store.account().documentNumber,
        phone: this.normalizeInternationalPhone(this.store.account().phone),
        whatsapp: this.store.account().whatsapp
          ? this.normalizeInternationalPhone(this.store.account().whatsapp)
          : undefined,
        birthDate: this.store.account().birthDate || undefined,
        city: this.store.account().city || undefined,
      },
      business: {
        tradeName: this.store.business().tradeName,
        legalName: this.store.business().legalName,
        slug: this.store.business().slug,
        businessType: this.store.business().businessType,
        countryCode: this.store.business().countryCode,
        description: this.store.business().description,
      },
      location: {
        city: this.store.location().city,
        neighborhood: this.store.location().neighborhood,
        address: this.store.location().address,
        whatsapp: this.store.location().whatsapp,
        email: this.store.location().email,
      },
      schedule: {
        schedules: this.store.schedule().schedules,
        services: this.store.schedule().services,
      },
      branding: {
        primaryColor: this.store.branding().primaryColor,
        colorPreset: this.store.branding().colorPreset,
        logoUrl: this.store.branding().logoUrl,
        instagram: this.store.branding().instagram,
        tiktok: this.store.branding().tiktok,
      },
    }

    this.api.submitAll(data).subscribe({
      next: (response) => {
        const jobId = response.data?.jobId
        if (jobId) {
          this.store.setJobId(jobId)
          this.pollJob(jobId)
        } else {
          this.isSubmitting = false
          this.submitting = false
          this.activationError = 'No recibimos confirmación del registro. Intenta nuevamente.'
        }
      },
      error: (err: { error?: { error?: { message?: string }; message?: string }; message?: string }) => {
        this.submitting = false
        this.isSubmitting = false
        this.activationError = err.error?.error?.message
          || err.error?.message
          || err.message
          || 'No se pudo crear el negocio. Revisa los datos e inténtalo nuevamente.'
      },
    })
  }

  private normalizeInternationalPhone(value: string): string {
    const trimmed = value.trim()
    if (!trimmed.startsWith('+')) return trimmed
    return `+${trimmed.slice(1).replace(/\D/g, '')}`
  }

  private pollJob(jobId: string): void {
    let attempts = 0
    const maxAttempts = 15

    const poll = () => {
      if (attempts >= maxAttempts) {
        this.isSubmitting = false
        this.submitting = false
        this.activationError = 'El registro tardó demasiado y no se pudo confirmar. Intenta nuevamente o contacta a soporte.'
        return
      }
      attempts++

      this.api.getJobStatus(jobId).subscribe({
        next: (resp: any) => {
          const status = resp.data?.status
          const tenantId = resp.data?.tenantId

          if (status === 'succeeded' || status === 'completed') {
            if (tenantId) {
              this.store.setTenantId(tenantId)
              localStorage.setItem('navaja_tenant_id', tenantId)
            }
            this.terminalLogs = [...this.terminalLogs, 'Negocio creado']
            this.loginAfterOnboarding()
          } else if (status === 'failed' || status === 'compensated') {
            this.isSubmitting = false
            this.submitting = false
            this.activationError = 'No se pudo completar el registro: ' + (resp.data?.errorDetail || 'error de aprovisionamiento')
          } else {
            // Job still queued/running
            this.submittingPercent = Math.min(25 + (attempts * 5), 90)
            setTimeout(poll, 2000)
          }
        },
        error: () => {
          attempts += 0.5
          if (attempts >= maxAttempts) {
            this.isSubmitting = false
            this.submitting = false
            this.activationError = 'No se pudo consultar el estado del registro. Intenta nuevamente.'
          } else {
            setTimeout(poll, 3000)
          }
        },
      })
    }

    setTimeout(poll, 1000)
  }

  private loginAfterOnboarding(): void {
    const email = this.store.account().email
    const password = this.store.account().password
    const tenantId = this.store.tenantId()
    this.authService.login(email, password, tenantId, 'company_member').subscribe({
      next: () => {
        this.isSubmitting = false
        this.isComplete = true
        this.store.setCompleted()
        this.router.navigate(['/dashboard'])
      },
      error: () => {
        this.isSubmitting = false
        this.submitting = false
        this.activationError = 'Tu negocio se creó, pero no pudimos iniciar la sesión automáticamente.'
      },
    })
  }
}
