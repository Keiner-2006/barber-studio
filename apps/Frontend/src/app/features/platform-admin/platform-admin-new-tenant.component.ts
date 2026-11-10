import { Component, inject, signal } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { PlatformAdminApi } from './platform-admin.api'
import { PlatformAdminStore } from './platform-admin.store'
import { PA_STYLES } from './platform-admin.ui'
import { BUSINESS_TYPE_LABELS, BusinessType, COUNTRY_NAMES, CreateTenantInput } from './platform-admin.models'
import { apiErrorMessage } from './platform-admin.view-helpers'

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

@Component({
  selector: 'app-platform-admin-new-tenant',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="pa narrow">
      <a class="back" routerLink="/platform-admin/negocios"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span> Negocios registrados</a>
      <header class="head">
        <div>
          <p class="eyebrow">Alta manual</p>
          <h1>Agregar negocio<em>.</em></h1>
          <p class="sub">Crea una barbería para un propietario que ya tiene cuenta. Queda activa y con su primera sede.</p>
        </div>
      </header>

      <div class="alert info">
        <span class="material-symbols-outlined" aria-hidden="true">info</span>
        <span class="grow">
          ¿El propietario aún no tiene cuenta? Lo ideal es que se inscriba él mismo: así crea su contraseña y carga horarios, servicios y marca.
          <br /><button type="button" class="linkish" (click)="copyLink()">{{ copied() ? '¡Enlace copiado!' : 'Copiar enlace de inscripción' }}</button>
        </span>
      </div>

      <form #f="ngForm" (ngSubmit)="submit(f)" novalidate>
        <section class="card">
          <h2>Negocio</h2>
          <div class="grid">
            <div class="field span-2">
              <label for="tradeName">Nombre comercial *</label>
              <input id="tradeName" class="input" name="tradeName" [(ngModel)]="form.tradeName" (ngModelChange)="onName($event)" required minlength="2" maxlength="150" placeholder="Ej.: Barbería El Tano" />
            </div>
            <div class="field span-2">
              <label for="legalName">Razón social *</label>
              <input id="legalName" class="input" name="legalName" [(ngModel)]="form.legalName" required minlength="2" maxlength="150" placeholder="Ej.: El Tano S.A.S." />
            </div>
            <div class="field span-2">
              <label for="slug">Dirección web (slug) *</label>
              <div class="prefix"><span>/b/</span><input id="slug" class="input" name="slug" [(ngModel)]="form.slug" (ngModelChange)="slugTouched = true" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="100" /></div>
              <p class="hint">Solo minúsculas, números y guiones. Será la página pública del negocio.</p>
            </div>
            <div class="field">
              <label for="businessType">Tipo *</label>
              <select id="businessType" class="input" name="businessType" [(ngModel)]="form.businessType" required>
                @for (t of businessTypes; track t.value) { <option [value]="t.value">{{ t.label }}</option> }
              </select>
            </div>
            <div class="field">
              <label for="country">País *</label>
              <select id="country" class="input" name="countryCode" [(ngModel)]="form.countryCode" required>
                @for (c of countries; track c.code) { <option [value]="c.code">{{ c.name }}</option> }
              </select>
            </div>
          </div>
        </section>

        <section class="card">
          <h2>Propietario y contacto</h2>
          <div class="grid">
            <div class="field span-2">
              <label for="ownerEmail">Correo del propietario *</label>
              <input id="ownerEmail" class="input" type="email" name="ownerEmail" [(ngModel)]="form.ownerEmail" required email autocomplete="off" placeholder="propietario@correo.com" />
              <p class="hint">Debe ser el correo con el que el propietario ya inició sesión en la plataforma.</p>
            </div>
            <div class="field">
              <label for="whatsapp">WhatsApp del negocio</label>
              <input id="whatsapp" class="input" type="tel" name="whatsapp" [(ngModel)]="form.whatsapp" maxlength="30" placeholder="+573001234567" />
            </div>
            <div class="field">
              <label for="phone">Teléfono</label>
              <input id="phone" class="input" type="tel" name="phone" [(ngModel)]="form.phone" maxlength="30" />
            </div>
            <div class="field">
              <label for="city">Ciudad</label>
              <input id="city" class="input" name="city" [(ngModel)]="form.city" maxlength="100" />
            </div>
            <div class="field">
              <label for="address">Dirección</label>
              <input id="address" class="input" name="address" [(ngModel)]="form.address" maxlength="200" />
            </div>
          </div>
        </section>

        @if (error(); as e) {
          <div class="alert error" role="alert"><span class="material-symbols-outlined" aria-hidden="true">error</span><span class="grow">{{ e }}</span></div>
        }
        @if (f.submitted && f.invalid) {
          <p class="err" role="alert">Revisa los campos marcados con * : nombre, razón social, slug válido y correo del propietario.</p>
        }

        <div class="submit-row">
          <a class="btn" routerLink="/platform-admin/negocios">Cancelar</a>
          <button class="btn btn-primary" type="submit" [disabled]="saving()">
            {{ saving() ? 'Creando…' : 'Crear negocio' }} <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [PA_STYLES, `
    .narrow { max-width: 860px; }
    .back { align-items: center; color: var(--muted); display: inline-flex; font-size: 14px; font-weight: 600; gap: 6px; margin-bottom: 12px; text-decoration: none; }
    .back:hover { color: var(--copper); }
    form { display: grid; gap: 16px; }
    .card h2 { margin-bottom: 14px; }
    .grid { display: grid; gap: 14px 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .span-2 { grid-column: span 2; }
    .prefix { align-items: center; display: flex; }
    .prefix span { background: var(--paper); border: 1.5px solid var(--line); border-radius: 12px 0 0 12px; border-right: 0; color: var(--muted); font-weight: 600; min-height: 44px; padding: 11px 10px 0; }
    .prefix .input { border-radius: 0 12px 12px 0; }
    .linkish { background: none; border: 0; color: var(--copper); cursor: pointer; font: 700 14px 'Plus Jakarta Sans', sans-serif; margin-top: 6px; padding: 0; text-decoration: underline; }
    .submit-row { display: flex; gap: 10px; justify-content: flex-end; }
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched, form.ng-submitted .ng-invalid { border-color: #c0392b; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } .submit-row .btn { flex: 1; } }
  `],
})
export class PlatformAdminNewTenantComponent {
  private api = inject(PlatformAdminApi)
  private store = inject(PlatformAdminStore)
  private router = inject(Router)

