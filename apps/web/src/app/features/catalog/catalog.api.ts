import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { Service, ServiceCategory, CreateService, CreateServiceCategory } from './catalog.models'

@Injectable({ providedIn: 'root' })
export class CatalogApi {
  constructor(private api: ApiClient) {}

  getCategories(): Observable<ServiceCategory[]> {
    return this.api.get<ApiResponse<ServiceCategory[]>>('/catalog/categories').pipe(map((r) => r.data))
  }

  getServices(categoryId?: string): Observable<Service[]> {
    return this.api
      .get<ApiResponse<Service[]>>('/catalog/services', categoryId ? { categoryId } : undefined)
      .pipe(map((r) => r.data))
  }

  getService(id: string): Observable<Service> {
    return this.api.get<ApiResponse<Service>>(`/catalog/services/${id}`).pipe(map((r) => r.data))
  }

  createService(data: CreateService): Observable<Service> {
    return this.api.post<ApiResponse<Service>>('/catalog/services', data).pipe(map((r) => r.data))
  }

  updateService(id: string, data: Partial<CreateService>): Observable<Service> {
    return this.api.patch<ApiResponse<Service>>(`/catalog/services/${id}`, data).pipe(map((r) => r.data))
  }

  deleteService(id: string): Observable<Service> {
    return this.api.delete<ApiResponse<Service>>(`/catalog/services/${id}`).pipe(map((r) => r.data))
  }

  createCategory(data: CreateServiceCategory): Observable<ServiceCategory> {
    return this.api.post<ApiResponse<ServiceCategory>>('/catalog/categories', data).pipe(map((r) => r.data))
  }

  updateCategory(id: string, data: Partial<CreateServiceCategory>): Observable<ServiceCategory> {
    return this.api.patch<ApiResponse<ServiceCategory>>(`/catalog/categories/${id}`, data).pipe(map((r) => r.data))
  }

  deleteCategory(id: string): Observable<ServiceCategory> {
    return this.api.delete<ApiResponse<ServiceCategory>>(`/catalog/categories/${id}`).pipe(map((r) => r.data))
  }
}
