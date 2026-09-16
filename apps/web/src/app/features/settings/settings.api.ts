import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { FullBranch, StaffMember, CreateBranch } from './settings.models'
import { TenantInfo } from '../../core/tenancy/tenant.models'

@Injectable({ providedIn: 'root' })
export class SettingsApi {
  constructor(private api: ApiClient) {}

  getTenant(): Observable<TenantInfo> {
    return this.api
      .get<{ data: { tenant: TenantInfo; branches: FullBranch[] } }>('/tenants/me')
      .pipe(map((resp) => resp.data.tenant))
  }

  getBranches(): Observable<FullBranch[]> {
    return this.api.get<ApiResponse<FullBranch[]>>('/branches').pipe(map((r) => r.data))
  }

  createBranch(data: CreateBranch): Observable<FullBranch> {
    return this.api.post<ApiResponse<FullBranch>>('/branches', data).pipe(map((r) => r.data))
  }

  getStaff(): Observable<StaffMember[]> {
    return this.api.get<ApiResponse<StaffMember[]>>('/staff').pipe(map((r) => r.data))
  }
}
