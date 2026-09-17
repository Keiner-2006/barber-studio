import { Routes } from '@angular/router'
import { CustomersComponent } from './customers.component'
import { AuthGuard } from '../../core/auth/auth.guard'
import { ROLES } from '@navaja/shared'

export const routes: Routes = [
  {
    path: '',
    component: CustomersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin', ROLES.APP, ROLES.RECEPTION, ROLES.BARBER] },
  },
]
