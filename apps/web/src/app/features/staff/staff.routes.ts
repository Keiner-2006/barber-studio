import { Routes } from '@angular/router'
import { StaffComponent } from './staff.component'
import { AuthGuard } from '../../core/auth/auth.guard'
import { ROLES } from '@navaja/shared'

export const routes: Routes = [
  {
    path: '',
    component: StaffComponent,
    canActivate: [AuthGuard],
    data: { roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.APP] },
  },
]