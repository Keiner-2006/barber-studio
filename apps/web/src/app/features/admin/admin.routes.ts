import { Routes } from '@angular/router'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin.component').then((m) => m.AdminComponent),
    canActivate: [AuthGuard],
    data: { roles: ['platform_admin', 'platform_support'] },
  },
]
