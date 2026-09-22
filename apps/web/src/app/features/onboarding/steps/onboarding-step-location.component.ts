import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { OnboardingStore } from '../onboarding.store'

@Component({
  selector: 'app-onboarding-step-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="step-card">
      <div class="step-header">
        <span class="step-badge">
          <span class="material-icons text-sm">location_on</span>
          Paso 3 de {{ store.totalSteps }} · Sedes y Atención Directa
        </span>
        <h2>Ubicación física y canales de Colombia</h2>
        <p>Centraliza la dirección de tu primer local para el cálculo de distancias y la integración de reservas automáticas por WhatsApp.</p>
      </div>

      <form (ngSubmit)="onContinue()" class="step-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="city">Ciudad / Departamento (Colombia)</label>
            <div class="input-wrap">
              <span class="material-icons">apartment</span>
              <select id="city" [(ngModel)]="location().city" name="city" required>
                <option value="" disabled>Selecciona una ciudad</option>
                @for (c of cities; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
              <span class="material-icons select-arrow">expand_more</span>
            </div>
          </div>

          <div class="form-group">
            <label for="neighborhood">Barrio / Sector</label>
            <div class="input-wrap">
              <span class="material-icons">explore</span>
              <input id="neighborhood" [(ngModel)]="location().neighborhood" name="neighborhood" placeholder="Ej. Parque de la 93" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="address">Dirección Nomenclatura Oficial</label>
          <div class="input-wrap">
            <span class="material-icons">pin_drop</span>
            <input id="address" [(ngModel)]="location().address" name="address" placeholder="Ej. Calle 93B # 13 - 45, Local 201" />
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="whatsapp">
              <span class="material-icons text-sm">chat</span>
              WhatsApp Concierge (Colombia)
              <span class="optional">Recordatorios SMS / WA</span>
            </label>
            <div class="input-wrap whatsapp-input">
              <div class="prefix">🇨🇴 +57</div>
              <input id="whatsapp" [(ngModel)]="location().whatsapp" name="whatsapp" placeholder="300 000 0000" type="tel" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico de Notificaciones</label>
            <div class="input-wrap">
              <span class="material-icons">mail</span>
              <input id="email" type="email" [(ngModel)]="location().email" name="email" placeholder="citas@tunegocio.co" />
            </div>
          </div>
        </div>

        <div class="map-preview">
          <span class="map-title">
            <span class="material-icons text-sm">my_location</span>
            Geolocalización en Google Maps
          </span>
          <div class="map-box">
            <div class="map-overlay">
              <div class="map-info">
                <span class="material-icons text-sm">my_location</span>
                <span>Ubicación Georreferenciada</span>
              </div>
              <span>Lat: 4.6781° N · Lon: -74.0532° W (Zona Rosa Bogotá)</span>
            </div>
          </div>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .step-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 3px 20px #4a2e1b0d; }
    .step-header { margin-bottom: 28px; }
    .step-badge { display: inline-flex; align-items: center; gap: 6px; color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
    .step-header h2 { color: #412311; font: 700 28px/1.1 'Vollkorn', serif; margin: 8px 0; }
    .step-header p { color: #50443e; font-size: 14px; margin: 0; }
    .step-form { display: flex; flex-direction: column; gap: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { color: #412311; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; justify-content: space-between; }
    .optional { color: #50443e; font-size: 10px; font-weight: 400; }
    .input-wrap { display: flex; align-items: center; position: relative; }
    .input-wrap .material-icons { position: absolute; left: 12px; color: #50443e; font-size: 18px; }
    .input-wrap input, .input-wrap select { width: 100%; padding: 12px 14px 12px 38px; border: 1px solid #e6e2d9; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: white; }
    .input-wrap input:focus, .input-wrap select:focus { outline: none; border-color: #944928; box-shadow: 0 0 0 3px #94492822; }
    .select-arrow { position: absolute; right: 12px; color: #50443e; pointer-events: none; font-size: 18px; }
    .hint { font-size: 11px; color: #50443e; }
    .whatsapp-input .prefix { background: #f5f0e8; padding: 12px; font-size: 13px; font-weight: 600; border-right: 1px solid #e6e2d9; white-space: nowrap; }
    .whatsapp-input input { padding-left: 12px; }
    .map-preview { display: flex; flex-direction: column; gap: 8px; }
    .map-title { color: #412311; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
    .map-box { width: 100%; height: 180px; background: #3a3330; border-radius: 8px; position: relative; overflow: hidden; background-image: linear-gradient(rgba(23,18,15,0.6), rgba(23,18,15,0.6)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgB75OGg1b8VsK2BVHjvWb3yfc3_l7bXPenCdMC49PMso0Cz2U972SUDVuwsSm1dPXyKuJTg7JJPemBUa8cEWOy3LKsYX2XTIfiQ4AtYT3ieBTge2BzfzjH4JZ3vcqQkxz-Zfpw9TFYLZadjf3hYauLAy-ITCTxv1sL_gdKUieKtZEnFdNAu_mX-iYFwXzG6rM0HCY10X73Y4KhvoXBkgdN80-9BepDO-PtJTBi5qkh4ncq0CBjRhI0w'); background-size: cover; background-position: center; }
    .map-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .map-info { background: rgba(245,240,232,0.9); padding: 12px 16px; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; }
    .map-info span { color: #412311; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .map-info .text-sm { font-size: 11px; color: #50443e; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class OnboardingStepLocationComponent {
  cities = [
    'Bogotá D.C. (Zona Rosa / Usaquén)',
    'Medellín (El Poblado / Laureles)',
    'Cali (Granada / Peñón)',
    'Barranquilla (Villa Country)',
    'Bucaramanga (Cabecera)',
    'Cartagena (Bocagrande)',
  ]

  constructor(public store: OnboardingStore) {}

  onContinue(): void {
    if (!this.store.location().city || !this.store.location().address) return
    this.store.nextStep()
  }
}
