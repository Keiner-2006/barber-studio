import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { Customer, CustomerSearch, CreateCustomer } from './customers.models'

export interface CustomerSearchResult {
  data: Customer[]
  meta?: { cursor?: string; hasMore: boolean; total?: number }
}

@Injectable({ providedIn: 'root' })
export class CustomersApi {
  constructor(private api: ApiClient) {}

  search(params: CustomerSearch): Observable<CustomerSearchResult> {
    return this.api
      .get<CustomerSearchResult>('/customers', {
        query: params.query,
        cursor: params.cursor,
        limit: params.limit ? String(params.limit) : undefined,
      })
      .pipe(map((resp) => ({ data: resp.data, meta: (resp as any).meta })))
  }

  getCustomer(id: string): Observable<Customer> {
    return this.api.get<ApiResponse<Customer>>(`/customers/${id}`).pipe(map((r) => r.data))
  }

  createCustomer(data: CreateCustomer): Observable<Customer> {
    return this.api.post<ApiResponse<Customer>>('/customers', data).pipe(map((r) => r.data))
  }

  updateCustomer(id: string, data: Partial<CreateCustomer>): Observable<Customer> {
    return this.api.patch<ApiResponse<Customer>>(`/customers/${id}`, data).pipe(map((r) => r.data))
  }

  deleteCustomer(id: string): Observable<Customer> {
    return this.api.delete<ApiResponse<Customer>>(`/customers/${id}`).pipe(map((r) => r.data))
  }
}
