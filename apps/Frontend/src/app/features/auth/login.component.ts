import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'
import { LoginExpectedRole } from '../../core/auth/auth.models'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="login">
      <section class="showcase" aria-hidden="true">
        <div class="glow"></div>
        <div class="grid"></div>
        <a routerLink="/" class="brand" tabindex="-1">
          <span class="brand-mark"><span class="material-symbols-outlined">content_cut</span></span>
          <span class="brand-text">BarberShop<small>Management System</small></span>
        </a>

        <div class="showcase-copy">
          <span class="chip"><span class="material-symbols-outlined">{{ copy.icon }}</span>{{ copy.chip }}</span>
          <h1>{{ copy.title }} <em>{{ copy.accent }}</em></h1>
          <p>{{ copy.body }}</p>
        </div>

        <div class="cards">
          @for (item of copy.items; track item.label) {
            <div class="mini-card">
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <div><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></div>
            </div>
          }
        </div>
      </section>

      <section class="form-side">
        <a routerLink="/" class="back"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span> Volver al inicio</a>

        <div class="form-card">
          <a routerLink="/" class="brand brand-mobile">
            <span class="brand-mark" aria-hidden="true"><span class="material-symbols-outlined">content_cut</span></span>
            <span class="brand-text">BarberShop<small>Management System</small></span>
          </a>

          <h2>Bienvenido de nuevo</h2>
          <p class="subtitle">Ingresa con tu correo y contraseña.</p>

          <div class="segmented" role="radiogroup" aria-label="Tipo de acceso">
            <span class="thumb" [class.right]="expectedRole === 'platform_admin'" aria-hidden="true"></span>
            <button type="button" role="radio" [attr.aria-checked]="expectedRole === 'company_member'" [class.active]="expectedRole === 'company_member'" (click)="setRole('company_member')">
              <span class="material-symbols-outlined" aria-hidden="true">storefront</span> Mi negocio
            </button>
            <button type="button" role="radio" [attr.aria-checked]="expectedRole === 'platform_admin'" [class.active]="expectedRole === 'platform_admin'" (click)="setRole('platform_admin')">
              <span class="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span> Plataforma
            </button>
          </div>

          <form (ngSubmit)="onLogin()" novalidate>
            <label for="email">Correo electrónico</label>
            <div class="field">
              <span class="material-symbols-outlined" aria-hidden="true">mail</span>
              <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="tu-correo@ejemplo.com" autocomplete="email" required />
            </div>

            <label for="password">Contraseña</label>
            <div class="field">
              <span class="material-symbols-outlined" aria-hidden="true">lock</span>
              <input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Tu contraseña" autocomplete="current-password" required />
              <button type="button" class="eye" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="showPassword">
                <span class="material-symbols-outlined" aria-hidden="true">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>

            @if (error) {
              <div class="error" role="alert"><span class="material-symbols-outlined" aria-hidden="true">error</span>{{ error }}</div>
            }

            <button class="submit" type="submit" [disabled]="loading || !email || !password">
              @if (loading) { <span class="spinner" aria-hidden="true"></span> Ingresando… }
              @else { Iniciar sesión <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span> }
            </button>
          </form>

          @if (expectedRole === 'company_member') {
            <div class="register">
              <div><strong>¿Aún no tienes cuenta?</strong><p>Registra tu barbería y tu equipo en minutos.</p></div>
              <a routerLink="/onboarding">Registrarme</a>
            </div>
          }
        </div>

        <p class="footnote"><span class="material-symbols-outlined" aria-hidden="true">verified_user</span> Conexión cifrada · Cada negocio ve solo sus datos</p>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; }
    .login {
      --espresso: #17100c; --ink: #2a1b12; --copper: #c4703f; --copper-2: #e09a68; --copper-soft: #ffdbca;
      --cream: #fbf7ef; --paper: #f3ede1; --line: #e6dccc; --text: #1c1c16; --muted: #5e5149;
      background: var(--cream); color: var(--text); display: grid; font: 16px/1.5 'Plus Jakarta Sans', sans-serif; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-height: 100vh;
    }
    .material-symbols-outlined { font-size: 20px; line-height: 1; }
    a:focus-visible, button:focus-visible { outline: 3px solid var(--copper-2); outline-offset: 3px; }

    /* Showcase */
    .showcase { background: var(--espresso); color: #f6eee4; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: clamp(28px, 4vw, 56px); position: relative; }
    .glow { background: radial-gradient(520px 380px at 80% 20%, rgba(196,112,63,.42), transparent 70%), radial-gradient(460px 340px at 0% 100%, rgba(148,73,40,.35), transparent 70%); inset: 0; position: absolute; }
    .grid { background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 48px 48px; inset: 0; mask-image: radial-gradient(ellipse at 50% 40%, #000 15%, transparent 72%); -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000 15%, transparent 72%); position: absolute; }
    .showcase > *:not(.glow):not(.grid) { position: relative; }
    .brand { align-items: center; color: inherit; display: inline-flex; gap: 10px; text-decoration: none; }
    .brand-mark { align-items: center; background: linear-gradient(135deg, var(--copper-2), var(--copper)); border-radius: 10px; color: var(--espresso); display: flex; height: 38px; justify-content: center; width: 38px; }
    .brand-text { display: flex; flex-direction: column; font: 700 20px/1 'Vollkorn', serif; }
    .brand-text small { font: 600 10px/1.4 'Plus Jakarta Sans', sans-serif; letter-spacing: .14em; opacity: .7; text-transform: uppercase; }
    .showcase-copy { max-width: 30em; padding-block: 48px; }
    .chip { align-items: center; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: 999px; color: var(--copper-soft); display: inline-flex; font-size: 13px; font-weight: 600; gap: 8px; padding: 7px 14px; }
    .chip .material-symbols-outlined { font-size: 18px; }
    .showcase h1 { font: 700 clamp(36px, 4.2vw, 58px)/1.05 'Vollkorn', serif; letter-spacing: -.02em; margin: 22px 0 16px; }
    .showcase h1 em { background: linear-gradient(120deg, var(--copper-soft), var(--copper-2) 50%, var(--copper)); -webkit-background-clip: text; background-clip: text; color: transparent; font-style: italic; }
    .showcase-copy p { color: #d9cdc1; font-size: 17px; margin: 0; }
    .cards { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .mini-card { align-items: center; animation: rise .7s cubic-bezier(.2,.7,.2,1) both; background: rgba(255,255,255,.06); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; display: flex; gap: 12px; padding: 14px; }
    .mini-card:nth-child(2) { animation-delay: .08s; }
    .mini-card:nth-child(3) { animation-delay: .16s; }
    .mini-card .material-symbols-outlined { align-items: center; background: rgba(224,154,104,.16); border-radius: 10px; color: var(--copper-2); display: flex; flex: none; height: 38px; justify-content: center; width: 38px; }
    .mini-card strong { display: block; font-size: 14px; }
    .mini-card small { color: #b9ab9e; display: block; font-size: 13px; }

    /* Form side */
    .form-side { align-items: center; display: flex; flex-direction: column; justify-content: center; padding: clamp(20px, 4vw, 56px) clamp(16px, 4vw, 56px); position: relative; }
    .back { align-items: center; border-radius: 10px; color: var(--muted); display: inline-flex; font-size: 14px; font-weight: 600; gap: 6px; left: clamp(16px, 4vw, 56px); padding: 8px 10px 8px 4px; position: absolute; text-decoration: none; top: clamp(16px, 3vw, 32px); }
    .back:hover { color: var(--copper); }
    .form-card { max-width: 440px; width: 100%; }
    .brand-mobile { color: var(--ink); display: none; margin-bottom: 28px; }
    .form-card h2 { color: var(--ink); font: 700 clamp(32px, 3.4vw, 40px)/1.1 'Vollkorn', serif; margin: 0 0 6px; }
    .subtitle { color: var(--muted); margin: 0 0 28px; }

    .segmented { background: var(--paper); border: 1px solid var(--line); border-radius: 14px; display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 26px; padding: 4px; position: relative; }
    .thumb { background: #fff; border-radius: 10px; box-shadow: 0 4px 14px rgba(42,27,18,.1); inset: 4px auto 4px 4px; position: absolute; transition: transform .25s cubic-bezier(.2,.7,.2,1); width: calc(50% - 4px); }
    .thumb.right { transform: translateX(100%); }
    .segmented button { align-items: center; background: none; border: 0; border-radius: 10px; color: var(--muted); cursor: pointer; display: flex; font: 600 15px 'Plus Jakarta Sans', sans-serif; gap: 8px; justify-content: center; min-height: 44px; position: relative; transition: color .2s; }
    .segmented button.active { color: var(--ink); }
    .segmented button.active .material-symbols-outlined { color: var(--copper); }

    label { color: var(--ink); display: block; font-size: 14px; font-weight: 700; margin: 0 0 8px; }
    .field { align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 14px; display: flex; margin-bottom: 18px; transition: border-color .2s, box-shadow .2s; }
    .field:focus-within { border-color: var(--copper); box-shadow: 0 0 0 4px rgba(196,112,63,.15); }
    .field > .material-symbols-outlined { color: #8a7a6f; padding-left: 14px; }
    .field input { background: transparent; border: 0; color: var(--text); font: 16px 'Plus Jakarta Sans', sans-serif; min-height: 50px; min-width: 0; outline: 0; padding: 0 12px; width: 100%; }
    .field input::placeholder { color: #9c8d82; }
    .eye { align-items: center; background: none; border: 0; border-radius: 10px; color: #8a7a6f; cursor: pointer; display: flex; height: 44px; justify-content: center; margin-right: 4px; width: 44px; }
    .eye:hover { color: var(--ink); }

    .error { align-items: center; background: #fdecea; border: 1px solid #f5c6c0; border-radius: 12px; color: #8c1d12; display: flex; font-size: 14px; gap: 8px; margin-bottom: 16px; padding: 12px 14px; }
    .submit { align-items: center; background: linear-gradient(135deg, var(--copper-2), var(--copper)); border: 0; border-radius: 14px; box-shadow: 0 10px 26px rgba(196,112,63,.32); color: var(--espresso); cursor: pointer; display: flex; font: 700 16px 'Plus Jakarta Sans', sans-serif; gap: 8px; justify-content: center; min-height: 52px; transition: transform .2s, box-shadow .2s, opacity .2s; width: 100%; }
    .submit:hover:not(:disabled) { box-shadow: 0 14px 32px rgba(196,112,63,.42); transform: translateY(-1px); }
    .submit:disabled { box-shadow: none; cursor: not-allowed; opacity: .55; }
    .spinner { animation: spin .8s linear infinite; border: 2px solid rgba(23,16,12,.25); border-radius: 50%; border-top-color: var(--espresso); height: 18px; width: 18px; }

    .register { align-items: center; border: 1px dashed #d8c4ae; border-radius: 16px; display: flex; gap: 14px; justify-content: space-between; margin-top: 24px; padding: 16px 18px; }
    .register strong { color: var(--ink); font-size: 15px; }
    .register p { color: var(--muted); font-size: 14px; margin: 2px 0 0; }
    .register a { border: 1.5px solid var(--ink); border-radius: 12px; color: var(--ink); flex: none; font-size: 14px; font-weight: 700; padding: 10px 16px; text-decoration: none; transition: background .2s, color .2s; }
    .register a:hover { background: var(--ink); color: #fff; }
    .footnote { align-items: center; color: #8a7a6f; display: flex; font-size: 13px; gap: 6px; margin: 32px 0 0; }
    .footnote .material-symbols-outlined { font-size: 16px; }

    @keyframes rise { from { opacity: 0; transform: translateY(16px); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .mini-card, .spinner { animation: none; } .thumb, .submit { transition: none; } }

    @media (max-width: 900px) {
      .login { grid-template-columns: 1fr; }
      .showcase { display: none; }
      .brand-mobile { display: inline-flex; }
      .form-side { min-height: 100vh; padding-top: 72px; }
    }
    @media (max-width: 420px) {
      .register { align-items: stretch; flex-direction: column; }
      .register a { text-align: center; }
      .segmented button { font-size: 14px; }
    }
  `],
})
export class LoginComponent {
  email = ''
  password = ''
  expectedRole: LoginExpectedRole = 'company_member'
  loading = false
  error = ''
  showPassword = false

  private readonly copyByRole = {
    company_member: {
      icon: 'storefront',
      chip: 'Acceso para tu negocio',
      title: 'Tu barbería, lista para',
      accent: 'abrir.',
      body: 'Agenda, clientes, caja e inventario con una sola cuenta. Cada miembro ve lo que le corresponde según su rol.',
      items: [
        { icon: 'calendar_month', label: 'Agenda', detail: 'Citas por barbero' },
        { icon: 'point_of_sale', label: 'Caja', detail: 'Apertura y cierre' },
        { icon: 'group', label: 'Clientes', detail: 'Historial completo' },
      ],
    },
    platform_admin: {
      icon: 'admin_panel_settings',
      chip: 'Consola de la plataforma',
      title: 'Todos los negocios,',
      accent: 'una vista.',
      body: 'Revisa los negocios registrados, búscalos y da de alta nuevos estudios desde la consola SaaS.',
      items: [
        { icon: 'domain', label: 'Negocios', detail: 'Listado y estado' },
        { icon: 'add_business', label: 'Altas', detail: 'Nuevos estudios' },
        { icon: 'search', label: 'Búsqueda', detail: 'Por nombre o slug' },
      ],
    },
  } as const

  get copy() {
    return this.copyByRole[this.expectedRole === 'platform_admin' ? 'platform_admin' : 'company_member']
  }

  constructor(private authService: AuthService, private router: Router) {}

  setRole(role: LoginExpectedRole): void {
    this.expectedRole = role
    this.error = ''
  }

  onLogin(): void {
    if (!this.email || !this.password) return
    this.loading = true
    this.error = ''
    this.authService.login(this.email, this.password, undefined, this.expectedRole).subscribe({
      next: (response) => {
        const role = response?.user?.role
        if (role === 'customer') {
          this.router.navigate(['/booking'])
        } else if (role === 'barber') {
          this.router.navigate(['/agenda'])
        } else if (role === 'platform_admin' || role === 'platform_support') {
          this.router.navigate(['/platform-admin'])
        } else if (role) {
          this.router.navigate(['/dashboard'])
        } else {
          this.loading = false
          this.error = 'No se pudo determinar el rol de esta cuenta.'
        }
      },
      error: (err) => { this.loading = false; this.error = err.error?.message || err.error?.error?.message || 'No se pudo iniciar sesión. Revisa tus credenciales e inténtalo de nuevo.' },
    })
  }
}
