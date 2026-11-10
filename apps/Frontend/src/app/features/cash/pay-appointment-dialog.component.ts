import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AppointmentPayments, CashApi } from './cash.api'
import { METHOD_LABELS, PaymentMethod } from './cash.models'
import { apiError } from './cash.store'

/** Charge an appointment: shows price, paid and balance; supports partial and mixed payments. */
@Component({
  selector: 'app-pay-appointment-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="pay-title" (click)="$event.stopPropagation()" (ngSubmit)="pay()" (keydown.escape)="closed.emit()">
        <div class="top">
          <div><p class="eyebrow">Cobrar cita</p><h2 id="pay-title">{{ clientName }}</h2><p class="muted">{{ service }}</p></div>
          <button type="button" class="x" (click)="closed.emit()" aria-label="Cerrar"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
        </div>

        @if (!info()) {
          <span class="sk"></span>
        } @else {
          <div class="sum">
            <div><span>Precio</span><b>{{ m(info()!.price) }}</b></div>
            <div><span>Pagado</span><b>{{ m(info()!.paid) }}</b></div>
            <div class="bal"><span>Saldo</span><b>{{ m(info()!.balance) }}</b></div>
          </div>

          @if (+info()!.balance <= 0) {
            <p class="done"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span> Esta cita ya está pagada.</p>
          } @else {
            <div class="field">
              <span class="lbl" id="pm">Método</span>
              <div class="seg" role="radiogroup" aria-labelledby="pm">
                @for (k of methods; track k) {
                  <button type="button" role="radio" [attr.aria-checked]="method === k" [class.on]="method === k" (click)="method = k">{{ labels[k] }}</button>
                }
              </div>
            </div>
            <div class="field">
              <label for="pay-amount">Monto</label>
              <input id="pay-amount" class="input money" name="amount" inputmode="decimal" [(ngModel)]="amount" required />
              <small class="muted">Puedes cobrar una parte y el resto con otro método.</small>
            </div>
            @if (method !== 'cash') {
              <div class="field">
                <label for="pay-ref">Referencia <span class="muted">(opcional)</span></label>
                <input id="pay-ref" class="input" name="reference" [(ngModel)]="reference" maxlength="120" placeholder="Nº de aprobación o transferencia" />
              </div>
            }
          }

          @if (info()!.payments.length) {
            <ul class="prev">
              @for (p of info()!.payments; track p.id) { <li><span>{{ labels[p.method] }} · {{ time(p.createdAt) }}</span><b>{{ m(p.amount) }}</b></li> }
            </ul>
          }
        }

        @if (error()) { <p class="err" role="alert">{{ error() }}</p> }

        <div class="actions">
          <button type="button" class="btn btn-outline" (click)="closed.emit()">{{ info() && +info()!.balance <= 0 ? 'Cerrar' : 'Cancelar' }}</button>
          @if (info() && +info()!.balance > 0) {
            <button type="submit" class="btn btn-primary" [disabled]="saving() || !valid()">{{ saving() ? 'Cobrando…' : 'Cobrar ' + m(amount || 0) }}</button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [`
    .backdrop { align-items: center; background: rgba(23,16,12,.55); display: flex; inset: 0; justify-content: center; padding: 16px; position: fixed; z-index: 100; }
    .dialog { background: #fff; border-radius: 22px; box-shadow: 0 30px 80px rgba(0,0,0,.3); color: #1c1c16; display: grid; font: 15px/1.5 'Plus Jakarta Sans', sans-serif; gap: 14px; max-height: calc(100vh - 32px); max-width: 460px; overflow-y: auto; padding: 22px; width: 100%; }
    .material-symbols-outlined { font-size: 20px; line-height: 1; }
    .top { align-items: flex-start; display: flex; justify-content: space-between; }
    .eyebrow { color: #944928; font-size: 12px; font-weight: 700; letter-spacing: .12em; margin: 0; text-transform: uppercase; }
    h2 { font: 700 24px 'Vollkorn', serif; margin: 2px 0 0; }
    .muted { color: #57534e; margin: 0; }
    .x { background: none; border: 0; border-radius: 10px; cursor: pointer; height: 40px; width: 40px; }
    .x:hover { background: #f1ece4; }
    .sum { background: #f7f3ec; border-radius: 14px; display: grid; gap: 6px; padding: 12px 14px; }
    .sum div { display: flex; justify-content: space-between; }
    .sum b { font-variant-numeric: tabular-nums; }
    .bal { border-top: 1px solid #e6dfd5; padding-top: 6px; }
    .bal b { color: #944928; font-size: 18px; }
    .done { align-items: center; color: #0f5c37; display: flex; font-weight: 700; gap: 8px; margin: 0; }
    .field { display: grid; gap: 6px; }
    .field label, .lbl { font-size: 14px; font-weight: 700; }
    .input { border: 1.5px solid #e6dfd5; border-radius: 12px; font: 15px 'Plus Jakarta Sans', sans-serif; min-height: 44px; padding: 0 12px; width: 100%; }
    .input:focus { border-color: #c4703f; box-shadow: 0 0 0 4px rgba(196,112,63,.15); outline: none; }
    .money { font-size: 20px; font-variant-numeric: tabular-nums; font-weight: 700; }
    .seg { background: #f7f3ec; border: 1px solid #e6dfd5; border-radius: 12px; display: grid; gap: 4px; grid-template-columns: repeat(4, 1fr); padding: 4px; }
    .seg button { background: none; border: 0; border-radius: 9px; color: #57534e; cursor: pointer; font: 600 13px 'Plus Jakarta Sans', sans-serif; min-height: 40px; }
    .seg button.on { background: #fff; box-shadow: 0 2px 8px rgba(42,27,18,.1); color: #2a1b12; }
    .prev { border-top: 1px solid #f0ebe3; display: grid; gap: 4px; list-style: none; margin: 0; padding: 10px 0 0; }
    .prev li { color: #57534e; display: flex; font-size: 14px; justify-content: space-between; }
    .err { background: #fdecea; border-radius: 10px; color: #8c1d12; font-weight: 600; margin: 0; padding: 10px 12px; }
    .actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn { align-items: center; border: 1.5px solid transparent; border-radius: 12px; cursor: pointer; display: inline-flex; font: 700 15px 'Plus Jakarta Sans', sans-serif; justify-content: center; min-height: 46px; padding: 0 18px; }
    .btn:disabled { cursor: not-allowed; opacity: .55; }
    .btn-primary { background: linear-gradient(135deg, #e09a68, #c4703f); color: #17100c; }
    .btn-outline { background: #fff; border-color: #e6dfd5; color: #2a1b12; }
    button:focus-visible, input:focus-visible { outline: 3px solid #c4703f; outline-offset: 2px; }
    .sk { animation: pulse 1.4s ease-in-out infinite; background: #f1ece4; border-radius: 12px; display: block; height: 96px; }
    @keyframes pulse { 50% { opacity: .55; } }
    @media (max-width: 420px) { .seg { grid-template-columns: 1fr 1fr; } }
  `],
})
export class PayAppointmentDialogComponent implements OnInit {
  @Input({ required: true }) appointmentId!: string
  @Input() clientName = ''
  @Input() service = ''
  @Output() closed = new EventEmitter<void>()
  @Output() paid = new EventEmitter<void>()

  readonly labels = METHOD_LABELS
  readonly methods: PaymentMethod[] = ['cash', 'card_manual', 'transfer_manual', 'other']
  readonly info = signal<AppointmentPayments | null>(null)
  readonly saving = signal(false)
  readonly error = signal<string | null>(null)
  method: PaymentMethod = 'cash'
  amount = ''
  reference = ''

  constructor(private api: CashApi) {}

  ngOnInit(): void {
    this.reload()
  }

  m(v: string | number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: this.info()?.payments[0]?.currency ?? 'COP', maximumFractionDigits: 0 }).format(Number(v || 0))
  }

  time(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  valid(): boolean {
    const n = Number(this.amount)
    return /^\d{1,10}(\.\d{1,2})?$/.test(this.amount.trim()) && n > 0 && n <= Number(this.info()?.balance ?? 0) + 0.005
  }

  pay(): void {
    if (!this.valid() || this.saving()) return
    this.saving.set(true)
    this.error.set(null)
    this.api.payAppointment(this.appointmentId, this.amount.trim(), this.method, this.reference.trim() || undefined).subscribe({
      next: () => {
        this.saving.set(false)
        this.reference = ''
        this.paid.emit()
        this.reload()
      },
      error: (err) => {
        this.saving.set(false)
        this.error.set(apiError(err, 'No se pudo registrar el pago'))
      },
    })
  }

  private reload(): void {
    this.api.getAppointmentPayments(this.appointmentId).subscribe({
      next: (info) => {
        this.info.set(info)
        this.amount = Number(info.balance) > 0 ? String(Number(info.balance)) : ''
      },
      error: (err) => this.error.set(apiError(err, 'No se pudo cargar el saldo de la cita')),
    })
  }
}
