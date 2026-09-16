import { Routes } from '@angular/router'
import { InventoryComponent } from './inventory.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: InventoryComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
  },
]
