import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { ROLE_LABELS, Role } from '@navaja/shared'
import { PlatformAdminStore } from './platform-admin.store'

interface NavItem {
  label: string
  icon: string
  path?: string
  pending?: boolean
}

@Component({
  selector: 'app-platform-admin-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="platform-shell platform-admin">
      <aside class="sidebar" [class.open]="menuOpen()">
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-icon">✂</div>
            <div class="brand-text">
              <p class="brand-name">BarberShop</p>
              <p class="brand-sub">Management System</p>
            </div>
          </div>
          <button class="close-menu" (click)="menuOpen.set(false)">✕</button>
        </div>

        <div class="px-space-md py-space-sm">
          <div class="px-space-sm py-space-xs font-label-sm text-label-sm text-pa-on-surface-variant tracking-wider uppercase font-semibold">Consola de Plataforma</div>
          <nav class="flex flex-col gap-space-xs mt-space-xs">
            @for (item of primaryNav; track item.label) {
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-all text-pa-on-surface-variant hover:bg-pa-surface-container-high hover:text-pa-on-surface font-body-md text-body-md"
              >
                <span class="material-symbols-outlined text-[19px]">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            }
            @for (item of pendingNav; track item.label) {
              <span
                class="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-pa-outline font-body-md text-body-md cursor-not-allowed"
                [title]="item.label + ' — sin endpoint en la API de plataforma'"
              >
                <span class="material-symbols-outlined text-[19px]">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
                <span class="ml-auto font-label-sm text-label-sm uppercase tracking-wider">Pronto</span>
              </span>
            }
          </nav>
        </div>

        <div class="sidebar-footer">
          <div class="p-space-md bg-pa-surface-container-lowest m-space-md rounded-xl">
            <div class="flex items-center justify-between pb-space-xs">
              <div class="flex items-center gap-space-xs">
                <span
                  class="w-2 h-2 rounded-full"
                  [class.bg-pa-primary]="!store.offline()"
                  [class.bg-pa-error]="store.offline()"
                ></span>
                <span class="font-label-sm text-label-sm text-pa-on-surface font-semibold uppercase tracking-wider">API de Plataforma</span>
              </div>
              <span class="font-data-tabular text-data-tabular text-pa-primary font-semibold">{{ apiStateLabel() }}</span>
            </div>
            <div class="flex items-center justify-between text-pa-on-surface-variant pt-space-xs">
              <span class="font-body-sm text-body-sm">Estado Operativo</span>
              <span class="font-label-sm text-label-sm bg-pa-surface-container px-space-xs py-0.5 rounded text-pa-on-surface-variant font-mono">{{ syncLabel() }}</span>
            </div>
          </div>
          <div class="user-info">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-details">
              <p class="user-name">{{ store.viewer()?.name || 'Plataforma' }}</p>
              <p class="user-role">{{ roleLabel() }}</p>
            </div>
          </div>
        </div>
      </aside>

      @if (menuOpen()) {
        <div class="overlay" (click)="menuOpen.set(false)"></div>
      }

      <div class="main">
        <header class="topbar">
          <button class="hamburger" (click)="menuOpen.set(true)">☰</button>
          <div class="topbar-right">
            <div class="flex items-center gap-space-xs bg-pa-surface-container px-space-sm py-1 rounded-full">
              <span
                class="w-2 h-2 rounded-full"
                [class.bg-pa-primary]="!store.offline()"
                [class.animate-ping]="!store.offline()"
                [class.bg-pa-error]="store.offline()"
              ></span>
              <span class="font-label-sm text-label-sm font-semibold text-pa-on-surface">{{ connectionLabel() }}</span>
              @if (store.lastSyncedAt(); as syncedAt) {
                <span class="text-pa-outline font-label-sm text-label-sm">·</span>
                <span class="font-label-sm text-label-sm text-pa-on-surface-variant">Sync {{ syncedAt | date: 'HH:mm' }}</span>
              }
            </div>
            <span class="font-label-sm text-label-sm bg-pa-primary text-pa-on-primary px-space-sm py-0.5 rounded-full uppercase tracking-wider font-semibold">Super Admin</span>
            <div class="flex items-center gap-space-sm pl-space-xs">
              <div class="flex flex-col text-right">
                <span class="font-label-md text-label-md text-pa-on-surface font-semibold leading-tight">{{ store.viewer()?.name || 'Plataforma' }}</span>
                <span class="font-label-sm text-label-sm text-pa-on-surface-variant">{{ store.viewer()?.email || 'admin@barbershop.local' }}</span>
              </div>
              <div class="w-8 h-8 rounded-full bg-pa-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-pa-on-primary text-[18px]">person</span>
              </div>
            </div>
            <button class="topbar-icon" (click)="onLogout()">🚪</button>
          </div>
        </header>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .platform-shell {
      display: flex;
      min-height: 100vh;
      background: #fafaf8;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .sidebar {
      width: 264px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #e5e7eb;
      background: white;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 30;
    }
    @media (max-width: 1023px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
      .sidebar.open { transform: translateX(0); }
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      background: #b87333; color: white; border-radius: 10px; font-size: 16px; font-weight: 700;
    }
    .brand-name { font-family: 'DM Serif Display', serif; font-size: 18px; color: #2d2d2d; }
    .brand-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #6b7280; margin-top: 2px; }
    .close-menu { display: none; background: none; border: none; font-size: 18px; color: #6b7280; cursor: pointer; }
    @media (max-width: 1023px) { .close-menu { display: block; } }
    .sidebar-footer { padding: 16px; border-top: 1px solid #e5e7eb; }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(184,115,51,0.15); color: #b87333;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
    }
    .user-name { font-size: 13px; font-weight: 500; color: #2d2d2d; }
    .user-role { font-size: 11px; color: #6b7280; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 20; }
    @media (min-width: 1024px) { .overlay { display: none; } }
    .main { flex: 1; margin-left: 264px; display: flex; flex-direction: column; }
    @media (max-width: 1023px) { .main { margin-left: 0; } }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      height: 64px; padding: 0 24px; border-bottom: 1px solid #e5e7eb; background: white;
    }
    .hamburger { display: none; background: none; border: none; font-size: 20px; color: #2d2d2d; cursor: pointer; }
    @media (max-width: 1023px) { .hamburger { display: block; } }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .topbar-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .content { flex: 1; overflow-y: auto; padding: 24px; }
  `]
})
export class PlatformAdminShellComponent implements OnInit {
  menuOpen = signal(false)
  readonly store = inject(PlatformAdminStore)
  private router = inject(Router)

  readonly primaryNav: NavItem[] = [
    { label: 'Dashboard General', icon: 'monitoring', path: '/platform-admin' },
    { label: 'Negocios Registrados', icon: 'domain', path: '/platform-admin/negocios' },
    { label: 'Gestión de Servicios', icon: 'services', path: '/platform-admin/services' },
    { label: 'Citas Globales', icon: 'calendar_today', path: '/platform-admin/appointments' },
    { label: 'Caja Central', icon: 'accounting', path: '/platform-admin/cash' },
  ]

  readonly pendingNav: NavItem[] = [
    { label: 'Detalle de Tenant', icon: 'manage_accounts', pending: true },
    { label: 'Provisioning Jobs', icon: 'reorder', pending: true },
    { label: 'Auditoría / Logs', icon: 'receipt_long', pending: true },
    { label: 'Configuración', icon: 'tune', pending: true },
  ]

  readonly connectionLabel = computed(() => {
    if (this.store.loading()) return 'Sincronizando'
    return this.store.offline() ? 'API no disponible' : 'Conectado'
  })

  readonly apiStateLabel = computed(() => (this.store.offline() ? 'Offline' : 'Online'))
  readonly syncLabel = computed(() => {
    const syncedAt = this.store.lastSyncedAt()
    if (!syncedAt) return this.store.offline() ? 'sin datos' : 'pendiente'
    return syncedAt.toLocaleTimeString()
  })

  readonly roleLabel = computed(() => {
    const role = this.store.viewer()?.role as Role | undefined
    return role ? ROLE_LABELS[role] ?? role : 'Plataforma'
  })

  get userInitials(): string {
    const name = this.store.viewer()?.name || 'SA'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  ngOnInit(): void {
    this.store.load()
  }

  onSearch(term: string): void {
    this.store.setSearch(term)
    if (!this.router.url.endsWith('/tenants')) {
      this.router.navigate(['/platform-admin/tenants'])
    }
  }

  onLogout(): void {
    this.router.navigate(['/login'])
  }
}
