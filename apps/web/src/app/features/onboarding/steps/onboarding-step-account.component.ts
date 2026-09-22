import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { OnboardingStore } from '../onboarding.store'

@Component({
  selector: 'app-onboarding-step-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-icons text-sm">person</span>
          Paso 1 de {{ store.totalSteps }} · Cuenta del Propietario
        </span>
        <h2>Crea tu cuenta de administrador</h2>
        <p>Ingresa tus datos para acceder a la plataforma y administrar tu barbería.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form">
        <div class="form-group">
          <label for="name">Nombre completo *</label>
          <div class="input-wrap">
            <span class="material-icons">person</span>
            <input id="name" [(ngModel)]="account().name" name="name" placeholder="Tu nombre completo" required />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico *</label>
          <div class="input-wrap">
            <span class="material-icons">mail</span>
            <input id="email" type="email" [(ngModel)]="account().email" name="email" placeholder="tu@mail.com" required />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Contraseña *</label>
          <div class="input-wrap">
            <span class="material-icons">lock</span>
            <input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="account().password" name="password" placeholder="Mínimo 8 caracteres" required minlength="8" />
            <button type="button" class="toggle-pwd" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              {{ showPassword ? '◉' : '◌' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="remember">
            <input type="checkbox" [(ngModel)]="acceptTerms" name="acceptTerms" required />
            <span>Acepto los <a href="#" (click)="$event.preventDefault()">Términos de Uso</a> y <a href="#" (click)="$event.preventDefault()">Política de Privacidad</a></span>
          </label>
        </div>

        <button class="btn btn-primary" type="submit" [disabled]="store.submitting()">
          Crear cuenta y continuar →
        </button>

        <p class="login-link">
          ¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a>
        </p>
      </form>
    </section>
  `,
  styles: [`
    .step-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 3px 20px #4a2e1b0d; max-width: 480px; margin: 0 auto; }
    .step-header { margin-bottom: 28px; text-align: center; }
    .step-badge { display: inline-flex; align-items: center; gap: 6px; color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
    .step-header h2 { color: #412311; font: 700 28px/1.1 'Vollkorn', serif; margin: 8px 0; }
    .step-header p { color: #50443e; font-size: 14px; margin: 0; }
    .step-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { color: #412311; font-size: 13px; font-weight: 700; }
    .remember { display: flex; align-items: flex-start; gap: 10px; font-size: 12px; font-weight: 400; color: #50443e; cursor: pointer; }
    .remember input { margin-top: 2px; accent-color: #944928; }
    .remember a { color: #944928; }
    .input-wrap { display: flex; align-items: center; position: relative; }
    .input-wrap .material-icons { position: absolute; left: 12px; color: #50443e; font-size: 18px; }
    .input-wrap input { width: 100%; padding: 12px 14px 12px 38px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .input-wrap input:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .toggle-pwd { position: absolute; right: 12px; background: none; border: none; color: #50443e; cursor: pointer; font-size: 16px; }
    .btn { padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: 0; cursor: pointer; transition: .2s ease; display: inline-flex; align-items: center; gap: 8px; justify-content: center; width: 100%; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-primary { background: #412311; color: white; }
    .btn-primary:hover:not(:disabled) { background: #5a3825; }
    .login-link { text-align: center; font-size: 13px; color: #50443e; margin: 0; }
    .login-link a { color: #944928; font-weight: 600; text-decoration: none; }
  `],
})
export class OnboardingStepAccountComponent {
  showPassword = false
  acceptTerms = false

  constructor(public store: OnboardingStore) {}

  account() { return this.store.account() }

  onContinue(): void {
    if (!this.store.account().name || !this.store.account().email || !this.store.account().password) return
    if (this.store.account().password.length < 8) return
    if (!this.acceptTerms) return
    this.store.setSubmitting(true)
    this.store.registerAndLogin()
  }
}
