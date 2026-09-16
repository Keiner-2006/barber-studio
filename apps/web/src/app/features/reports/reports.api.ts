import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { SalesReport, OccupancyReport, ServiceReport, InventoryReport, CashReport, AuditEvent } from './reports.models'

@Injectable({ providedIn: 'root' })
export class ReportsApi {
  constructor(private api: ApiClient) {}

  getSales(params?: { from?: string; to?: string; branchId?: string }): Observable<SalesReport[]> {
    return this.api
      .get<ApiResponse<SalesReport[]>>('/reports/sales', {
        from: params?.from,
        to: params?.to,
        branchId: params?.branchId,
      })
      .pipe(map((r) => r.data))
  }

  getOccupancy(params?: { from?: string; to?: string; branchId?: string }): Observable<OccupancyReport[]> {
    return this.api
      .get<ApiResponse<OccupancyReport[]>>('/reports/occupancy', {
        from: params?.from,
        to: params?.to,
        branchId: params?.branchId,
      })
      .pipe(map((r) => r.data))
  }

  getServices(params?: { from?: string; to?: string; branchId?: string }): Observable<ServiceReport[]> {
    return this.api
      .get<ApiResponse<ServiceReport[]>>('/reports/services', {
        from: params?.from,
        to: params?.to,
        branchId: params?.branchId,
      })
      .pipe(map((r) => r.data))
  }

  getInventory(params?: { branchId?: string }): Observable<InventoryReport[]> {
    return this.api
      .get<ApiResponse<InventoryReport[]>>('/reports/inventory', { branchId: params?.branchId })
      .pipe(map((r) => r.data))
  }

  getCash(params?: { from?: string; to?: string; branchId?: string }): Observable<CashReport[]> {
    return this.api
      .get<ApiResponse<CashReport[]>>('/reports/cash', {
        from: params?.from,
        to: params?.to,
        branchId: params?.branchId,
      })
      .pipe(map((r) => r.data))
  }

  getAuditEvents(params?: { limit?: number }): Observable<AuditEvent[]> {
    return this.api
      .get<ApiResponse<AuditEvent[]>>('/audit-events', { limit: params?.limit ? String(params.limit) : undefined })
      .pipe(map((r) => r.data))
  }
}
