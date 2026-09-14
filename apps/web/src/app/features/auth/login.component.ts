import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="login-page">
      <div class="login-frame">
        <section class="editorial-panel">
          <div class="panel-photo"></div>
          <div class="panel-content">
            <div class="studio-location"><i></i> SEDE ROMA NORTE · CDMX</div>
            <div class="panel-message"><span class="pill">✂ Artisan Grooming & Atelier</span><h1>La artesanía del detalle en cada corte.</h1><p>Plataforma centralizada para reservas exclusivas, gestión de agenda artesanal y membresías de cuidado personal.</p></div>
            <div class="panel-status"><span><b>✓</b><span><strong>Studio OS v2.4 Activo</strong><small>Disponibilidad en tiempo real</small></span></span><em>ABIERTO HOY</em></div>
          </div>
        </section>
        <section class="form-panel">
          <div class="form-brand"><a routerLink="/" class="brand-name"><span>✂</span><span><strong>Navaja Studio</strong><small>PORTAL DE CLIENTES & STUDIO OS</small></span></a><span class="location-chip"><i></i> Roma Norte</span></div>
          <div class="form-content">
            <div class="role-tabs"><button [class.active]="role === 'client'" (click)="role = 'client'" type="button">◉ Acceso Clientes</button><button [class.active]="role === 'staff'" (click)="role = 'staff'" type="button">▣ Equipo / Studio OS</button></div>
            <div class="role-notice"><span>ⓘ</span><p>{{ role === 'client' ? 'Inicia sesión para gestionar tus citas programadas, consultar membresías activas y canjear puntos de fidelidad.' : 'Acceso restringido para maestros barberos, recepcionistas y administración de la sede Roma Norte.' }}</p></div>
            <form (ngSubmit)="onLogin()">
              <label for="email">{{ role === 'client' ? 'Correo electrónico o teléfono celular' : 'ID de Barbero / Correo de Colaborador' }}</label>
              <div class="input-wrap"><span>✉</span><input id="email" type="email" [(ngModel)]="email" name="email" placeholder="ejemplo@correo.com" required /></div>
              <div class="password-label"><label for="password">Contraseña</label><a href="#" (click)="$event.preventDefault()">¿Olvidaste tu contraseña?</a></div>
              <div class="input-wrap"><span>⌑</span><input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Ingresa tu clave de acceso" required /><button type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">{{ showPassword ? '◉' : '◌' }}</button></div>
              <label class="remember"><input type="checkbox" [(ngModel)]="remember" name="remember" /> <span>Mantener sesión iniciada en este dispositivo</span></label>
              @if (error) { <div class="error-message">{{ error }}</div> }
              <button class="submit-button" type="submit" [disabled]="loading">{{ loading ? 'Ingresando...' : '↪  Iniciar Sesión' }}</button>
            </form>
            <div class="divider"><span>O continúa con</span></div>
            <div class="sso-grid"><button type="button">● Google</button><button type="button">● Apple</button></div>
            <div class="new-customer"><span class="diamond">◆</span><div><strong>¿Eres nuevo en Navaja Studio?</strong><p>Crea tu perfil en 1 minuto para agendar y acumular puntos de fidelidad.</p></div><button type="button">Registrarme</button></div>
          </div>
          <div class="form-footer"><span>⌑ Conexión cifrada de extremo a extremo</span><span>Navaja Studio v2.4 · <a href="#" (click)="$event.preventDefault()">Privacidad</a></span></div>
        </section>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; }.login-page { --ink: #412311; --deep: #5a3825; --brown: #944928; --cream: #fdf9f0; --paper: #f7f3ea; --line: #e6e2d9; background: var(--cream); color: #1c1c16; font: 14px/1.5 'Plus Jakarta Sans', sans-serif; min-height: 100vh; padding: clamp(16px, 4vw, 48px); }.login-frame { display: grid; grid-template-columns: .9fr 1.25fr; margin: auto; max-width: 1220px; min-height: min(820px, calc(100vh - 96px)); overflow: hidden; }.editorial-panel { background: var(--ink); color: white; min-height: 640px; overflow: hidden; position: relative; }.panel-photo { background: linear-gradient(#41231177, #412311ee), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAP_LQoKkJ61NOcSttL30yE_nctSqmv6rC06dWfSU5MmJ1bhCRTvNu9gkxhAUAXKIZuKEXWauaZyZ8kaEm4Q7mhvdgJ0xcTQz7rDaBKwY57bm0o07DFmAmMiiQg0t7XLp11iK3_QgWPvaXe62TwCVly_MBZS9fI7ZelKg3If6-T3qk5yBq_EtwUGbzws9v3h4ItEchj-O6j4MPi92jLa7uHJoI3mtAKGAsJeVP8q7UX9gsVBbcJw73JZg') center/cover; inset: 0; opacity: .32; position: absolute; }.panel-content { display: flex; flex-direction: column; height: 100%; justify-content: space-between; min-height: 640px; padding: clamp(28px, 4vw, 54px); position: relative; }.studio-location { color: #eebca2; font-size: 10px; font-weight: 700; letter-spacing: .13em; }.studio-location i, .location-chip i { background: #fe9e76; border-radius: 50%; display: inline-block; height: 8px; margin-right: 7px; width: 8px; }.panel-message { margin: auto 0; max-width: 380px; }.pill { background: #fdf9f01c; border: 1px solid #fdf9f022; border-radius: 999px; color: #ffb598; display: inline-block; font-size: 11px; padding: 8px 12px; }.panel-message h1 { color: #ffdbca; font: 700 clamp(32px, 4vw, 48px)/1.1 'Vollkorn', serif; margin: 20px 0 16px; }.panel-message p { color: #ece8df; line-height: 1.7; }.panel-status { align-items: center; background: #5a382588; border-radius: 8px; display: flex; justify-content: space-between; padding: 14px; }.panel-status > span { align-items: center; display: flex; gap: 10px; }.panel-status b { align-items: center; background: #014a2f; border-radius: 50%; display: flex; height: 30px; justify-content: center; width: 30px; }.panel-status strong, .panel-status small { display: block; }.panel-status strong { font-size: 12px; }.panel-status small { color: #ece8df; font-size: 11px; margin-top: 3px; }.panel-status em { background: var(--brown); border-radius: 999px; font-size: 9px; font-style: normal; font-weight: 700; padding: 5px 8px; }.form-panel { background: white; display: flex; flex-direction: column; justify-content: space-between; padding: clamp(24px, 4vw, 58px); }.form-brand { align-items: start; display: flex; justify-content: space-between; }.brand-name { align-items: center; color: var(--ink); display: flex; gap: 10px; text-decoration: none; }.brand-name > span:first-child { align-items: center; background: var(--deep); border-radius: 8px; color: #ffdbca; display: flex; font-size: 21px; height: 40px; justify-content: center; width: 40px; }.brand-name strong, .brand-name small { display: block; }.brand-name strong { font: 600 23px 'Vollkorn', serif; }.brand-name small { color: #83746d; font-size: 9px; font-weight: 700; letter-spacing: .1em; margin-top: 2px; }.location-chip { background: var(--paper); border-radius: 999px; color: #50443e; font-size: 11px; padding: 7px 10px; }.location-chip i { background: #014a2f; height: 7px; width: 7px; }.form-content { margin: auto; max-width: 510px; padding: 44px 0; width: 100%; }.role-tabs { background: #ece8df; border-radius: 10px; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; }.role-tabs button { background: transparent; border: 0; border-radius: 7px; color: #50443e; cursor: pointer; font: 600 12px 'Plus Jakarta Sans', sans-serif; padding: 11px 5px; }.role-tabs button.active { background: var(--deep); box-shadow: 0 2px 8px #4a2e1b1f; color: white; }.role-notice { align-items: start; background: var(--paper); border-radius: 8px; color: var(--brown); display: flex; gap: 10px; margin: 18px 0; padding: 12px; }.role-notice p { color: #50443e; font-size: 12px; margin: 0; }.form-content form > label, .password-label label { color: #1c1c16; display: block; font-size: 12px; font-weight: 700; margin: 0 0 6px; }.input-wrap { align-items: center; background: var(--paper); border-radius: 8px; display: flex; margin-bottom: 17px; }.input-wrap > span { color: #83746d; padding-left: 13px; }.input-wrap input { background: transparent; border: 0; color: #1c1c16; font: 14px 'Plus Jakarta Sans', sans-serif; outline: 0; padding: 13px 10px; width: 100%; }.input-wrap input:focus { box-shadow: inset 0 0 0 2px #5a382544; }.input-wrap button { background: transparent; border: 0; color: #83746d; cursor: pointer; padding: 10px 13px; }.password-label { align-items: center; display: flex; justify-content: space-between; }.password-label a { color: var(--brown); font-size: 11px; }.remember { align-items: center; color: #50443e; display: flex; font-size: 12px; gap: 8px; margin: 6px 0 17px; }.remember input { accent-color: var(--deep); }.error-message { background: #fff0ee; border-radius: 7px; color: #93000a; font-size: 12px; margin-bottom: 14px; padding: 10px; }.submit-button { background: var(--deep); border: 0; border-radius: 8px; color: white; cursor: pointer; font: 700 14px 'Plus Jakarta Sans', sans-serif; padding: 14px; width: 100%; }.submit-button:hover:not(:disabled) { background: var(--ink); }.submit-button:disabled { cursor: wait; opacity: .65; }.divider { align-items: center; display: flex; margin: 24px 0 14px; text-align: center; }.divider:before, .divider:after { background: var(--line); content: ''; flex: 1; height: 1px; }.divider span { color: #83746d; font-size: 10px; letter-spacing: .1em; padding: 0 12px; text-transform: uppercase; }.sso-grid { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }.sso-grid button, .new-customer button { background: var(--paper); border: 0; border-radius: 8px; color: #1c1c16; cursor: pointer; font: 600 12px 'Plus Jakarta Sans', sans-serif; padding: 12px; }.new-customer { align-items: center; background: #ece8df; border-radius: 10px; display: flex; gap: 10px; margin-top: 20px; padding: 13px; }.diamond { color: var(--brown); font-size: 19px; }.new-customer strong { font-size: 12px; }.new-customer p { color: #50443e; font-size: 11px; margin: 3px 0 0; }.new-customer button { margin-left: auto; white-space: nowrap; }.form-footer { color: #50443e; display: flex; font-size: 10px; justify-content: space-between; }.form-footer a { color: inherit; }.form-footer span:last-child { color: #83746d; }
    @media (max-width: 800px) { .login-frame { display: block; min-height: auto; }.editorial-panel { display: none; }.form-panel { min-height: calc(100vh - 32px); }.form-footer { gap: 12px; flex-direction: column; text-align: center; } }
    @media (max-width: 480px) { .login-page { padding: 0; }.form-panel { padding: 22px 18px; }.location-chip { display: none; }.form-content { padding: 34px 0; }.new-customer { align-items: start; flex-wrap: wrap; }.new-customer button { margin-left: auto; }.role-tabs button { font-size: 11px; } }
  `],
})
export class LoginComponent {
  email = ''
  password = ''
  loading = false
  error = ''
  role: 'client' | 'staff' = 'client'
  showPassword = false
  remember = true

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.email || !this.password) return
    this.loading = true
    this.error = ''
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Credenciales incorrectas' },
    })
  }
}
