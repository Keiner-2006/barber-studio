import { Routes } from '@angular/router'
import { InventoryComponent } from './inventory.component'
import { AuthGuard } from '../../core/auth/auth.guard'
import { ROLES } from '@navaja/shared'

export const routes: Routes = [
  {
    path: '',
    component: InventoryComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin', ROLES.APP, ROLES.INVENTORY_MANAGER] },
  },
]
