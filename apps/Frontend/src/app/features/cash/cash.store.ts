import { Injectable, signal, computed } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'
import { CashRegister, CashSession, CashTransaction, NewMovement } from './cash.models'
import { CashApi } from './cash.api'
import { TenantService } from '../../core/tenancy/tenant.service'

export function apiError(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: { message?: string }; message?: string } | null
    return body?.error?.message ?? body?.message ?? (err.status === 0 ? 'Sin conexión con el servidor' : fallback)
  }
  return fallback
}

@Injectable({ providedIn: 'root' })
export class CashStore {
  readonly registers = signal<CashRegister[]>([])
  readonly selectedRegisterId = signal<string>('')
  readonly sessions = signal<CashSession[]>([])
  readonly transactions = signal<CashTransaction[]>([])
  readonly loading = signal(true)
  readonly loadingTransactions = signal(false)
  readonly saving = signal(false)
  readonly error = signal<string | null>(null)
  readonly notice = signal<string | null>(null)

  readonly selectedRegister = computed(() => this.registers().find((r) => r.id === this.selectedRegisterId()) ?? null)
  readonly openSession = computed(() => this.sessions().find((s) => s.isOpen) ?? null)
  readonly history = computed(() => this.sessions().filter((s) => !s.isOpen))

  constructor(private api: CashApi, private tenantService: TenantService) {}

  load(): void {
    this.loading.set(true)
    this.error.set(null)
    const branchId = this.tenantService.getBranchId()
    this.api.getRegisters().subscribe({
      next: (regs) => {
        const list = branchId ? regs.filter((r) => r.branchId === branchId) : regs
        this.registers.set(list.length ? list : regs)
        const keep = this.registers().find((r) => r.id === this.selectedRegisterId())
        this.selectedRegisterId.set(keep?.id ?? this.registers()[0]?.id ?? '')
        this.loadSessions()
      },
      error: (err) => {
        this.error.set(apiError(err, 'No se pudieron cargar las cajas'))
        this.loading.set(false)
      },
    })
  }

  selectRegister(id: string): void {
    this.selectedRegisterId.set(id)
    this.loadSessions()
  }

  loadSessions(): void {
    const registerId = this.selectedRegisterId()
    this.transactions.set([])
    if (!registerId) {
      this.sessions.set([])
      this.loading.set(false)
      return
    }
    this.api.getSessions(registerId).subscribe({
      next: (sessions) => {
        this.sessions.set(sessions ?? [])
        const open = this.openSession()
        if (open) this.loadTransactions(open.id)
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set(apiError(err, 'No se pudieron cargar las sesiones de caja'))
        this.loading.set(false)
      },
    })
  }

  loadTransactions(sessionId: string): void {
    this.loadingTransactions.set(true)
    this.api.getTransactions(sessionId).subscribe({
      next: (txs) => {
        this.transactions.set(txs ?? [])
        this.loadingTransactions.set(false)
      },
      error: () => this.loadingTransactions.set(false),
    })
  }

  open(initialBalance: string, done: () => void): void {
    const register = this.selectedRegister()
    if (!register) return
    this.run(this.api.openSession(register.id, initialBalance || '0'), 'No se pudo abrir la caja', (session) => {
      this.sessions.update((s) => [session, ...s])
      this.transactions.set([])
      this.notice.set(`Caja abierta con base de ${this.money(session.initialBalance, session.currency)}.`)
      done()
    })
  }

  close(countedBalance: string, notes: string, done: () => void): void {
    const session = this.openSession()
    if (!session) return
    this.run(this.api.closeSession(session.id, countedBalance, notes || undefined), 'No se pudo cerrar la caja', (closed) => {
      this.sessions.update((list) => list.map((s) => (s.id === closed.id ? closed : s)))
      this.transactions.set([])
      const diff = Number(closed.difference ?? 0)
      this.notice.set(
        diff === 0
          ? 'Caja cerrada. El conteo cuadra exactamente.'
          : `Caja cerrada con ${diff > 0 ? 'sobrante' : 'faltante'} de ${this.money(String(Math.abs(diff)), closed.currency)}.`,
      )
      done()
    })
  }

  addMovement(data: NewMovement, done: () => void): void {
    const session = this.openSession()
    if (!session) return
    this.run(this.api.addMovement(session.id, data), 'No se pudo registrar el movimiento', () => {
      this.notice.set('Movimiento registrado.')
      this.refreshOpenSession()
      done()
    })
  }

  createRegister(name: string, done: () => void): void {
    const branchId = this.tenantService.getBranchId() ?? this.registers()[0]?.branchId
    if (!branchId) return
    this.run(this.api.createRegister(branchId, name), 'No se pudo crear la caja', (reg) => {
      this.registers.update((r) => [...r, reg])
      this.selectRegister(reg.id)
      done()
    })
  }

  /** Re-reads the open session totals and its movements (after a movement or an appointment charge). */
  refreshOpenSession(): void {
    const registerId = this.selectedRegisterId()
    if (!registerId) return
    this.api.getSessions(registerId).subscribe({
      next: (sessions) => {
        this.sessions.set(sessions ?? [])
        const open = this.openSession()
        if (open) this.loadTransactions(open.id)
      },
    })
  }

  money(amount: string | number | null | undefined, currency = 'COP'): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount ?? 0))
  }

  private run<T>(obs: import('rxjs').Observable<T>, fallback: string, onOk: (v: T) => void): void {
    this.saving.set(true)
    this.error.set(null)
    this.notice.set(null)
    obs.subscribe({
      next: (v) => {
        this.saving.set(false)
        onOk(v)
      },
      error: (err) => {
        this.saving.set(false)
        this.error.set(apiError(err, fallback))
      },
    })
  }
}
