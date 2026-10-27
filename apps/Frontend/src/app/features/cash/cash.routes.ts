import { Routes } from '@angular/router'
import { CashComponent } from './cash.component'
import { AuthGuard } from '../../core/auth/auth.guard'
import { ROLES } from '@navaja/shared'

export const routes: Routes = [
  {
    path: '',
    component: CashComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin', ROLES.RECEPTION, ROLES.APP, ROLES.ACCOUNTANT] },
  },
]
