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
    <div class="platform-shell">
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

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">Consola de Plataforma</div>
            <div class="nav-group">
              @for (item of primaryNav; track item.label) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="nav-item"
                >
                  <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
                  <span class="nav-label">{{ item.label }}</span>
                </a>
              }
            </div>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Próximamente</div>
            <div class="nav-group">
              @for (item of pendingNav; track item.label) {
                <span class="nav-item nav-item-pending" [title]="item.label">
                  <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
                  <span class="nav-label">{{ item.label }}</span>
                  <span class="nav-badge">Pronto</span>
                </span>
              }
            </div>
          </div>
        </nav>

        <div class="sidebar-footer">
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
            <div class="admin-info">
              <span class="admin-role">Administrador de Plataforma</span>
            </div>
            <div class="user-actions">
              <div class="user-actions-info">
                <span class="user-display-name">{{ store.viewer()?.name || 'Super Administrador' }}</span>
                <span class="user-email">{{ store.viewer()?.email || 'admin@barbershop.local' }}</span>
              </div>
              <div class="user-actions-avatar">{{ userInitials }}</div>
            </div>
            <button class="logout-btn" (click)="onLogout()" title="Cerrar sesión">
              <span class="material_symbols-outlined">logout</span>
            </button>
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
      color: #2d2d2d;
    }

    /* Sidebar */
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
      transition: transform 0.3s ease;
    }
    @media (max-width: 1023px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
    }

    /* Sidebar Header */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #b87333;
      color: white;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
    }
    .brand-name {
      font-family: 'DM Serif Display', serif;
      font-size: 18px;
      color: #2d2d2d;
    }
    .brand-sub {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: #6b7280;
      margin-top: 2px;
    }
    .close-menu {
      display: none;
      background: none;
      border: none;
      font-size: 18px;
      color: #6b7280;
      cursor: pointer;
    }
    @media (max-width: 1023px) { .close-menu { display: block; } }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 16px 12px;
    }
    .nav-section { margin-bottom: 24px; }
    .nav-section:last-child { margin-bottom: 0; }
    .nav-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #9ca3af;
      padding: 0 12px 8px;
    }
    .nav-group { display: flex; flex-direction: column; gap: 4px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .nav-item:hover {
      background: #f3f4f6;
      color: #374151;
    }
    .nav-item.active {
      background: rgba(184, 115, 51, 0.1);
      color: #b87333;
      font-weight: 600;
    }
    .nav-icon {
      font-size: 19px;
      min-width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-label { flex: 1; }
    .nav-badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: #e5e7eb;
      color: #6b7280;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .nav-item-pending {
      cursor: not-allowed;
    }

    /* Footer */
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: white;
      border-radius: 12px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(184, 115, 51, 0.15);
      color: #b87333;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }
    .user-details { flex: 1; min-width: 0; }
    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: #2d2d2d;
    }
    .user-role {
      font-size: 11px;
      color: #6b7280;
    }

    /* Overlay */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 20;
    }
    @media (min-width: 1024px) { .overlay { display: none; } }

    /* Main Layout */
    .main {
      flex: 1;
      margin-left: 264px;
      display: flex;
      flex-direction: column;
    }
    @media (max-width: 1023px) { .main { margin-left: 0; } }

    /* Topbar */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 24px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .hamburger {
      display: none;
      background: none;
      border: none;
      font-size: 20px;
      color: #2d2d2d;
      cursor: pointer;
    }
    @media (max-width: 1023px) { .hamburger { display: block; } }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .admin-info {
      display: flex;
      align-items: center;
    }
    .admin-role {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      background: #b87333;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-actions-info {
      display: flex;
      flex-direction: column;
      text-align: right;
    }
    .user-display-name {
      font-size: 13px;
      font-weight: 500;
      color: #2d2d2d;
    }
    .user-email {
      font-size: 11px;
      color: #9ca3af;
    }
    .user-actions-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #b87333;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }
    .logout-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s ease;
    }
    .logout-btn:hover {
      background: #e5e7eb;
      color: #374151;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
  `]
})
export class PlatformAdminShellComponent implements OnInit {
  menuOpen = signal(false)
  readonly store = inject(PlatformAdminStore)
  private router = inject(Router)

  readonly primaryNav: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/platform-admin' },
    { label: 'Negocios Registrados', icon: 'domain', path: '/platform-admin/negocios' },
    { label: 'Clientes', icon: 'people', path: '/platform-admin/clientes' },
    { label: 'Agregar Negocio', icon: 'add_circle', path: '/platform-admin/negocios/nuevo' },
  ]

  readonly pendingNav: NavItem[] = [
    { label: 'Servicios', icon: 'category', pending: true },
    { label: 'Citas Globales', icon: 'calendar_today', pending: true },
    { label: 'Caja Central', icon: 'payments', pending: true },
    { label: 'Detalle de Negocio', icon: 'business_center', pending: true },
    { label: 'Jobs de Aprovisionamiento', icon: 'hourglass_empty', pending: true },
    { label: 'Auditoría y Logs', icon: 'receipt_long', pending: true },
    { label: 'Configuración', icon: 'settings', pending: true },
  ]

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
    if (!this.router.url.endsWith('/negocios')) {
      this.router.navigate(['/platform-admin/negocios'])
    }
  }

  onLogout(): void {
    this.router.navigate(['/login'])
  }
}