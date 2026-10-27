import { Injectable, signal, computed } from '@angular/core'
import { CashRegister, CashSession, CashTransaction } from './cash.models'
import { CashApi } from './cash.api'
import { TenantService } from '../../core/tenancy/tenant.service'

@Injectable({ providedIn: 'root' })
export class CashStore {
  private _registers = signal<CashRegister[]>([])
  private _sessions = signal<CashSession[]>([])
  private _transactions = signal<CashTransaction[]>([])
  private _loading = signal(true)
  private _loadingTransactions = signal(false)

  readonly loading = this._loading.asReadonly()
  readonly loadingTransactions = this._loadingTransactions.asReadonly()
  readonly registers = this._registers.asReadonly()
  readonly sessions = this._sessions.asReadonly()
  readonly transactions = this._transactions.asReadonly()

  readonly selectedRegisterId = signal<string>('')
  readonly initialBalance = signal<string>('')
  readonly countedBalance = signal<string>('')
  readonly openSessionDialog = signal(false)
  readonly closeSessionDialog = signal(false)

  readonly openSession = computed(() => this._sessions().find((s) => s.isOpen) ?? null)

  readonly expectedBalance = computed(() => {
    const session = this.openSession()
    if (!session) return '—'
    const expected = parseFloat(session.expectedBalance || session.initialBalance || '0')
    return `$${expected.toFixed(2)}`
  })

  constructor(
    private api: CashApi,
    private tenantService: TenantService
  ) {}

  load(): void {
    const branchId = this.tenantService.getBranchId()
    this.api.getRegisters().subscribe({
      next: (regs) => {
        const filtered = branchId ? regs.filter((r) => r.branchId === branchId) : regs
        this._registers.set(filtered)
        if (filtered.length > 0) {
          this.selectedRegisterId.set(filtered[0].id)
        }
        this.loadSessions()
      },
      error: () => this._loading.set(false),
    })
  }

  private loadSessions(): void {
    const registerId = this.selectedRegisterId()
    if (!registerId) {
      this._loading.set(false)
      return
    }
    this.api.getSessions(registerId, true).subscribe({
      next: (sessions) => {
        this._sessions.set(sessions ?? [])
        const openSess = sessions.find((s) => s.isOpen)
        if (openSess) {
          this.loadTransactions(openSess.id)
        }
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  private loadTransactions(sessionId: string): void {
    this._loadingTransactions.set(true)
    this.api.getTransactions(sessionId).subscribe({
      next: (txs) => {
        this._transactions.set((txs ?? []).map((tx) => ({ ...tx, concept: this.getConcept(tx), methodLabel: this.getMethodLabel(tx) })))
        this._loadingTransactions.set(false)
      },
      error: () => this._loadingTransactions.set(false),
    })
  }

  openSessionAction(): void {
    const registerId = this.selectedRegisterId()
    if (!registerId) return
    this.api.openSession({ cashRegisterId: registerId, initialBalance: this.initialBalance() }).subscribe({
      next: (session) => {
        this._sessions.update((s) => [session, ...s])
        this._transactions.set([])
        this.openSessionDialog.set(false)
        this.initialBalance.set('')
        this.loadTransactions(session.id)
      },
    })
  }

  closeSessionAction(): void {
    const session = this.openSession()
    if (!session) return
    this.api.closeSession(session.id, this.countedBalance()).subscribe({
      next: () => {
        this._sessions.update((s) => s.filter((x) => x.id !== session.id))
        this._transactions.set([])
        this.closeSessionDialog.set(false)
        this.countedBalance.set('')
      },
    })
  }

  private getConcept(tx: CashTransaction): string {
    if (tx.reference) return tx.reference
    if (tx.notes) return tx.notes
    const typeLabels: Record<string, string> = {
      sale: 'Venta',
      appointment: 'Reserva',
      expense: 'Gasto',
      refund: 'Devolución',
      adjustment: 'Ajuste',
    }
    return typeLabels[tx.type] || tx.type
  }

  private getMethodLabel(tx: CashTransaction): string {
    const methodLabels: Record<string, string> = {
      cash: 'Efectivo',
      card_manual: 'Tarjeta (manual)',
      transfer_manual: 'Transferencia',
      other: 'Otro',
    }
    return methodLabels[tx.method] || tx.method
  }

  formatMoney(amount: string, currency: string): string {
    const num = parseFloat(amount || '0')
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(num)
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
}
