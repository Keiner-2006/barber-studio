import { Routes } from '@angular/router'
import { AgendaComponent } from './agenda.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: AgendaComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
  },
]