  readonly saving = signal(false)
  readonly error = signal<string | null>(null)
  readonly copied = signal(false)
  slugTouched = false

  form: CreateTenantInput = {
    tradeName: '',
    legalName: '',
    slug: '',
    businessType: 'barberia',
    countryCode: 'CO',
    ownerEmail: '',
    phone: '',
    whatsapp: '',
    city: '',
    address: '',
  }

  readonly businessTypes = (Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((value) => ({ value, label: BUSINESS_TYPE_LABELS[value] }))
  readonly countries = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({ code, name }))

  onName(name: string): void {
    if (!this.slugTouched) this.form.slug = slugify(name)
  }

  copyLink(): void {
    navigator.clipboard?.writeText(`${location.origin}/onboarding`).then(() => {
      this.copied.set(true)
      setTimeout(() => this.copied.set(false), 2500)
    })
  }

  submit(f: NgForm): void {
    if (f.invalid || this.saving()) return
    this.saving.set(true)
    this.error.set(null)
    // Send only filled optional fields.
    const body = Object.fromEntries(Object.entries(this.form).filter(([, v]) => v !== '')) as unknown as CreateTenantInput
    this.api.createTenant(body).subscribe({
      next: (res) => {
        this.saving.set(false)
        this.store.refresh()
        this.router.navigate(['/platform-admin/negocios', res.data.id])
      },
      error: (err) => {
        this.saving.set(false)
        this.error.set(apiErrorMessage(err, 'No se pudo crear el negocio'))
      },
    })
  }
}
