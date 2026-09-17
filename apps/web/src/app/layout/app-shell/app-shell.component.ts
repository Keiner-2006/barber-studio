import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'
import { TenantService } from '../../core/tenancy/tenant.service'
import { ROLES } from '@navaja/shared'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="menuOpen()">
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="6" r="3"/>
                <path d="M8.12 8.12L12 12"/>
                <path d="M20 4L8.12 15.88"/>
                <circle cx="6" cy="18" r="3"/>
                <path d="M14.8 14.8L20 20"/>
              </svg>
            </div>
            <div class="brand-text">
              <p class="brand-name">Navaja</p>
              <p class="brand-sub">Studio OS</p>
            </div>
          </div>
          <button class="close-menu" (click)="menuOpen.set(false)">
            ✕
          </button>
        </div>

        <div class="branch-selector">
          <div class="branch-header">
            <span class="branch-label">SUCURSAL ACTIVA</span>
            <button class="branch-toggle" (click)="branchOpen.set(!branchOpen())">▾</button>
          </div>
          <div class="branch-current">
            <span class="branch-dot"></span>
            <span class="branch-name">{{ tenantService.branch()?.name || 'Sin sucursal' }}</span>
          </div>
          @if (branchOpen()) {
            <div class="branch-dropdown">
              @for (branch of tenantService.branches(); track branch.id) {
                <button
                  (click)="selectBranch(branch.id)"
                  [class.active]="branch.id === tenantService.branch()?.id">
                  {{ branch.name }}
                  @if (branch.id === tenantService.branch()?.id) {
                    <span class="active-dot">· activa</span>
                  }
                </button>
              }
            </div>
          }
        </div>

        <nav class="sidebar-nav">
          <p class="nav-section">Workspace</p>
          @for (item of navItemsList; track item.label) {
            <a
              class="nav-item"
              [routerLink]="item.route"
              routerLinkActive="active">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }

          @if (showSettings) {
          <p class="nav-section" style="margin-top: 24px;">Configuración</p>
          <a class="nav-item" routerLink="/settings" routerLinkActive="active">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Ajustes</span>
          </a>
        }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-details">
              <p class="user-name">{{ authService.user()?.name || 'Usuario' }}</p>
              <p class="user-role">{{ authService.user()?.role || 'admin' }}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay -->
      @if (menuOpen()) {
        <div class="overlay" (click)="menuOpen.set(false)"></div>
      }

      <!-- Main content -->
      <div class="main">
        <header class="topbar">
          <button class="hamburger" (click)="menuOpen.set(true)">☰</button>
          <div class="topbar-right">
            <button class="topbar-icon">🔔</button>
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
    .shell {
      display: flex;
      min-height: 100vh;
      background: #fafaf8;
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
    }

    @media (max-width: 1023px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      .sidebar.open {
        transform: translateX(0);
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #b87333;
      color: white;
      border-radius: 10px;
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

    @media (max-width: 1023px) {
      .close-menu { display: block; }
    }

    /* Branch selector */
    .branch-selector {
      margin: 0 16px 24px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: rgba(255,255,255,0.7);
    }

    .branch-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .branch-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #6b7280;
    }

    .branch-toggle {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      font-size: 12px;
    }

    .branch-current {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .branch-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
    }

    .branch-name {
      font-size: 13px;
      font-weight: 500;
      color: #2d2d2d;
    }

    .branch-dropdown {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
    }

    .branch-dropdown button {
      display: block;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      padding: 6px 0;
      font-size: 12px;
      color: #6b7280;
      cursor: pointer;
    }

    .branch-dropdown button:hover {
      color: #2d2d2d;
    }

    .branch-dropdown button.active {
      color: #2d2d2d;
      font-weight: 500;
    }

    .active-dot {
      color: #22c55e;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 0 12px;
      overflow-y: auto;
    }

    .nav-section {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #6b7280;
      padding: 0 12px;
      margin-bottom: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: #374151;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.15s;
      margin-bottom: 2px;
    }

    .nav-item:hover {
      background: #f3f4f6;
    }

    .nav-item.active {
      background: rgba(184, 115, 51, 0.08);
      color: #b87333;
    }

    .nav-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .nav-label {
      flex: 1;
    }

    .nav-badge {
      background: #fee2e2;
      color: #dc2626;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }

    /* User info */
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
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
      background: rgba(0,0,0,0.4);
      z-index: 20;
    }

    @media (min-width: 1024px) {
      .overlay { display: none; }
    }

    /* Main content */
    .main {
      flex: 1;
      margin-left: 264px;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 1023px) {
      .main { margin-left: 0; }
    }

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

    @media (max-width: 1023px) {
      .hamburger { display: block; }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topbar-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .content {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AppShellComponent {
  menuOpen = signal(false)
  branchOpen = signal(false)

  private navItems = [
    { label: 'Resumen', icon: '📊', route: '/dashboard' },
    { label: 'Agenda', icon: '📅', route: '/agenda' },
    { label: 'Cliente', icon: '👥', route: '/customers' },
    { label: 'Servicios', icon: '✂️', route: '/catalog' },
    { label: 'Inventario', icon: '📦', route: '/inventory' },
    { label: 'Compras', icon: '🛒', route: '/purchasing' },
    { label: 'Caja y pagos', icon: '💳', route: '/cash' },
    { label: 'Reportes', icon: '📈', route: '/reports' },
  ]

  private settingsRoles = [ROLES.OWNER, ROLES.ADMIN]

  get navItemsList() {
    const role = this.authService.user()?.role
    const allowed = this.getAllowedRoutes(role || '')
    return this.navItems.filter(item => allowed.includes(item.route))
  }

  get showSettings() {
    const role = this.authService.user()?.role
    return role ? this.settingsRoles.includes(role as any) : false
  }

  private getAllowedRoutes(role: string): string[] {
    const routes: Record<string, string[]> = {
      [ROLES.OWNER]: ['/dashboard', '/agenda', '/customers', '/catalog', '/inventory', '/purchasing', '/cash', '/reports'],
      [ROLES.ADMIN]: ['/dashboard', '/agenda', '/customers', '/catalog', '/inventory', '/purchasing', '/cash', '/reports'],
      [ROLES.APP]: ['/dashboard', '/agenda', '/customers', '/catalog', '/inventory', '/purchasing', '/cash', '/reports'],
      [ROLES.RECEPTION]: ['/dashboard', '/agenda', '/customers', '/catalog', '/cash'],
      [ROLES.BARBER]: ['/dashboard', '/agenda', '/customers', '/catalog'],
      [ROLES.INVENTORY_MANAGER]: ['/dashboard', '/inventory', '/purchasing'],
      [ROLES.ACCOUNTANT]: ['/dashboard', '/reports', '/cash'],
    }
    return routes[role] || []
  }

  get userInitials(): string {
    const name = this.authService.user()?.name || 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  constructor(
    public authService: AuthService,
    public tenantService: TenantService
  ) {}

  selectBranch(branchId: string): void {
    this.tenantService.selectBranch(branchId)
    this.branchOpen.set(false)
  }

  onLogout(): void {
    this.authService.logout().subscribe()
  }
}