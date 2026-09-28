import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/auth/auth.guard';
import { ClientsComponent } from './clients.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: { roles: ['platform_admin'] },
    component: ClientsComponent,
  },
];
