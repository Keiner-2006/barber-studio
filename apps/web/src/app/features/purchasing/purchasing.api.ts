import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { Supplier, PurchaseOrder, CreatePurchaseOrder } from './purchasing.models'

@Injectable({ providedIn: 'root' })
export class PurchasingApi {
  constructor(private api: ApiClient) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.api.get<ApiResponse<Supplier[]>>('/purchasing/suppliers').pipe(map((r) => r.data))
  }

  getPurchaseOrders(params?: { status?: string; branchId?: string }): Observable<PurchaseOrder[]> {
    return this.api
      .get<ApiResponse<PurchaseOrder[]>>('/purchasing/purchase-orders', {
        status: params?.status,
        branchId: params?.branchId,
      })
      .pipe(map((r) => r.data))
  }

  getOrderItems(orderId: string): Observable<unknown[]> {
    return this.api
      .get<ApiResponse<unknown[]>>(`/purchasing/purchase-orders/${orderId}/items`)
      .pipe(map((r) => r.data))
  }

  createOrder(data: CreatePurchaseOrder): Observable<PurchaseOrder> {
    return this.api
      .post<ApiResponse<PurchaseOrder>>('/purchasing/purchase-orders', data)
      .pipe(map((r) => r.data))
  }
}
