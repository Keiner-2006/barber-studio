import { Routes } from '@angular/router'
import { PurchasingComponent } from './purchasing.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: PurchasingComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
  },
]
