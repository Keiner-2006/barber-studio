import { Routes } from '@angular/router'
import { AuthGuard } from './core/auth/auth.guard'
import { AppShellComponent } from './layout/app-shell/app-shell.component'

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'booking',
    loadComponent: () =>
      import('./features/booking/booking.component').then(
        (m) => m.BookingComponent
      ),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.routes),
      },
      {
        path: 'agenda',
        loadChildren: () =>
          import('./features/agenda/agenda.routes').then((m) => m.routes),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.routes').then((m) => m.routes),
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.routes),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((m) => m.routes),
      },
      {
        path: 'purchasing',
        loadChildren: () =>
          import('./features/purchasing/purchasing.routes').then((m) => m.routes),
      },
      {
        path: 'cash',
        loadChildren: () =>
          import('./features/cash/cash.routes').then((m) => m.routes),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.routes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.routes),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
]