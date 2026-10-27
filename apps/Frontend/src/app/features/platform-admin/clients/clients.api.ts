import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';
import { ApiResponse } from '@navaja/shared';

export interface PlatformOwner {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tradeName: string;
  businessType: string;
  countryCode: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private api = inject(ApiClient);

  getOwners(): Observable<ApiResponse<PlatformOwner[]>> {
    return this.api.get<ApiResponse<PlatformOwner[]>>('/admin/users', { role: 'owner' });
  }
}
