import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { CashRegister, CashSession, CashTransaction, NewMovement, PaymentMethod } from './cash.models'

export interface AppointmentPayments {
  payments: { id: string; amount: string; currency: string; method: PaymentMethod; status: string; reference: string | null; createdAt: string }[]
  price: string
  paid: string
  balance: string
}

@Injectable({ providedIn: 'root' })
export class CashApi {
  constructor(private api: ApiClient) {}

  getRegisters(): Observable<CashRegister[]> {
    return this.api.get<ApiResponse<CashRegister[]>>('/cash/registers').pipe(map((r) => r.data))
  }

  createRegister(branchId: string, name: string): Observable<CashRegister> {
    return this.api.post<ApiResponse<CashRegister>>('/cash/registers', { branchId, name }).pipe(map((r) => r.data))
  }

  getSessions(registerId: string, openOnly = false, limit = 20): Observable<CashSession[]> {
    return this.api
      .get<ApiResponse<CashSession[]>>('/cash/sessions', { registerId, openOnly: openOnly ? 'true' : 'false', limit })
      .pipe(map((r) => r.data))
  }

  getTransactions(sessionId: string): Observable<CashTransaction[]> {
    return this.api.get<ApiResponse<CashTransaction[]>>('/cash/sessions', { sessionId }).pipe(map((r) => r.data))
  }

  openSession(cashRegisterId: string, initialBalance: string): Observable<CashSession> {
    return this.api.post<ApiResponse<CashSession>>('/cash', { action: 'open', cashRegisterId, initialBalance }).pipe(map((r) => r.data))
  }

  closeSession(sessionId: string, countedBalance: string, notes?: string): Observable<CashSession> {
    return this.api
      .post<ApiResponse<CashSession>>('/cash', { action: 'close', sessionId, countedBalance, ...(notes ? { notes } : {}) })
      .pipe(map((r) => r.data))
  }

  addMovement(sessionId: string, data: NewMovement): Observable<CashTransaction> {
    return this.api.post<ApiResponse<CashTransaction>>('/cash', { action: 'transaction', sessionId, ...data }).pipe(map((r) => r.data))
  }

  getAppointmentPayments(appointmentId: string): Observable<AppointmentPayments> {
    return this.api.get<ApiResponse<AppointmentPayments>>(`/appointments/${appointmentId}/payments`).pipe(map((r) => r.data))
  }

  payAppointment(appointmentId: string, amount: string, method: PaymentMethod, reference?: string): Observable<{ balance: string; cashMovementId: string | null }> {
    return this.api
      .post<ApiResponse<{ balance: string; cashMovementId: string | null }>>(`/appointments/${appointmentId}/payments`, {
        amount,
        method,
        ...(reference ? { reference } : {}),
      })
      .pipe(map((r) => r.data))
  }
}
