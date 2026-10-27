import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { OnboardingStore } from '../onboarding.store'
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
          <span class="material-symbols-outlined text-sm">rocket_launch</span>
          Paso {{ store.currentStep() }} de {{ store.totalSteps }} · Último Paso
        </span>
        <h2>Resumen y Activación</h2>
        <p>Revisa los datos de tu negocio antes de crear tu cuenta y comenzar a usar el sistema.</p>
      </div>

      <div *ngIf="!isSubmitting && !isComplete" class="summary-section">
        <div class="summary-card">
          <div class="summary-header">
            <div class="summary-brand">
              <div class="brand-avatar">{{ brandInitials }}</div>
              <div>
                <h3>{{ store.business().tradeName || 'Tu Negocio' }}</h3>
                <span class="legal">{{ store.business().legalName || 'Razón social opcional' }}</span>
              </div>
            </div>
            <span class="plan-badge">Plan Atelier Pro</span>
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
              <span class="label">Canal de Citas</span>
              <span class="value">WhatsApp + Web</span>
            </div>
          </div>
        </div>

        <div class="info-banner">
          <span class="material-symbols-outlined text-lg">verified</span>
          <div>
            <span class="title">Datos de la cuenta</span>
            <span class="text">{{ store.account().name }} {{ store.account().lastName }}</span>
            <span class="text">{{ store.account().email }}</span>
            <span *ngIf="store.account().documentType && store.account().documentNumber" class="text">{{ store.account().documentType }} {{ store.account().documentNumber }}</span>
            <span *ngIf="store.account().phone" class="text">{{ store.account().phone }}</span>
            <span *ngIf="store.account().city" class="text">{{ store.account().city }}</span>
            <span class="text">Acceso Completo al Sistema</span>
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
          <span class="material-symbols-outlined">rocket</span>
          Crear mi negocio
        </button>
        <span class="terms">Se crearán tu negocio y el perfil público configurado.</span>
      </div>

      <div *ngIf="isComplete" class="success-section">
        <div class="success-icon">✓</div>
        <h3>¡Todo Listo!</h3>
        <p>Tu barbería está lista para comenzar.</p>
        <a class="btn btn-secondary" routerLink="/dashboard">Ir al Dashboard</a>
      </div>
    </section>
  `,
  styles: [`
    .step-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 3px 20px #4a2e1b0d; }
    .step-header { margin-bottom: 28px; }
    .step-badge { display: inline-flex; align-items: center; gap: 6px; color: #4D7C5D; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
    .step-header h2 { color: #412311; font: 700 28px/1.1 'Vollkorn', serif; margin: 8px 0; }
    .step-header p { color: #50443e; font-size: 14px; margin: 0; }
    .summary-card { background: #f5f0e8; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(160,141,126,0.2); }
    .summary-brand { display: flex; align-items: center; gap: 12px; }
    .brand-avatar { width: 48px; height: 48px; border-radius: 8px; background: rgba(148,73,40,0.2); color: #944928; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
    .summary-brand h3 { color: #412311; font: 700 18px 'Vollkorn', serif; margin: 0; }
    .legal { font-size: 12px; color: #4D7C5D; font-family: 'Fira Code', monospace; }
    .plan-badge { padding: 6px 12px; border-radius: 6px; background: #f5f0e8; color: #944928; font-size: 12px; font-weight: 600; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .summary-item { display: flex; flex-direction: column; gap: 4px; padding: 10px; background: white; border-radius: 6px; }
    .summary-item .label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #50443e; }
    .summary-item .value { font-weight: 700; color: #412311; font-size: 13px; font-family: 'Fira Code', monospace; }
    .summary-item .public-url { color: #944928; overflow-wrap: anywhere; text-decoration: underline; }
    .info-banner { display: flex; gap: 12px; padding: 16px; background: #f5f0e8; border-radius: 8px; margin-bottom: 20px; align-items: flex-start; }
    .info-banner > .material-symbols-outlined { color: #944928; font-size: 24px; margin-top: 2px; }
    .info-banner .title { font-weight: 600; color: #412311; font-size: 13px; display: block; }
    .info-banner .text { font-size: 11px; color: #50443e; display: block; }
    .provisioning-section { margin-bottom: 20px; }
    .provisioning-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .status-dots { display: flex; gap: 8px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: #944928; position: relative; }
    .dot-ping::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: #944928; animation: ping 1.5s ease-in-out infinite; }
    @keyframes ping { 0%, 100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.5); opacity: 0; } }
    .provisioning-header span:not(.dot):not(.dot-ping) { font-weight: 600; color: #412311; font-size: 14px; }
    .provisioning-header .percent { font-family: 'Fira Code', monospace; color: #944928; font-weight: 700; }
    .progress-bar { background: #e6e2d9; border-radius: 4px; height: 8px; overflow: hidden; margin-bottom: 12px; }
    .fill { background: #944928; height: 100%; transition: width .3s ease; }
    .terminal-log { background: #17120f; border-radius: 8px; padding: 16px; font-family: 'Fira Code', monospace; font-size: 11px; color: #d2c4bd; max-height: 200px; overflow-y: auto; }
    .log-line { padding: 2px 0; }
    .log-line .prompt { color: #944928; margin-right: 8px; }
    .action-bar { margin-top: 20px; text-align: center; }
    .btn { padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: 0; cursor: pointer; transition: .2s ease; display: inline-flex; align-items: center; gap: 8px; justify-content: center; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-primary { background: #d98e3a; color: #181310; }
    .btn-primary:hover:not(:disabled) { background: #e6a456; }
    .btn-secondary { background: white; color: #412311; border: 1px solid #e6e2d9; }
    .terms { font-size: 11px; color: #50443e; text-align: center; margin-top: 8px; display: block; }
    .activation-error { background: #fff0ee; border-radius: 8px; color: #93000a; font-size: 13px; margin-top: 16px; padding: 14px; }
    .activation-error a { color: inherit; font-weight: 700; margin-left: 6px; }
    .success-section { text-align: center; padding: 40px 20px; }
    .success-icon { width: 64px; height: 64px; border-radius: 50%; background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }
    .success-section h3 { color: #412311; font: 700 24px 'Vollkorn', serif; margin: 0 0 8px; }
    .success-section p { color: #50443e; margin: 0 0 20px; }
    @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .summary-grid { grid-template-columns: 1fr; } }
  `],
})
export class OnboardingStepActivationComponent {
  isSubmitting = false
  isComplete = false
  submitting = false
  submittingPercent = 15
  submittingMessage = 'Creando tu cuenta...'
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
    this.submittingMessage = 'Creando tu cuenta...'
    this.terminalLogs = []

    const data: OnboardingSubmitData = {
      consentAccepted: true,
      account: {
        name: this.store.account().name,
        lastName: this.store.account().lastName,
        email: this.store.account().email,
        userId: this.store.userId(),
        documentType: this.store.account().documentType,
        documentNumber: this.store.account().documentNumber,
        phone: this.store.account().phone,
        whatsapp: this.store.account().whatsapp,
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
      next: (response: any) => {
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
            this.terminalLogs = [...this.terminalLogs, '✓ Aprovisionamiento completado']
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
    this.authService.login(email, password, tenantId).subscribe({
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
