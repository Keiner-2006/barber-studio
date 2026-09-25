import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/http/api-client';
import { ApiResponse } from '@navaja/shared';
import {
  AdminTenantsPayload,
  PlatformTenant,
  TenantStatus,
  TENANT_STATUS_LABELS,
} from './platform-admin.models';

export interface TenantsQuery {
  limit: number;
  /** Optional server-side status filter. The console filters client-side by default. */
  status?: TenantStatus | null;
}

@Injectable({ providedIn: 'root' })
export class PlatformAdminApi {
  private api = inject(ApiClient);

  /**
   * GET /admin/tenants
   * The server always returns `total` + `countsByStatus`; the tenant rows are
   * only included when `list=true`.
   */
  getTenants(filters: TenantsQuery): Observable<ApiResponse<AdminTenantsPayload>> {
    return this.api.get<ApiResponse<AdminTenantsPayload>>('/admin/tenants', {
      list: 'true',
      limit: filters.limit,
      ...(filters.status ? { status: filters.status } : {}),
    });
  }
}

function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function tenantsToCsv(tenants: PlatformTenant[]): string {
  const header = [
    'id',
    'slug',
    'tradeName',
    'legalName',
    'businessType',
    'status',
    'countryCode',
    'phone',
    'createdAt',
  ];

  const rows = tenants.map((tenant) =>
    [
      tenant.id,
      tenant.slug,
      tenant.tradeName,
      tenant.legalName,
      tenant.businessType,
      TENANT_STATUS_LABELS[tenant.status] ?? tenant.status,
      tenant.countryCode,
      tenant.phone,
      tenant.createdAt,
    ]
      .map(escapeCsvValue)
      .join(',')
  );

  return [header.join(','), ...rows].join('\n');
}
