import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'

export interface AdminTenantSummary {
  id: string
  legalName: string
  tradeName: string
  slug: string
  businessType: string
  status: string
  countryCode: string
  phone: string | null
  createdAt: string
  branding: {
    logoUrl: string | null
    primaryColor: string | null
  } | null
}

export interface AdminTenantsResponse {
  total: number
  countsByStatus: Record<string, number>
  tenants: AdminTenantSummary[] | undefined
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  constructor(private api: ApiClient) {}

  getTenants(params?: { status?: string; list?: boolean; limit?: number }): Observable<AdminTenantsResponse> {
    return this.api.get<AdminTenantsResponse>('/admin/tenants', {
      status: params?.status,
      list: params?.list ? 'true' : undefined,
      limit: params?.limit,
    })
  }
}