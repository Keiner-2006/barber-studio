import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { ApiClient } from '../../core/http/api-client'
import { ApiResponse } from '@navaja/shared'
import { CashRegister, CashSession, CashTransaction } from './cash.models'

@Injectable({ providedIn: 'root' })
export class CashApi {
  constructor(private api: ApiClient) {}

  getRegisters(): Observable<CashRegister[]> {
    return this.api.get<ApiResponse<CashRegister[]>>('/cash/registers').pipe(map((r) => r.data))
  }

  getSessions(registerId?: string, openOnly: boolean = false): Observable<CashSession[]> {
    const params: Record<string, string | number | boolean | undefined> = { openOnly: openOnly ? 'true' : 'false' }
    if (registerId) params['registerId'] = registerId
    return this.api.get<ApiResponse<CashSession[]>>('/cash/sessions', params).pipe(map((r) => r.data))
  }

  getOpenSession(registerId: string): Observable<CashSession | null> {
    return this.getSessions(registerId, true).pipe(
      map((sessions) => sessions.find((s) => s.isOpen) ?? null)
    )
  }

  getTransactions(sessionId: string): Observable<CashTransaction[]> {
    return this.api
      .get<ApiResponse<CashTransaction[]>>('/cash/sessions', { sessionId })
      .pipe(map((r) => r.data))
  }

  openSession(data: { cashRegisterId: string; initialBalance: string }): Observable<CashSession> {
    return this.api
      .post<ApiResponse<CashSession>>('/cash', { action: 'open', ...data })
      .pipe(map((r) => r.data))
  }

  closeSession(sessionId: string, countedBalance: string): Observable<CashSession> {
    return this.api
      .post<ApiResponse<CashSession>>('/cash', { action: 'close', sessionId, countedBalance })
      .pipe(map((r) => r.data))
  }

  addTransaction(sessionId: string, data: { type: string; method: string; amount: string; reference?: string; notes?: string }): Observable<CashTransaction> {
    return this.api
      .post<ApiResponse<CashTransaction>>('/cash', { action: 'transaction', sessionId, ...data })
      .pipe(map((r) => r.data))
  }
}
