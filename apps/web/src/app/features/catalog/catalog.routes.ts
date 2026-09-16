import { Routes } from '@angular/router'
import { CatalogComponent } from './catalog.component'
import { AuthGuard } from '../../core/auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    canActivate: [AuthGuard],
    data: { roles: ['company_member'] },
  },
]