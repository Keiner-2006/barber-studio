import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { StaffMember, CreateStaffInput, UpdateStaffInput } from './staff.models'

@Injectable({ providedIn: 'root' })
export class StaffApi {
  constructor(private api: ApiClient) {}

  getStaff(): Observable<StaffMember[]> {
    return this.api.get<ApiResponse<StaffMember[]>>('/staff').pipe(map((r) => r.data))
  }

  createStaff(input: CreateStaffInput): Observable<StaffMember> {
    return this.api.post<ApiResponse<StaffMember>>('/staff', input).pipe(map((r) => r.data))
  }

  updateStaff(id: string, input: UpdateStaffInput): Observable<StaffMember> {
    return this.api.patch<ApiResponse<StaffMember>>(`/staff?id=${id}`, input).pipe(map((r) => r.data))
  }

  deleteStaff(id: string): Observable<StaffMember> {
    return this.api.delete<ApiResponse<StaffMember>>(`/staff?id=${id}`).pipe(map((r) => r.data))
  }
}