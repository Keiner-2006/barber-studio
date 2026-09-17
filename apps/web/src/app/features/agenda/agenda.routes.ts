import { Routes } from '@angular/router'
import { AgendaComponent } from './agenda.component'
import { AuthGuard } from '../../core/auth/auth.guard'
import { ROLES } from '@navaja/shared'

export const routes: Routes = [
  {
    path: '',
    component: AgendaComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin', ROLES.APP, ROLES.RECEPTION, ROLES.BARBER] },
  },
]
