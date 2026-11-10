import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/http/api-client';
import { ApiResponse } from '@navaja/shared';
import {
  AdminTenantsPayload,
  BUSINESS_TYPE_LABELS,
  CreateTenantInput,
  PlatformOwner,
  PlatformTenant,
  TENANT_STATUS_LABELS,
  TenantDetail,
  TenantStatus,
} from './platform-admin.models';

@Injectable({ providedIn: 'root' })
export class PlatformAdminApi {
  private api = inject(ApiClient);

  /** GET /admin/tenants — `total` + `countsByStatus` always; rows only with `list=true`. */
  getTenants(limit: number): Observable<ApiResponse<AdminTenantsPayload>> {
    return this.api.get<ApiResponse<AdminTenantsPayload>>('/admin/tenants', { list: 'true', limit });
  }

  getTenant(id: string): Observable<ApiResponse<TenantDetail>> {
    return this.api.get<ApiResponse<TenantDetail>>(`/admin/tenants/${id}`);
  }

  setTenantStatus(
    id: string,
    status: Extract<TenantStatus, 'active' | 'suspended'>,
    reason: string,
  ): Observable<ApiResponse<{ id: string; status: TenantStatus }>> {
    return this.api.patch<ApiResponse<{ id: string; status: TenantStatus }>>(`/admin/tenants/${id}/status`, { status, reason });
  }

  createTenant(input: CreateTenantInput): Observable<ApiResponse<{ id: string; slug: string; status: TenantStatus }>> {
    return this.api.post<ApiResponse<{ id: string; slug: string; status: TenantStatus }>>('/admin/tenants', input);
  }

  getOwners(): Observable<ApiResponse<PlatformOwner[]>> {
    return this.api.get<ApiResponse<PlatformOwner[]>>('/admin/users', { role: 'owner' });
  }
}

function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function tenantsToCsv(tenants: PlatformTenant[]): string {
  const header = ['id', 'nombre', 'razon_social', 'slug', 'tipo', 'estado', 'pais', 'ciudad', 'telefono', 'whatsapp', 'propietario', 'email_propietario', 'creado'];
  const rows = tenants.map((t) =>
    [
      t.id,
      t.tradeName,
      t.legalName,
      t.slug,
      BUSINESS_TYPE_LABELS[t.businessType] ?? t.businessType,
      TENANT_STATUS_LABELS[t.status] ?? t.status,
      t.countryCode,
      t.city,
      t.phone,
      t.whatsapp,
      t.owner?.name,
      t.owner?.email,
      t.createdAt,
    ]
      .map(escapeCsvValue)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}
