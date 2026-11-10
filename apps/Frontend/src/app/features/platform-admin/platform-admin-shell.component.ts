import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { filter } from 'rxjs'
import { ROLE_LABELS, Role } from '@navaja/shared'
import { AuthService } from '../../core/auth/auth.service'
import { PlatformAdminStore } from './platform-admin.store'
import { initials } from './platform-admin.view-helpers'

interface NavItem {
  label: string
  icon: string
  path: string
  exact: boolean
}

@Component({
  selector: 'app-platform-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="side" [class.open]="menuOpen()" aria-label="Menú de la consola">
        <div class="glow" aria-hidden="true"></div>
        <div class="side-top">
          <a routerLink="/platform-admin" class="brand">
            <span class="brand-mark" aria-hidden="true"><span class="material-symbols-outlined">content_cut</span></span>
            <span class="brand-text">BarberShop<small>Consola SaaS</small></span>
          </a>
          <button class="icon-btn close" (click)="menuOpen.set(false)" aria-label="Cerrar menú"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
        </div>

        <nav class="nav">
          <p class="nav-title">Plataforma</p>
          @for (item of nav; track item.path) {
            <a class="nav-item" [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.exact }" #rla="routerLinkActive" [attr.aria-current]="rla.isActive ? 'page' : null">
              <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              @if (item.path === '/platform-admin/negocios' && store.totalTenants() !== null) {
                <span class="count">{{ store.totalTenants() }}</span>
              }
            </a>
          }
          <a class="nav-cta" routerLink="/platform-admin/negocios/nuevo">
            <span class="material-symbols-outlined" aria-hidden="true">add_business</span> Agregar negocio
          </a>
        </nav>

        <div class="side-foot">
          <div class="me">
            <span class="me-avatar" aria-hidden="true">{{ userInitials() }}</span>
            <div class="me-text"><strong>{{ store.viewer()?.name || 'Administrador' }}</strong><small>{{ roleLabel() }}</small></div>
          </div>
          <button class="icon-btn" (click)="onLogout()" aria-label="Cerrar sesión" title="Cerrar sesión"><span class="material-symbols-outlined" aria-hidden="true">logout</span></button>
        </div>
      </aside>

      @if (menuOpen()) { <div class="overlay" (click)="menuOpen.set(false)" aria-hidden="true"></div> }

      <div class="main">
        <header class="topbar">
          <button class="icon-btn hamburger" (click)="menuOpen.set(true)" aria-label="Abrir menú"><span class="material-symbols-outlined" aria-hidden="true">menu</span></button>
          <span class="top-title">Consola de plataforma</span>
        </header>
        <main class="content"><router-outlet /></main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .shell { background: #fbf7ef; color: #1c1c16; display: flex; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
    .material-symbols-outlined { font-size: 20px; line-height: 1; }
    a:focus-visible, button:focus-visible { outline: 3px solid #e09a68; outline-offset: 2px; }

    .side { background: #17100c; bottom: 0; color: #f6eee4; display: flex; flex-direction: column; left: 0; overflow: hidden; position: fixed; top: 0; width: 272px; z-index: 40; transition: transform .3s ease; }
    .glow { background: radial-gradient(320px 260px at 80% 0%, rgba(196,112,63,.35), transparent 70%); inset: 0; pointer-events: none; position: absolute; }
    .side > *:not(.glow) { position: relative; }
    .side-top { align-items: center; display: flex; justify-content: space-between; padding: 22px 18px 18px; }
    .brand { align-items: center; color: inherit; display: flex; gap: 10px; text-decoration: none; }
    .brand-mark { align-items: center; background: linear-gradient(135deg, #e09a68, #c4703f); border-radius: 10px; color: #17100c; display: flex; height: 38px; justify-content: center; width: 38px; }
    .brand-text { display: flex; flex-direction: column; font: 700 20px/1 'Vollkorn', serif; }
    .brand-text small { color: #e09a68; font: 700 11px/1.5 'Plus Jakarta Sans', sans-serif; letter-spacing: .14em; text-transform: uppercase; }

    .nav { display: flex; flex: 1; flex-direction: column; gap: 4px; padding: 8px 12px; }
    .nav-title { color: #a99a8c; font-size: 12px; font-weight: 700; letter-spacing: .14em; margin: 8px 10px; text-transform: uppercase; }
    .nav-item { align-items: center; border-radius: 12px; color: #d9cdc1; display: flex; font-size: 15px; font-weight: 600; gap: 12px; min-height: 44px; padding: 0 12px; text-decoration: none; transition: background .2s, color .2s; }
    .nav-item:hover { background: rgba(255,255,255,.06); color: #fff; }
    .nav-item.active { background: rgba(224,154,104,.16); color: #ffdbca; }
    .nav-item.active .material-symbols-outlined { color: #e09a68; }
    .count { background: rgba(255,255,255,.1); border-radius: 999px; font-size: 12px; margin-left: auto; padding: 2px 8px; }
    .nav-cta { align-items: center; border: 1px dashed rgba(224,154,104,.5); border-radius: 12px; color: #ffdbca; display: flex; font-size: 14px; font-weight: 700; gap: 10px; margin-top: 14px; min-height: 44px; padding: 0 12px; text-decoration: none; }
    .nav-cta:hover { background: rgba(224,154,104,.12); }

    .side-foot { align-items: center; border-top: 1px solid rgba(255,255,255,.08); display: flex; gap: 10px; padding: 16px 14px; }
    .me { align-items: center; display: flex; flex: 1; gap: 10px; min-width: 0; }
    .me-avatar { align-items: center; background: rgba(224,154,104,.2); border-radius: 50%; color: #ffdbca; display: flex; flex: none; font-size: 13px; font-weight: 800; height: 38px; justify-content: center; width: 38px; }
    .me-text { min-width: 0; }
    .me-text strong { display: block; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .me-text small { color: #b9ab9e; display: block; font-size: 12px; }
    .icon-btn { align-items: center; background: none; border: 0; border-radius: 10px; color: inherit; cursor: pointer; display: flex; height: 40px; justify-content: center; width: 40px; }
    .icon-btn:hover { background: rgba(255,255,255,.08); }
    .close, .hamburger { display: none; }

    .main { flex: 1; margin-left: 272px; min-width: 0; }
    .topbar { align-items: center; background: rgba(251,247,239,.85); backdrop-filter: blur(10px); border-bottom: 1px solid #e6dccc; display: flex; gap: 12px; height: 60px; padding: 0 clamp(16px, 3vw, 32px); position: sticky; top: 0; z-index: 20; }
    .top-title { color: #5e5149; font-size: 14px; font-weight: 600; }
    .overlay { background: rgba(0,0,0,.45); inset: 0; position: fixed; z-index: 30; }

    @media (max-width: 1023px) {
      .side { transform: translateX(-100%); }
      .side.open { transform: none; }
      .main { margin-left: 0; }
      .close, .hamburger { display: flex; }
      .hamburger { color: #2a1b12; }
      .hamburger:hover { background: #f1ece4; }
    }
    @media (prefers-reduced-motion: reduce) { .side { transition: none; } }
  `],
})
export class PlatformAdminShellComponent implements OnInit {
  readonly menuOpen = signal(false)
  readonly store = inject(PlatformAdminStore)
  private router = inject(Router)
  private auth = inject(AuthService)

  readonly nav: NavItem[] = [
    { label: 'Resumen', icon: 'space_dashboard', path: '/platform-admin', exact: true },
    { label: 'Negocios registrados', icon: 'storefront', path: '/platform-admin/negocios', exact: false },
    { label: 'Propietarios', icon: 'groups', path: '/platform-admin/clientes', exact: false },
  ]

  readonly roleLabel = computed(() => {
    const role = this.store.viewer()?.role as Role | undefined
    return role ? ROLE_LABELS[role] ?? role : 'Plataforma'
  })

  readonly userInitials = computed(() => initials(this.store.viewer()?.name || 'Admin'))

  constructor() {
    // Close the mobile drawer after navigating.
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.menuOpen.set(false))
  }

  ngOnInit(): void {
    this.store.load()
  }

  onLogout(): void {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    })
  }
}
