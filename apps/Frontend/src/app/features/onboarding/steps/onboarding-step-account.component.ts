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
            <input id="email" type="email" [(ngModel)]="account().email" name="email" placeholder="tu@mail.com" required [readonly]="!!store.userId()" />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Contraseña *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">lock</span>
            <input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="account().password" name="password" placeholder="Mínimo 8 caracteres" required minlength="8" [readonly]="!!store.userId()" />
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

        <div class="form-group">
          <label for="whatsapp">WhatsApp</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">smartphone</span>
            <input id="whatsapp" type="tel" [(ngModel)]="account().whatsapp" name="whatsapp" placeholder="+57 300 123 4567" />
          </div>
          <span class="hint">Número de WhatsApp para reservas y contacto directo (opcional).</span>
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
            <input type="checkbox" [ngModel]="store.termsAccepted()" (ngModelChange)="store.setTermsAccepted($event)" name="acceptTerms" required />
            <span>Acepto el tratamiento de mis datos personales para crear y administrar mi cuenta.</span>
          </label>
        </div>

        @if (store.registrationError()) {
          <div class="error-message" role="alert">{{ store.registrationError() }}</div>
        }

        <button class="btn btn-primary" type="submit" [disabled]="store.submitting()">
          {{ store.submitting() ? 'Creando cuenta...' : 'Continuar →' }}
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
    .error-message { background: #fff0ee; border-radius: 7px; color: #93000a; font-size: 12px; padding: 10px; }
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

  constructor(public store: OnboardingStore) {}

  account() { return this.store.account() }

  onContinue(): void {
    if (!this.store.canContinue(1)) return
    this.store.registerAndLogin()
  }
}
