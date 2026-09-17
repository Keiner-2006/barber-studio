import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { Product, CreateProduct, InventoryMovement, BranchStock } from './inventory.models'

@Injectable({ providedIn: 'root' })
export class InventoryApi {
  constructor(private api: ApiClient) {}

  getProducts(search?: string): Observable<{ products: Product[]; totalValue: number }> {
    const params = search ? { search } : undefined
    return this.api.get<{ data: Product[]; totalValue: number }>('/inventory/products', params).pipe(map((r) => ({ products: r.data, totalValue: r.totalValue })))
  }

  getProduct(id: string): Observable<Product> {
    return this.api.get<ApiResponse<Product>>(`/inventory/products/${id}`).pipe(map((r) => r.data))
  }

  createProduct(data: CreateProduct): Observable<Product> {
    return this.api.post<ApiResponse<Product>>('/inventory/products', data).pipe(map((r) => r.data))
  }

  updateProduct(id: string, data: Partial<CreateProduct> & { active?: boolean }): Observable<Product> {
    return this.api.patch<ApiResponse<Product>>(`/inventory/products/${id}`, data).pipe(map((r) => r.data))
  }

  deleteProduct(id: string): Observable<Product> {
    return this.api.delete<ApiResponse<Product>>(`/inventory/products/${id}`).pipe(map((r) => r.data))
  }

  getStock(branchId?: string): Observable<BranchStock[]> {
    const params = branchId ? { branchId } : undefined
    return this.api.get<ApiResponse<BranchStock[]>>('/inventory/stock', params).pipe(map((r) => r.data))
  }

  getMovements(params?: { productId?: string; branchId?: string; limit?: number }): Observable<InventoryMovement[]> {
    return this.api
      .get<ApiResponse<InventoryMovement[]>>('/inventory/movements', {
        productId: params?.productId,
        branchId: params?.branchId,
        limit: params?.limit ? String(params.limit) : undefined,
      })
      .pipe(map((r) => r.data))
  }

  adjustStock(data: { productId: string; branchId: string; type: string; quantity: string; unitCost?: string; reference?: string; notes?: string }): Observable<unknown> {
    return this.api.post<ApiResponse<unknown>>('/inventory/adjustments', data)
  }
}
