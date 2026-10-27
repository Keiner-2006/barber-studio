import { Routes } from '@angular/router'
import { ReportsComponent } from './reports.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin', 'app', 'accountant'] },
  },
]
