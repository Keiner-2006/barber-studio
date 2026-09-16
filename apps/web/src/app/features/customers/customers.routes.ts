import { Routes } from '@angular/router'
import { CustomersComponent } from './customers.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: CustomersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
  },
]