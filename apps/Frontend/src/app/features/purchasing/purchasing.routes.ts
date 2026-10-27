import { Routes } from '@angular/router'
import { PurchasingComponent } from './purchasing.component'
import { AuthGuard } from '../../core/auth/auth.guard'
import { ROLES } from '@navaja/shared'

export const routes: Routes = [
  {
    path: '',
    component: PurchasingComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin', ROLES.INVENTORY_MANAGER] },
  },
]
