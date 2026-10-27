import { Routes } from '@angular/router'
import { DashboardComponent } from './dashboard.component'
import { AuthGuard } from '../../core/auth/auth.guard'
import { ROLES } from '@navaja/shared'

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin', ROLES.APP, ROLES.RECEPTION, ROLES.BARBER, ROLES.INVENTORY_MANAGER, ROLES.ACCOUNTANT] },
  },
]
