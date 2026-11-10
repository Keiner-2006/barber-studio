import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { OnboardingStore } from '../onboarding.store'
import { ONB_STYLES } from '../onboarding.ui'
import { OwnerDocumentType } from '../onboarding.models'

@Component({
  selector: 'app-onboarding-step-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-symbols-outlined" aria-hidden="true">person</span>
          Paso 1 de {{ store.totalSteps }} · Cuenta del propietario
        </span>
        <h2>Crea tu cuenta de propietario</h2>
        <p>Con esta cuenta entrarás a tu panel para gestionar agenda, clientes, caja e inventario.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form" novalidate>
        <p class="section-title">Datos personales</p>
        <div class="form-row">
        <div class="form-group">
          <label for="name">Nombre *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">person</span>
            <input id="name" [(ngModel)]="account().name" name="name" placeholder="Tu nombre" required autocomplete="given-name" />
          </div>
        </div>

        <div class="form-group">
          <label for="lastName">Apellido *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">person</span>
            <input id="lastName" [(ngModel)]="account().lastName" name="lastName" placeholder="Tu apellido" required autocomplete="family-name" />
          </div>
        </div>
        </div>

        <p class="section-title">Acceso</p>

        <div class="form-group">
          <label for="email">Correo electrónico *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">mail</span>
            <input id="email" type="email" [(ngModel)]="account().email" name="email" placeholder="tu@correo.com" required autocomplete="email" [readonly]="!!store.userId()" />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Contraseña *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">lock</span>
            <input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="account().password" name="password" placeholder="Mínimo 8 caracteres" required minlength="8" autocomplete="new-password" [readonly]="!!store.userId()" />
            <button type="button" class="toggle-pwd" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="showPassword">
              <span class="material-symbols-outlined" aria-hidden="true">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <p class="section-title">Identificación y contacto</p>
        <div class="form-row">
          <div class="form-group">
            <label for="documentType">Tipo de documento *</label>
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
            <label for="documentNumber">Número de documento *</label>
            <div class="input-wrap">
              <input id="documentNumber" [(ngModel)]="account().documentNumber" name="documentNumber" placeholder="ej. 1001234567" required minlength="5" maxlength="15" />
            </div>
          </div>
        </div>

        <div class="form-row">
        <div class="form-group">
          <label for="phone">Celular *</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">phone</span>
            <input id="phone" type="tel" [(ngModel)]="account().phone" name="phone" placeholder="+57 300 123 4567" required />
          </div>
          <span class="hint">Con código de país, ej. +57 300 123 4567.</span>
        </div>

        <div class="form-group">
          <label for="whatsapp">WhatsApp</label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">smartphone</span>
            <input id="whatsapp" type="tel" [(ngModel)]="account().whatsapp" name="whatsapp" placeholder="+57 300 123 4567" />
          </div>
          <span class="hint">Personal y opcional; el del negocio se pide más adelante.</span>
        </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="birthDate">Fecha de nacimiento</label>
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
          <div class="error-message" role="alert"><span class="material-symbols-outlined" aria-hidden="true">error</span>{{ store.registrationError() }}</div>
        }

        @if (validationError) {
          <div class="error-message" role="alert"><span class="material-symbols-outlined" aria-hidden="true">error</span>{{ validationError }}</div>
        }

        <button class="btn btn-primary" type="submit" [disabled]="store.submitting()">
          {{ store.submitting() ? 'Creando cuenta…' : 'Crear cuenta y continuar' }}
          @if (!store.submitting()) { <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span> }
        </button>

        <p class="login-link">
          ¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a>
        </p>
      </form>
    </section>
  `,
  styles: [ONB_STYLES, `
    .toggle-pwd { align-items: center; background: none; border: 0; border-radius: 10px; color: #8a7a6f; cursor: pointer; display: flex; height: 44px; justify-content: center; margin-right: 4px; width: 44px; }
    .toggle-pwd:hover { color: var(--ink); }
    .remember { align-items: flex-start; color: var(--muted); cursor: pointer; display: flex; font-size: 14px; font-weight: 500; gap: 10px; }
    .remember input { flex: none; margin-top: 1px; }
    .section-title { color: var(--copper); font-size: 13px; font-weight: 700; letter-spacing: .12em; margin: 6px 0 -6px; text-transform: uppercase; }
    .btn-primary { width: 100%; }
    .login-link { color: var(--muted); font-size: 15px; margin: 0; text-align: center; }
    .login-link a { color: var(--copper); font-weight: 700; }
  `],
})
export class OnboardingStepAccountComponent {
  showPassword = false
  showValidationError = false

  constructor(public store: OnboardingStore) {}

  account() { return this.store.account() }

  get validationError(): string {
    if (!this.showValidationError) return ''

    const account = this.account()
    const missing: string[] = []
    if (!account.name.trim()) missing.push('nombre')
    if (!account.lastName.trim()) missing.push('apellido')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) missing.push('correo válido')
    if (account.password.length < 8) missing.push('contraseña de al menos 8 caracteres')
    if (account.documentNumber.trim().length < 5) missing.push('número de documento de al menos 5 caracteres')
    if (!account.phone.trim()) missing.push('celular')
    if (!this.store.termsAccepted()) missing.push('aceptación del tratamiento de datos')

    return missing.length ? `Revisa estos datos para continuar: ${missing.join(', ')}.` : ''
  }

  onContinue(): void {
    this.showValidationError = true
    if (!this.store.canContinue(1)) return
    this.showValidationError = false
    this.store.registerAndLogin()
  }
}
