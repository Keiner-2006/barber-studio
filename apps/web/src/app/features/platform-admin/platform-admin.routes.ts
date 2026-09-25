import { Routes } from '@angular/router'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./platform-admin.component').then((m) => m.PlatformAdminComponent),
    canActivate: [AuthGuard],
    data: { roles: ['platform_admin'] },
  },
]
