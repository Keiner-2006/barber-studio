import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { Service, ServiceCategory } from '../catalog/catalog.models'
import { Branch } from '../../core/tenancy/tenant.models'
import { StaffMember, AvailableSlot, AvailabilityQuery, CreateAppointment } from './booking.models'

@Injectable({ providedIn: 'root' })
export class BookingApi {
  constructor(private api: ApiClient) {}

  getCategories(): Observable<ServiceCategory[]> {
    return this.api.get<ApiResponse<ServiceCategory[]>>('/catalog/categories').pipe(map((r) => r.data))
  }

  getServices(categoryId?: string): Observable<Service[]> {
    const params = categoryId ? { categoryId } : undefined
    return this.api.get<ApiResponse<Service[]>>('/catalog/services', params).pipe(map((r) => r.data))
  }

  getBranches(): Observable<Branch[]> {
    return this.api.get<ApiResponse<Branch[]>>('/branches').pipe(map((r) => r.data))
  }

  getStaff(branchId: string): Observable<StaffMember[]> {
    return this.api
      .get<ApiResponse<any[]>>('/staff', { branchId })
      .pipe(
        map((resp) =>
          (resp.data ?? []).map((s: any) => ({
            id: s.id,
            name: s.displayName || '',
            email: s.userEmail || '',
            specialty: s.bio || '',
            avatarUrl: s.avatarUrl || '',
            role: s.role || undefined,
          }))
        )
      )
  }

  getAvailability(query: AvailabilityQuery): Observable<AvailableSlot[]> {
    return this.api
      .get<ApiResponse<AvailableSlot[]>>('/availability', {
        branchId: query.branchId,
        serviceId: query.serviceId,
        staffId: query.staffId,
        from: query.from,
        to: query.to,
      })
      .pipe(map((r) => r.data))
  }

  createAppointment(data: CreateAppointment): Observable<any> {
    return this.api.post<ApiResponse<any>>('/appointments', data).pipe(map((r) => r.data))
  }
}
