import { Routes } from '@angular/router'
import { DashboardComponent } from './dashboard.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
  },
]
