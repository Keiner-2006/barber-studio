import { Injectable, signal } from '@angular/core'
import { Router } from '@angular/router'
import {
  BusinessInfo,
  LocationInfo,
  ScheduleInfo,
  BrandingInfo,
  OnboardingSummary,
  OnboardingStep,
  OnboardingState,
  OwnerAccount,
} from './onboarding.models'
import { OnboardingApi } from './onboarding.api'
import { AuthService } from '../../core/auth/auth.service'

@Injectable({ providedIn: 'root' })
export class OnboardingStore {
  private _currentStep = signal<OnboardingStep>(1)
  private _loading = signal(false)
  private _submitting = signal(false)
  private _completed = signal(false)
  private _jobId = signal('')
  private _tenantId = signal('')

  private _account = signal<OwnerAccount>({
    name: '',
    lastName: '',
    email: '',
    password: '',
  })

  private _business = signal<BusinessInfo>({
    tradeName: '',
    legalName: '',
    slug: '',
    businessType: 'barberia',
    description: '',
  })

  private _location = signal<LocationInfo>({
    city: '',
    neighborhood: '',
    address: '',
    whatsapp: '',
    email: '',
  })

  private _schedule = signal<ScheduleInfo>({
    schedules: [
      { days: 'Lunes a Viernes', open: '08:00', close: '20:00', active: true },
      { days: 'Sábados', open: '09:00', close: '19:00', active: true },
      { days: 'Domingos & Festivos', open: '', close: '', active: false },
    ],
    services: [
      {
        id: '1',
        name: 'Corte Clásico & Fade de Autor',
        description: 'Duración: 45 min · Lavado capilar con aceite esencial incluido',
        duration: '45 min',
        price: 35000,
        selected: true,
      },
      {
        id: '2',
        name: 'Ritual de Barba a la Navaja',
        description: 'Duración: 35 min · 2 Toallas calientes vaporizadas y bálsamo de romero',
        duration: '35 min',
        price: 25000,
        selected: true,
      },
      {
        id: '3',
        name: 'Combo Navaja Master (Corte + Barba)',
        description: 'Duración: 75 min · Servicio completo con bebida de cortesía',
        duration: '75 min',
        price: 55000,
        selected: true,
      },
    ],
  })

  private _branding = signal<BrandingInfo>({
    primaryColor: '#d98e3a',
    colorPreset: 'Aged Brass',
    logoUrl: '',
    instagram: '',
    tiktok: '',
  })

  private _summary = signal<OnboardingSummary | null>(null)

  private _userId = signal('')

  readonly userId = this._userId.asReadonly()
  readonly currentStep = this._currentStep.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly submitting = this._submitting.asReadonly()
  readonly completed = this._completed.asReadonly()
  readonly jobId = this._jobId.asReadonly()
  readonly tenantId = this._tenantId.asReadonly()
  readonly account = this._account.asReadonly()
  readonly business = this._business.asReadonly()
  readonly location = this._location.asReadonly()
  readonly schedule = this._schedule.asReadonly()
  readonly branding = this._branding.asReadonly()
  readonly summary = this._summary.asReadonly()

  constructor(
    private api: OnboardingApi,
    private auth: AuthService,
    private router: Router,
  ) {}

  get totalSteps(): number {
    return 6
  }

  get progressPercent(): number {
    return ((this._currentStep() - 1) / (this.totalSteps - 1)) * 100
  }

  setStep(step: OnboardingStep): void {
    this._currentStep.set(step)
  }

  nextStep(): void {
    if (this._currentStep() < this.totalSteps) {
      this._currentStep.set((this._currentStep() + 1) as OnboardingStep)
    }
  }

  canContinue(step?: number): boolean {
    const s = step ?? this._currentStep()
    if (s === 2) {
      const b = this._business()
      return !!b.tradeName && !!b.legalName && !!b.slug
    }
    if (s === 3) {
      const l = this._location()
      return !!l.city && !!l.address
    }
    if (s === 4) {
      return this._schedule().services.some((svc) => svc.selected)
    }
    return true
  }

  prevStep(): void {
    if (this._currentStep() > 1) {
      this._currentStep.set((this._currentStep() - 1) as OnboardingStep)
    }
  }

  updateAccount(data: Partial<OwnerAccount>): void {
    this._account.update((prev) => ({ ...prev, ...data }))
  }

  updateBusiness(data: Partial<BusinessInfo>): void {
    this._business.update((prev) => ({ ...prev, ...data }))
  }

  updateLocation(data: Partial<LocationInfo>): void {
    this._location.update((prev) => ({ ...prev, ...data }))
  }

  updateSchedule(data: Partial<ScheduleInfo>): void {
    this._schedule.update((prev) => ({ ...prev, ...data }))
  }

  updateBranding(data: Partial<BrandingInfo>): void {
    this._branding.update((prev) => ({ ...prev, ...data }))
  }

  setCompleted(): void {
    this._completed.set(true)
  }

  setJobId(id: string): void {
    this._jobId.set(id)
  }

  setTenantId(id: string): void {
    this._tenantId.set(id)
  }

  setSummary(data: OnboardingSummary): void {
    this._summary.set(data)
  }

  setSubmitting(value: boolean): void {
    this._submitting.set(value)
  }

  registerAndLogin(): void {
    const acc = this._account()
    this.auth.register(acc.email, acc.password, acc.name).subscribe({
      next: (response: any) => {
        this._userId.set(response.user?.id || '')
        this.setSubmitting(false)
        this.nextStep()
        this.router.navigate(['/onboarding'])
      },
      error: () => {
        this.setSubmitting(false)
      },
    })
  }

  signUpWithGoogle(): void {
    this.auth.signUpWithGoogle()
  }
}
