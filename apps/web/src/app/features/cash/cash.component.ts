import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CashStore } from './cash.store'

@Component({
  selector: 'app-cash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Control de caja</p>
          <h1>Caja y pagos<span class="accent">.</span></h1>
          <p class="subtitle">Gestionas apertura, cierre y transacciones de caja.</p>
        </div>
        <button class="primary-button" (click)="store.openSessionDialog.set(true)" *ngIf="!store.openSession()">
          Abrir caja
        </button>
      </div>

      @if (store.openSession()) {
        <div class="session-info">
          <div class="session-badge">Caja abierta · {{ store.openSession()?.userName || 'Usuario' }}</div>
          <button class="secondary-button" (click)="store.closeSessionDialog.set(true)">Cerrar caja</button>
        </div>
      }

      <div class="card">
        <div class="card-header">
          <h3>Transacciones</h3>
          <p>{{ store.transactions().length }} movimientos</p>
        </div>
        @if (store.loadingTransactions()) {
          <div class="loading">Cargando...</div>
        } @else if (store.transactions().length === 0) {
          <p class="empty">No hay transacciones registradas</p>
        } @else {
          <table class="transactions-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Método</th>
                <th>Importe</th>
                <th>Actor</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of store.transactions(); track tx.id) {
                <tr>
                   <td>{{ tx.concept }}</td>
                   <td>{{ tx.methodLabel }}</td>
                   <td>{{ store.formatMoney(tx.amount, tx.currency) }}</td>
                   <td>{{ tx.actorName || '—' }}</td>
                   <td>{{ store.formatDate(tx.createdAt) }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>

    <div class="dialog-backdrop" *ngIf="store.openSessionDialog()">
      <div class="dialog">
        <h3>Abrir caja</h3>
        <div class="form-group">
          <label>Sucursal</label>
          <select class="form-select" [(ngModel)]="selectedRegisterId">
            @for (reg of store.registers(); track reg.id) {
              <option [ngValue]="reg.id">{{ reg.name }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label>Balance inicial</label>
          <input class="form-input" type="number" placeholder="0.00" [(ngModel)]="initialBalance" />
        </div>
        <div class="dialog-actions">
          <button class="secondary-button" (click)="store.openSessionDialog.set(false)">Cancelar</button>
          <button class="primary-button" (click)="doOpenSession()">Abrir</button>
        </div>
      </div>
    </div>

    <div class="dialog-backdrop" *ngIf="store.closeSessionDialog()">
      <div class="dialog">
        <h3>Cerrar caja</h3>
        <p class="close-summary">Balance esperado: {{ store.expectedBalance() }}</p>
        <div class="form-group">
          <label>Balance contado</label>
          <input class="form-input" type="number" placeholder="0.00" [(ngModel)]="countedBalance" />
        </div>
        <div class="dialog-actions">
          <button class="secondary-button" (click)="store.closeSessionDialog.set(false)">Cancelar</button>
          <button class="primary-button" (click)="doCloseSession()">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .secondary-button { padding: 8px 14px; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .session-info { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .session-badge { padding: 6px 14px; background: #dcfce7; color: #166534; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 16px; color: #2d2d2d; }
    .card-header p { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .loading { padding: 24px; text-align: center; color: #6b7280; }
    .empty { padding: 24px; text-align: center; color: #6b7280; font-size: 13px; }
    .transactions-table { width: 100%; border-collapse: collapse; }
    .transactions-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .transactions-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .transactions-table tbody tr:last-child td { border-bottom: none; }
    .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .dialog { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 420px; }
    .dialog h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; margin-top: 0; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px; }
    .form-select, .form-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; }
    .form-input { box-sizing: border-box; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
    .close-summary { font-size: 14px; color: #2d2d2d; }
  `]
})
export class CashComponent implements OnInit {
  selectedRegisterId: string = ''
  initialBalance: string = ''
  countedBalance: string = ''

  constructor(public store: CashStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  doOpenSession(): void {
    const registerId = this.selectedRegisterId || this.store.selectedRegisterId()
    if (!registerId) return
    this.store.selectedRegisterId.set(registerId)
    this.store.initialBalance.set(this.initialBalance)
    this.store.openSessionAction()
  }

  doCloseSession(): void {
    this.store.countedBalance.set(this.countedBalance)
    this.store.closeSessionAction()
  }
}
