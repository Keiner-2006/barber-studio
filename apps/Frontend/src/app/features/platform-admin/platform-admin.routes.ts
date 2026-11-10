import { Routes } from '@angular/router'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: { roles: ['platform_admin', 'platform_support'] },
    loadComponent: () => import('./platform-admin-shell.component').then((m) => m.PlatformAdminShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./platform-admin-dashboard.component').then((m) => m.PlatformAdminDashboardComponent),
      },
      {
        path: 'negocios',
        loadComponent: () => import('./platform-admin-tenants-list.component').then((m) => m.PlatformAdminTenantsListComponent),
      },
      {
        path: 'negocios/nuevo',
        loadComponent: () => import('./platform-admin-new-tenant.component').then((m) => m.PlatformAdminNewTenantComponent),
      },
      {
        path: 'negocios/:id',
        loadComponent: () => import('./platform-admin-tenant-detail.component').then((m) => m.PlatformAdminTenantDetailComponent),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./platform-admin-clients.component').then((m) => m.PlatformAdminClientsComponent),
      },
      { path: '**', redirectTo: '' },
    ],
  },
]
