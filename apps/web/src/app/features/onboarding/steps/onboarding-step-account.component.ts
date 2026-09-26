import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { OnboardingStore } from '../onboarding.store'
import { OwnerDocumentType } from '../onboarding.models'

@Component({
  selector: 'app-onboarding-step-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-symbols-outlined text-sm">person</span>
          Paso 1 de {{ store.totalSteps }} · Cuenta del Propietario
        </span>
        <h2>Crea tu cuenta de administrador</h2>
        <p>Ingresa tus datos para acceder a la plataforma y administrar tu barbería.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form">
        <div class="form-group">
          <label for="name">Nombre *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">person</span>
            <input id="name" [(ngModel)]="account().name" name="name" placeholder="Tu nombre completo" required />
          </div>
        </div>

        <div class="form-group">
          <label for="lastName">Apellido *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">person</span>
            <input id="lastName" [(ngModel)]="account().lastName" name="lastName" placeholder="Tu apellido" required />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">mail</span>
            <input id="email" type="email" [(ngModel)]="account().email" name="email" placeholder="tu@mail.com" required />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Contraseña *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">lock</span>
            <input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="account().password" name="password" placeholder="Mínimo 8 caracteres" required minlength="8" />
            <button type="button" class="toggle-pwd" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              {{ showPassword ? '◉' : '◌' }}
            </button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="documentType">Tipo de Documento *</label>
            <div class="input-wrap">
              <select id="documentType" [(ngModel)]="account().documentType" name="documentType" required>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="NIT">NIT</option>
                <option value="PA">PA</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="documentNumber">Número de Documento *</label>
            <div class="input-wrap">
              <input id="documentNumber" [(ngModel)]="account().documentNumber" name="documentNumber" placeholder="ej. 1001234567" required minlength="5" maxlength="15" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="phone">Celular *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">phone</span>
            <input id="phone" type="tel" [(ngModel)]="account().phone" name="phone" placeholder="+57 300 123 4567" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="birthDate">Fecha de Nacimiento</label>
            <div class="input-wrap">
              <input id="birthDate" type="date" [(ngModel)]="account().birthDate" name="birthDate" />
            </div>
          </div>

          <div class="form-group">
            <label for="city">Ciudad</label>
            <div class="input-wrap">
              <input id="city" [(ngModel)]="account().city" name="city" placeholder="Ciudad de residencia" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="remember">
            <input type="checkbox" [(ngModel)]="acceptTerms" name="acceptTerms" required />
            <span>Acepto los <a href="#" (click)="$event.preventDefault()">Términos de Uso</a> y <a href="#" (click)="$event.preventDefault()">Política de Privacidad</a>, incluyvo el tratamiento de datos personales conforme a la Ley 1581 de 2012.</span>
          </label>
        </div>

        <button class="btn btn-primary" type="submit" [disabled]="store.submitting()">
          Continuar →
        </button>

        <div class="divider"><span>O regístrate con</span></div>
        <button type="button" class="sso-btn-google" (click)="store.signUpWithGoogle()">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continuar con Google
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
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
    .remember { display: flex; align-items: flex-start; gap: 10px; font-size: 12px; font-weight: 400; color: #50443e; cursor: pointer; }
    .remember input { margin-top: 2px; accent-color: #944928; }
    .remember a { color: #944928; }
    .input-wrap { display: flex; align-items: center; position: relative; }
    .input-wrap .material-symbols-outlined { position: absolute; left: 12px; color: #50443e; font-size: 18px; user-select: none; }
    .input-wrap input, .input-wrap select { width: 100%; padding: 12px 38px 12px 38px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .input-wrap input:focus, .input-wrap select:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .toggle-pwd { position: absolute; right: 12px; background: none; border: none; color: #50443e; cursor: pointer; font-size: 16px; }
    .btn { padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: 0; cursor: pointer; transition: .2s ease; display: inline-flex; align-items: center; gap: 8px; justify-content: center; width: 100%; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-primary { background: #412311; color: white; }
    .btn-primary:hover:not(:disabled) { background: #5a3825; }
    .login-link { text-align: center; font-size: 13px; color: #50443e; margin: 0; }
    .login-link a { color: #944928; font-weight: 600; text-decoration: none; }
    .divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; font-size: 12px; color: #50443e; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e6e2d9; }
    .sso-btn-google { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 24px; border: 1px solid #dadce0; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; font-weight: 500; color: #3c4043; transition: .2s; width: 100%; }
    .sso-btn-google:hover { background: #f1f3f4; border-color: #babcbc; }
  `],
})
export class OnboardingStepAccountComponent {
  showPassword = false
  acceptTerms = false

  constructor(public store: OnboardingStore) {}

  account() { return this.store.account() }

   onContinue(): void {
    const acc = this.store.account()
    if (!acc.name || !acc.lastName || !acc.email || !acc.password) return
    if (acc.password.length < 8) return
    if (!acc.documentNumber || acc.documentNumber.length < 5) return
    if (!acc.phone) return
    if (!this.acceptTerms) return
    this.store.nextStep()
  }
}
