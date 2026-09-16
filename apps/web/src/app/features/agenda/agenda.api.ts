import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { Appointment, AppointmentQuery, CreateAppointment } from './agenda.models'

@Injectable({ providedIn: 'root' })
export class AgendaApi {
  constructor(private api: ApiClient) {}

  getAppointments(params: AppointmentQuery): Observable<Appointment[]> {
    return this.api
      .get<ApiResponse<Appointment[]>>('/appointments', {
        branchId: params.branchId,
        staffId: params.staffId,
        customerId: params.customerId,
        status: params.status,
        from: params.from,
        to: params.to,
        cursor: params.cursor,
        limit: params.limit ? String(params.limit) : undefined,
      })
      .pipe(map((resp) => resp.data))
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.api.get<ApiResponse<Appointment>>(`/appointments/${id}`).pipe(map((r) => r.data))
  }

  createAppointment(data: CreateAppointment): Observable<Appointment> {
    return this.api.post<ApiResponse<Appointment>>('/appointments', data).pipe(map((r) => r.data))
  }

  updateStatus(id: string, action: string, reason?: string): Observable<Appointment> {
    return this.api
      .patch<ApiResponse<Appointment>>(`/appointments/${id}`, { action, reason })
      .pipe(map((r) => r.data))
  }

  getDailyAppointments(branchId: string | null, date: Date): Observable<Appointment[]> {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return this.getAppointments({
      branchId: branchId ?? undefined,
      from: start.toISOString(),
      to: end.toISOString(),
    })
  }
}
