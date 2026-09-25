import { Component, OnInit, computed, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { ROLE_LABELS, Role } from '@navaja/shared'
import { PlatformAdminStore } from './platform-admin.store'

interface NavItem {
  label: string
  icon: string
  path?: string
  /** Sections with no backend yet: rendered as disabled instead of faking a route. */
  pending?: boolean
}

@Component({
  selector: 'app-platform-admin-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="platform-admin font-body-md text-body-md text-pa-on-surface antialiased">
      <aside class="fixed left-0 top-0 h-full w-64 bg-pa-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none">
        <div class="flex flex-col">
          <div class="h-16 px-space-lg flex items-center gap-space-sm bg-pa-surface-container-low">
            <img
              alt="Navaja Studio OS"
              class="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XjNy6dCfh1U0IphF27gf_X79lFfbffHYjqL7v79EQLYd0UsOemeoSVwkWmIs096c2IlisVkYlNtoICyHBavcnIvAszyXyj3zdCIc8_Wyu91-ma7HBZt9haBPgdwXTP5VCUAJa0Xn0XufJ5Gv3v6seiMvoC6nohAKyV5TCjiuOUO0wbYdMJ4jo8Avk18rR0lOt3NiAy302FiOHunX_DecWjFMm0IyqJiOZSQIDH8x1FLQ3Ya12QbYPe_z8"
            />
            <div class="flex flex-col">
              <span class="font-headline-sm text-headline-sm text-pa-on-surface font-semibold tracking-tight leading-none">Navaja Studio</span>
              <span class="font-label-sm text-label-sm text-pa-on-surface-variant font-medium tracking-wide uppercase mt-1">Platform OS</span>
            </div>
          </div>
          <div class="px-space-md py-space-sm">
            <div class="px-space-sm py-space-xs font-label-sm text-label-sm text-pa-on-surface-variant tracking-wider uppercase font-semibold">Plataforma SaaS</div>
            <nav class="flex flex-col gap-space-xs mt-space-xs">
              @for (item of primaryNav; track item.label) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-pa-primary-container text-pa-on-primary-container font-semibold shadow-[0_1px_4px_rgba(61,35,20,0.08)]"
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
        </div>
        <div class="p-space-md bg-pa-surface-container-lowest m-space-md rounded-xl shadow-[0_1px_3px_rgba(61,35,20,0.04)]">
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
      </aside>
      <div class="pl-64">
        <header class="fixed top-0 left-64 right-0 h-16 bg-pa-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg">
          <div class="flex items-center gap-space-md">
            <img
              alt="Navaja Studio"
              class="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XjNy6dCfh1U0IphF27gf_X79lFfbffHYjqL7v79EQLYd0UsOemeoSVwkWmIs096c2IlisVkYlNtoICyHBavcnIvAszyXyj3zdCIc8_Wyu91-ma7HBZt9haBPgdwXTP5VCUAJa0Xn0XufJ5Gv3v6seiMvoC6nohAKyV5TCjiuOUO0wbYdMJ4jo8Avk18rR0lOt3NiAy302FiOHunX_DecWjFMm0IyqJiOZSQIDH8x1FLQ3Ya12QbYPe_z8"
            />
            <div class="flex items-center gap-space-xs bg-pa-surface-container px-space-sm py-1 rounded-full">
              <span
                class="w-2 h-2 rounded-full"
                [class.bg-pa-primary]="!store.offline()"
                [class.animate-pulse]="!store.offline()"
                [class.bg-pa-error]="store.offline()"
              ></span>
              <span class="font-label-sm text-label-sm font-semibold text-pa-on-surface">{{ connectionLabel() }}</span>
              @if (store.lastSyncedAt(); as syncedAt) {
                <span class="text-pa-outline font-label-sm text-label-sm">·</span>
                <span class="font-label-sm text-label-sm text-pa-on-surface-variant">Sync {{ syncedAt | date: 'HH:mm' }}</span>
              }
            </div>
            <span class="font-label-sm text-label-sm bg-pa-inverse-surface text-pa-inverse-on-surface px-space-sm py-0.5 rounded-full uppercase tracking-wider font-semibold">Super Admin Platform</span>
          </div>
          <div class="flex items-center gap-space-md">
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-space-sm text-pa-on-surface-variant text-[18px]">search</span>
              <input
                class="bg-pa-surface-container-lowest text-pa-on-surface placeholder:text-pa-outline font-body-sm text-body-sm pl-9 pr-14 py-1.5 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-pa-primary shadow-[0_1px_3px_rgba(61,35,20,0.04)]"
                placeholder="Buscar tenants, dominios..."
                type="text"
                [ngModel]="store.filters().search"
                (ngModelChange)="onSearch($event)"
              />
              <span class="absolute right-space-sm font-label-sm text-label-sm bg-pa-surface-container-high text-pa-on-surface-variant px-1.5 py-0.5 rounded font-mono">/</span>
            </div>
            <div class="flex items-center gap-space-xs">
              <button
                type="button"
                disabled
                title="Aprovisionamiento de tenants: pendiente de endpoint en la API de plataforma"
                class="flex items-center gap-space-xs bg-pa-primary text-pa-on-primary px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all shadow-[0_1px_3px_rgba(61,35,20,0.08)] opacity-40 cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[18px]">add</span>
                <span>Nuevo Tenant</span>
              </button>
              <button
                type="button"
                disabled
                title="Sin endpoint de notificaciones"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-pa-on-surface-variant transition-colors opacity-40 cursor-not-allowed relative"
              >
                <span class="material-symbols-outlined text-[20px]">notifications</span>
              </button>
            </div>
            <div class="flex items-center gap-space-sm pl-space-xs">
              <div class="flex flex-col text-right">
                <span class="font-label-md text-label-md text-pa-on-surface font-semibold leading-tight">{{ store.viewer()?.name || 'Plataforma' }}</span>
                <span class="font-label-sm text-label-sm text-pa-on-surface-variant">{{ store.viewer()?.email || roleLabel() }}</span>
              </div>
              <div class="w-8 h-8 rounded-full bg-pa-primary flex items-center justify-center shadow-[0_1px_3px_rgba(61,35,20,0.12)]">
                <span class="material-symbols-outlined text-pa-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>
        <main class="w-full pt-16 bg-pa-surface px-space-lg min-h-screen">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class PlatformAdminShellComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  private router = inject(Router)

  readonly primaryNav: NavItem[] = [
    { label: 'Dashboard General', icon: 'monitoring', path: '/platform-admin' },
    { label: 'Lista de Tenants', icon: 'domain', path: '/platform-admin/tenants' },
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

  ngOnInit(): void {
    this.store.load()
  }

  onSearch(term: string): void {
    this.store.setSearch(term)
    if (!this.router.url.endsWith('/tenants')) {
      this.router.navigate(['/platform-admin/tenants'])
    }
  }
}
