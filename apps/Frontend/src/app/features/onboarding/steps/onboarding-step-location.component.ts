import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'
import { ONB_STYLES } from '../onboarding.ui'

@Component({
  selector: 'app-onboarding-step-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
          Paso 3 de {{ store.totalSteps }} · Ubicación
        </span>
        <h2>¿Dónde te encuentran tus clientes?</h2>
        <p>Con estos datos creamos tu primera sede y los mostramos en tu página pública.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="city">Ciudad <span class="required">Requerido</span></label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">apartment</span>
              <input id="city" [(ngModel)]="location().city" name="city" placeholder="Ciudad" required maxlength="100" />
            </div>
          </div>

          <div class="form-group">
            <label for="neighborhood">Barrio / Sector</label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">explore</span>
              <input id="neighborhood" [(ngModel)]="location().neighborhood" name="neighborhood" placeholder="Ej. Parque de la 93" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="address">Dirección <span class="required">Requerido</span></label>
          <div class="input-wrap">
            <span class="material-symbols-outlined">pin_drop</span>
            <input id="address" [(ngModel)]="location().address" name="address" placeholder="Ej. Calle 93B # 13 - 45, Local 201" required maxlength="200" />
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="whatsapp">
              WhatsApp del negocio
              <span class="optional">Opcional</span>
            </label>
            <div class="input-wrap whatsapp-input">
                <div class="prefix">{{ countryDialCode }}</div>
                <input id="whatsapp" [(ngModel)]="location().whatsapp" name="whatsapp" placeholder="Número de contacto" type="tel" maxlength="24" />
            </div>
            <span class="hint">El número que verán tus clientes para escribirte o reservar.</span>
          </div>

          <div class="form-group">
            <label for="email">Correo para notificaciones <span class="optional">Opcional</span></label>
            <div class="input-wrap">
              <span class="material-symbols-outlined">mail</span>
              <input id="email" type="email" [(ngModel)]="location().email" name="email" placeholder="citas@tunegocio.co" />
            </div>
          </div>
        </div>

      </form>
    </section>
  `,
  styles: [ONB_STYLES, `
    .whatsapp-input input { padding-left: 12px; }
  `],
})
export class OnboardingStepLocationComponent {
  constructor(public store: OnboardingStore) {}

  location() { return this.store.location() }

  get countryDialCode(): string {
    const dialCodes: Record<string, string> = {
      CO: '+57',
      MX: '+52',
      AR: '+54',
      CL: '+56',
      PE: '+51',
      US: '+1',
      ES: '+34',
    }
    return dialCodes[this.store.business().countryCode] || '+57'
  }

  onContinue(): void {
    if (!this.store.location().city || !this.store.location().address) return
    const raw = (this.store.location().whatsapp || '').trim()
    if (raw) {
      const digits = raw.replace(/\D/g, '')
      const normalized = raw.startsWith('+') ? `+${digits}` : `${this.countryDialCode}${digits}`
      this.store.updateLocation({ whatsapp: normalized })
    }
    this.store.nextStep()
  }
}
