import { Routes } from '@angular/router'
import { CashComponent } from './cash.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: CashComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
  },
]
