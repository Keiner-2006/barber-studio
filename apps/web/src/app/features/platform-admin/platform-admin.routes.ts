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
        path: 'negocios',
        loadComponent: () =>
          import('./platform-admin-tenants-list.component').then(
            (m) => m.PlatformAdminTenantsListComponent
          ),
      },
      {
        path: 'negocios/:id',
        loadComponent: () =>
          import('./platform-admin-tenant-detail.component').then(
            (m) => m.PlatformAdminTenantDetailComponent
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./platform-admin-services.component').then(
            (m) => m.PlatformAdminServicesComponent
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./platform-admin-appointments.component').then(
            (m) => m.PlatformAdminAppointmentsComponent
          ),
      },
      {
        path: 'cash',
        loadComponent: () =>
          import('./platform-admin-cash.component').then(
            (m) => m.PlatformAdminCashComponent
          ),
      },
    ],
  },
]
