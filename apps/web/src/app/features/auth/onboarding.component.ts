import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, catchError } from 'rxjs'
import { environment } from '../../../environments/environment'

interface Step {
  title: string
  description: string
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="onboarding-page">
      <div class="onboarding-container">
        <header class="onboarding-header">
          <a routerLink="/" class="brand"><span class="brand-mark">✂</span><span>Navaja Studio <small>OS</small></span></a>
          <span class="step-indicator">Paso {{ currentStep + 1 }} de {{ totalSteps }}</span>
        </header>

        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progressPercent"></div>
        </div>

        @if (currentStep === 0) {
          <section class="onboarding-step">
            <h2>Cuéntanos sobre tu negocio</h2>
            <p>Ingresa los datos básicos de tu barbería o peluquería.</p>
            <form (ngSubmit)="nextStep()">
              <label for="tradeName">Nombre comercial *</label>
              <input id="tradeName" [(ngModel)]="form.tradeName" name="tradeName" placeholder="Ej: Navaja Studio" required />
              <label for="legalName">Nombre legal *</label>
              <input id="legalName" [(ngModel)]="form.legalName" name="legalName" placeholder="Ej: Navaja Studio S.A.S." required />
              <label for="slug">URL / Slug *</label>
              <input id="slug" [(ngModel)]="form.slug" name="slug" placeholder="Ej: navaja-studio" required />
              <label for="businessType">Tipo de negocio *</label>
              <select id="businessType" [(ngModel)]="form.businessType" name="businessType" required>
                <option value="barberia">Barbería</option>
                <option value="peluqueria">Peluquería</option>
                <option value="grooming">Grooming</option>
                <option value="otro">Otro</option>
              </select>
              <label for="phone">Teléfono</label>
              <input id="phone" [(ngModel)]="form.phone" name="phone" placeholder="+57 300 1234567" />
              <button class="button button-dark" type="submit">Siguiente →</button>
            </form>
          </section>
        }

        @if (currentStep === 1) {
          <section class="onboarding-step">
            <h2>Datos del propietario</h2>
            <p>Crea tu cuenta de administrador.</p>
            <form (ngSubmit)="nextStep()">
              <label for="ownerName">Nombre completo *</label>
              <input id="ownerName" [(ngModel)]="form.ownerName" name="ownerName" placeholder="Tu nombre completo" required />
              <label for="email">Correo electrónico *</label>
              <input id="email" type="email" [(ngModel)]="form.email" name="email" placeholder="tuyo@mail.com" required />
              <label for="password">Contraseña *</label>
              <input id="password" type="password" [(ngModel)]="form.password" name="password" placeholder="Mínimo 8 caracteres" required minlength="8" />
              @if (error) { <div class="error-message">{{ error }}</div> }
              <button class="button button-dark" type="submit" [disabled]="loading">Crear cuenta →</button>
            </form>
          </section>
        }

        @if (currentStep === 2) {
          <section class="onboarding-step success-step">
            <div class="success-icon">✓</div>
            <h2>¡Todo listo!</h2>
            <p>Tu barbería <strong>{{ form.tradeName }}</strong> está siendo configurada.</p>
            @if (jobId) {
              <p class="job-info">ID de configuración: <code>{{ jobId }}</code></p>
            }
            <a class="button button-cream" routerLink="/login">Volver al inicio de sesión</a>
          </section>
        }
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; }
    .onboarding-page { background: var(--cream, #fdf9f0); min-height: 100vh; padding: clamp(20px, 5vw, 64px); font: 14px/1.5 'Plus Jakarta Sans', sans-serif; color: #1c1c16; }
    .onboarding-container { max-width: 560px; margin: 0 auto; }
    .onboarding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .brand { align-items: center; color: #412311; display: flex; font: 700 22px/1 'Vollkorn', serif; gap: 10px; text-decoration: none; }
    .brand small { font: 400 11px/1 'Plus Jakarta Sans', sans-serif; color: #944928; margin-left: 4px; }
    .brand-mark { align-items: center; background: #5a3825; border-radius: 8px; color: #ffdbca; display: flex; font: 18px sans-serif; height: 34px; justify-content: center; width: 34px; }
    .step-indicator { color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .05em; }
    .progress-bar { background: #e6e2d9; border-radius: 4px; height: 4px; margin-bottom: 40px; overflow: hidden; }
    .progress-fill { background: #944928; height: 100%; transition: width .3s ease; }
    .onboarding-step { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 3px 20px #4a2e1b0d; }
    .onboarding-step h2 { color: #412311; font: 700 28px/1.1 'Vollkorn', serif; margin: 0 0 8px; }
    .onboarding-step p { color: #50443e; font-size: 14px; margin: 0 0 28px; }
    .onboarding-step label { display: block; color: #412311; font-size: 13px; font-weight: 700; margin: 16px 0 6px; }
    .onboarding-step input, .onboarding-step select { width: 100%; padding: 12px 14px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; margin-bottom: 4px; box-sizing: border-box; }
    .onboarding-step input:focus, .onboarding-step select:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .onboarding-step button { margin-top: 24px; width: 100%; padding: 14px; }
    .error-message { background: #fee; color: #c0392b; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
    .success-step { text-align: center; }
    .success-icon { font-size: 64px; color: #944928; margin-bottom: 16px; }
    .job-info code { background: #f1eee5; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .button { align-items: center; border: 0; border-radius: 8px; display: inline-flex; font-weight: 700; gap: 8px; justify-content: center; padding: 14px 20px; text-decoration: none; transition: .2s ease; }
    .button-dark { background: #412311; color: white; }
    .button-dark:hover { background: #5a3825; }
    .button-dark:disabled { opacity: .5; cursor: not-allowed; }
    .button-cream { background: #fdf9f0; color: #412311; }
  `],
})
export class OnboardingComponent {
  currentStep = 0
  loading = false
  error = ''
  jobId = ''
  totalSteps = 3

  form = {
    tradeName: '',
    legalName: '',
    slug: '',
    businessType: 'barberia' as 'barberia' | 'peluqueria' | 'grooming' | 'otro',
    phone: '',
    ownerName: '',
    email: '',
    password: '',
  }

  get progressPercent(): number {
    return ((this.currentStep) / (this.totalSteps - 1)) * 100
  }

  constructor(private http: HttpClient, private router: Router) {}

  nextStep(): void {
    if (this.currentStep === 0) {
      if (!this.form.tradeName || !this.form.slug) return
    }
    if (this.currentStep === 1) {
      this.submitOnboarding()
      return
    }
    this.currentStep++
  }

  private submitOnboarding(): void {
    this.loading = true
    this.error = ''
    const body = {
      legalName: this.form.legalName,
      tradeName: this.form.tradeName,
      slug: this.form.slug,
      businessType: this.form.businessType,
      email: this.form.email,
      password: this.form.password,
      ownerName: this.form.ownerName,
      phone: this.form.phone || undefined,
    }
    this.http.post<any>(`${environment.apiUrl}/onboarding/tenants`, body)
      .pipe(tap((res) => {
        this.jobId = res.data?.jobId || ''
        this.currentStep++
        this.loading = false
      }))
      .pipe(catchError((err) => {
        this.error = err.error?.error?.message || 'Error al crear el negocio'
        this.loading = false
        return of(null)
      }))
      .subscribe()
  }
}
