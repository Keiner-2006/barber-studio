import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { OnboardingStore } from './onboarding.store'
import { OnboardingStep } from './onboarding.models'
import { OnboardingStepAccountComponent } from './steps/onboarding-step-account.component'
import { OnboardingStepIdentityComponent } from './steps/onboarding-step-identity.component'
import { OnboardingStepLocationComponent } from './steps/onboarding-step-location.component'
import { OnboardingStepServicesComponent } from './steps/onboarding-step-services.component'
import { OnboardingStepBrandingComponent } from './steps/onboarding-step-branding.component'
import { OnboardingStepActivationComponent } from './steps/onboarding-step-activation.component'

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    OnboardingStepAccountComponent,
    OnboardingStepIdentityComponent,
    OnboardingStepLocationComponent,
    OnboardingStepServicesComponent,
    OnboardingStepBrandingComponent,
    OnboardingStepActivationComponent,
  ],
  template: `
    <main class="onboarding-page">
      <div class="onboarding-container">
        <header class="onboarding-header">
          <a routerLink="/" class="brand">
            <span class="brand-mark">✂</span>
            <span>Navaja Studio <small>OS</small></span>
          </a>
          <span class="step-indicator">Paso {{ store.currentStep() }} de {{ store.totalSteps }}</span>
        </header>

        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="store.progressPercent"></div>
        </div>

        <div class="stepper">
          @for (s of [1, 2, 3, 4, 5, 6]; track s) {
            <button
              class="stepper-btn"
              [class.active]="store.currentStep() === s"
              [class.done]="store.currentStep() > s"
              (click)="goToStep(s)"
              type="button"
            >
              <span class="stepper-num">{{ s }}</span>
              <span class="stepper-label">{{ stepLabels[s - 1] }}</span>
            </button>
          }
        </div>

        <div class="step-content">
          <app-onboarding-step-account *ngIf="store.currentStep() === 1" />
          <app-onboarding-step-identity *ngIf="store.currentStep() === 2" />
          <app-onboarding-step-location *ngIf="store.currentStep() === 3" />
          <app-onboarding-step-services *ngIf="store.currentStep() === 4" />
          <app-onboarding-step-branding *ngIf="store.currentStep() === 5" />
          <app-onboarding-step-activation *ngIf="store.currentStep() === 6" />
        </div>

        <div class="action-bar">
          <button
            class="btn btn-secondary"
            (click)="store.prevStep()"
            [disabled]="store.currentStep() === 1"
            type="button"
          >
            ← Anterior
          </button>
          <button
            class="btn btn-primary"
            (click)="nextStep()"
            [disabled]="store.submitting()"
            type="button"
          >
            @if (store.submitting()) {
              Procesando...
            } @else {
              {{ nextButtonLabel }} →
            }
          </button>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; }
    .onboarding-page { background: var(--cream, #fdf9f0); min-height: 100vh; padding: clamp(20px, 5vw, 64px); font: 14px/1.5 'Plus Jakarta Sans', sans-serif; color: #1c1c16; }
    .onboarding-container { max-width: 1100px; margin: 0 auto; }
    .onboarding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .brand { align-items: center; color: #412311; display: flex; font: 700 22px/1 'Vollkorn', serif; gap: 10px; text-decoration: none; }
    .brand small { font: 400 11px/1 'Plus Jakarta Sans', sans-serif; color: #944928; margin-left: 4px; }
    .brand-mark { align-items: center; background: #5a3825; border-radius: 8px; color: #ffdbca; display: flex; font: 18px sans-serif; height: 34px; justify-content: center; width: 34px; }
    .step-indicator { color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .05em; }
    .progress-bar { background: #e6e2d9; border-radius: 4px; height: 4px; margin-bottom: 24px; overflow: hidden; }
    .progress-fill { background: #944928; height: 100%; transition: width .3s ease; }
    .stepper { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
    .stepper-btn { flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; background: white; border: 1px solid #e6e2d9; border-radius: 8px; cursor: pointer; transition: all .2s; }
    .stepper-btn:hover { border-color: #944928; }
    .stepper-btn.active { border-color: #944928; background: #fdf9f0; box-shadow: 0 0 0 3px #94492822; }
    .stepper-btn.done { border-color: #4a2e1b; background: #f5f0e8; }
    .stepper-num { width: 28px; height: 28px; border-radius: 50%; background: #e6e2d9; color: #50443e; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
    .stepper-btn.active .stepper-num { background: #944928; color: white; }
    .stepper-btn.done .stepper-num { background: #4a2e1b; color: white; }
    .stepper-label { font-size: 11px; font-weight: 600; color: #50443e; text-align: center; }
    .stepper-btn.active .stepper-label { color: #412311; }
    .step-content { animation: fadeIn .3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .action-bar { display: flex; justify-content: space-between; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e6e2d9; }
    .btn { padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: 0; cursor: pointer; transition: .2s ease; display: inline-flex; align-items: center; gap: 8px; justify-content: center; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-primary { background: #412311; color: white; flex: 1; }
    .btn-primary:hover:not(:disabled) { background: #5a3825; }
    .btn-secondary { background: transparent; color: #412311; border: 1px solid #e6e2d9; }
    .btn-secondary:hover:not(:disabled) { background: #f5f0e8; }
    @media (max-width: 640px) { .stepper { display: none; } .action-bar { flex-direction: column-reverse; } }
  `],
})
export class OnboardingComponent implements OnInit {
  stepLabels = ['Cuenta', 'Identidad', 'Ubicación', 'Servicios', 'Marca', 'Activación']

  constructor(public store: OnboardingStore) {}

  ngOnInit(): void {}

  get nextButtonLabel(): string {
    const labels = [
      'Continuar a Identidad del Negocio',
      'Continuar a Ubicación y Contacto',
      'Continuar a Horarios y Servicios',
      'Continuar a Marca y Presencia',
      'Continuar a Resumen y Activación',
      'Activar Atelier Ahora',
    ]
    return labels[this.store.currentStep() - 1]
  }

  goToStep(step: number): void {
    if (step <= this.store.currentStep()) {
      this.store.setStep(step as OnboardingStep)
    }
  }

  nextStep(): void {
    const current = this.store.currentStep()
    if (current >= this.store.totalSteps) return
    this.store.nextStep()
  }
}
