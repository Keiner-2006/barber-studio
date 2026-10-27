import { Routes } from '@angular/router'
import { SettingsComponent } from './settings.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner', 'admin'] },
  },
]