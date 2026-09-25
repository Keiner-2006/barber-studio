import { Routes } from '@angular/router'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: { roles: ['platform_admin'] },
    loadComponent: () =>
      import('./platform-admin-shell.component').then((m) => m.PlatformAdminShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./platform-admin-dashboard.component').then(
            (m) => m.PlatformAdminDashboardComponent
          ),
      },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./platform-admin-tenants-list.component').then(
            (m) => m.PlatformAdminTenantsListComponent
          ),
      },
      {
        path: 'tenants/:id',
        loadComponent: () =>
          import('./platform-admin-tenant-detail.component').then(
            (m) => m.PlatformAdminTenantDetailComponent
          ),
      },
    ],
  },
]
