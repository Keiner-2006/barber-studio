import { Component, OnInit, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CashStore } from './cash.store'
import { METHOD_LABELS, MOVEMENT_LABELS, MovementType, NewMovement, OUTFLOW_TYPES, PaymentMethod } from './cash.models'

@Component({
  selector: 'app-cash',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <p class="eyebrow">Control de caja</p>
          <h1>Caja y pagos<em>.</em></h1>
          <p class="sub">Abre el turno con la base, registra ventas y gastos, y cierra contando el efectivo.</p>
        </div>
        @if (store.registers().length) {
          <div class="reg">
            <label for="reg">Caja</label>
            <select id="reg" class="input" [value]="store.selectedRegisterId()" (change)="store.selectRegister($any($event.target).value)">
              @for (r of store.registers(); track r.id) { <option [value]="r.id">{{ r.name }} · {{ r.branchName }}</option> }
            </select>
          </div>
        }
      </header>

      @if (store.error(); as e) { <div class="alert error" role="alert"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>{{ e }}</span></div> }
      @if (store.notice(); as n) { <div class="alert ok" role="status"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span><span>{{ n }}</span></div> }

      @if (store.loading()) {
        <div class="grid4">@for (i of [1, 2, 3, 4]; track i) { <span class="sk" style="height:110px"></span> }</div>
      } @else if (!store.registers().length) {
        <div class="empty">
          <span class="material-symbols-outlined" aria-hidden="true">point_of_sale</span>
          <strong>No hay cajas en esta sede</strong>
          <p>Crea la caja donde registrarás los cobros del día.</p>
          <form class="inline" (ngSubmit)="createRegister()">
            <input class="input" name="regName" [(ngModel)]="newRegisterName" placeholder="Caja principal" aria-label="Nombre de la caja" />
            <button class="btn btn-primary" type="submit" [disabled]="store.saving()">Crear caja</button>
          </form>
        </div>
      } @else if (store.openSession()) {
        @let s = store.openSession()!;
        <section class="status open">
          <span class="dot" aria-hidden="true"></span>
          <div><strong>Caja abierta</strong><small>Por {{ s.userName || 'usuario' }} · {{ time(s.openedAt) }}</small></div>
          <button class="btn btn-outline" (click)="closing.set(!closing())">
            <span class="material-symbols-outlined" aria-hidden="true">lock</span> {{ closing() ? 'Seguir operando' : 'Cerrar caja' }}
          </button>
        </section>

        <section class="grid4" aria-label="Resumen del turno">
          <article class="kpi"><span class="k-label">Base inicial</span><strong>{{ m(s.initialBalance) }}</strong><small>Efectivo al abrir</small></article>
          <article class="kpi hl"><span class="k-label">Efectivo en caja</span><strong>{{ m(s.totals.expectedCash) }}</strong><small>Base + entradas − salidas en efectivo</small></article>
          <article class="kpi"><span class="k-label">Ingresos del turno</span><strong>{{ m(s.totals.income) }}</strong>
            <small>Efectivo {{ m(s.totals.incomeCash) }} · Tarjeta {{ m(s.totals.incomeCard) }} · Transf. {{ m(s.totals.incomeTransfer) }}</small></article>
          <article class="kpi"><span class="k-label">Gastos y devoluciones</span><strong>{{ m(+s.totals.expenses + +s.totals.refunds) }}</strong><small>{{ s.totals.movements }} movimientos en total</small></article>
        </section>

        @if (closing()) {
          <form class="card close" (ngSubmit)="closeSession()">
            <h2>Cierre de caja</h2>
            <p class="muted">Cuenta el efectivo que hay físicamente en la caja. Tarjetas y transferencias no se cuentan.</p>
            <div class="close-grid">
              <div class="field">
                <label for="counted">Efectivo contado *</label>
                <input id="counted" class="input money" name="counted" inputmode="decimal" [(ngModel)]="counted" placeholder="0" required />
              </div>
              <div class="calc">
                <div><span>Esperado</span><b>{{ m(s.totals.expectedCash) }}</b></div>
                <div><span>Contado</span><b>{{ counted ? m(counted) : '—' }}</b></div>
                <div class="diff" [attr.data-tone]="diffTone()"><span>Diferencia</span><b>{{ counted ? signed(diff()) : '—' }}</b></div>
              </div>
            </div>
            <div class="field">
              <label for="closeNotes">Observaciones</label>
              <input id="closeNotes" class="input" name="closeNotes" [(ngModel)]="closeNotes" maxlength="300" placeholder="Ej.: faltante por cambio mal entregado" />
            </div>
            <div class="row-end">
              <button type="button" class="btn btn-outline" (click)="closing.set(false)">Cancelar</button>
              <button type="submit" class="btn btn-dark" [disabled]="store.saving() || !validMoney(counted)">{{ store.saving() ? 'Cerrando…' : 'Confirmar cierre' }}</button>
            </div>
          </form>
        }

        <div class="two">
          <form class="card" (ngSubmit)="addMovement()">
            <h2>Registrar movimiento</h2>
            <div class="seg" role="radiogroup" aria-label="Tipo de movimiento">
              @for (t of movementTypes; track t) {
                <button type="button" role="radio" [attr.aria-checked]="mv.type === t" [class.on]="mv.type === t" (click)="mv.type = t">{{ labels[t] }}</button>
              }
            </div>
            <div class="field">
              <label for="amount">Monto *</label>
              <input id="amount" class="input money" name="amount" inputmode="decimal" [(ngModel)]="mv.amount" placeholder="0" required />
            </div>
            <div class="field">
              <span class="lbl" id="method-label">Método</span>
              <div class="seg small" role="radiogroup" aria-labelledby="method-label">
                @for (k of methods; track k) {
                  <button type="button" role="radio" [attr.aria-checked]="mv.method === k" [class.on]="mv.method === k" (click)="mv.method = k">{{ methodLabels[k] }}</button>
                }
              </div>
            </div>
            <div class="field">
              <label for="notes">Concepto {{ mv.type === 'sale' ? '' : '*' }}</label>
              <input id="notes" class="input" name="notes" [(ngModel)]="mv.notes" maxlength="300"
                     [placeholder]="mv.type === 'sale' ? 'Ej.: venta de cera' : mv.type === 'expense' ? 'Ej.: compra de toallas' : mv.type === 'refund' ? 'Ej.: devolución a cliente' : 'Ej.: aporte de cambio'" />
            </div>
            <p class="hint">{{ isOutflow() ? 'Sale dinero del negocio.' : 'Entra dinero al negocio.' }} {{ mv.method === 'cash' ? 'Afecta el efectivo en caja.' : 'No cambia el efectivo en caja.' }}</p>
            <button class="btn btn-primary" type="submit" [disabled]="store.saving() || !canAdd()">
              <span class="material-symbols-outlined" aria-hidden="true">add</span> Registrar {{ labels[mv.type].toLowerCase() }}
            </button>
          </form>

          <section class="card">
            <div class="card-head"><h2>Movimientos del turno</h2><span class="muted">{{ store.transactions().length }}</span></div>
            @if (store.loadingTransactions()) {
              @for (i of [1, 2, 3]; track i) { <span class="sk" style="height:48px;margin-bottom:6px"></span> }
            } @else if (!store.transactions().length) {
              <p class="muted">Aún no hay movimientos. Los cobros de citas desde la agenda también aparecen aquí.</p>
            } @else {
              <ul class="moves">
                @for (t of store.transactions(); track t.id) {
                  <li>
                    <span class="ic" [class.out]="isOut(t.type)" aria-hidden="true"><span class="material-symbols-outlined">{{ isOut(t.type) ? 'arrow_upward' : 'arrow_downward' }}</span></span>
                    <div class="mv-text">
                      <strong>{{ t.notes || labels[t.type] }}</strong>
                      <small>{{ labels[t.type] }} · {{ methodLabels[t.method] }} · {{ time(t.createdAt) }}{{ t.actorName ? ' · ' + t.actorName : '' }}</small>
                    </div>
                    <b class="amt" [class.out]="isOut(t.type)">{{ isOut(t.type) ? '−' : '+' }}{{ m(t.amount) }}</b>
                  </li>
                }
              </ul>
            }
          </section>
        </div>
      } @else {
        <section class="card opener">
          <span class="material-symbols-outlined big" aria-hidden="true">lock_open</span>
          <div class="op-text">
            <h2>La caja está cerrada</h2>
            <p class="muted">Ábrela con el efectivo que dejas como base para dar cambio. Mientras esté cerrada no se pueden cobrar citas en efectivo.</p>
          </div>
          <form class="inline" (ngSubmit)="openSession()">
            <label class="sr" for="base">Base inicial</label>
            <input id="base" class="input money" name="base" inputmode="decimal" [(ngModel)]="base" placeholder="Base inicial, ej. 50000" />
            <button class="btn btn-primary" type="submit" [disabled]="store.saving() || (base !== '' && !validMoney(base))">{{ store.saving() ? 'Abriendo…' : 'Abrir caja' }}</button>
          </form>
        </section>
      }

      @if (store.history().length) {
        <section class="card hist">
          <div class="card-head"><h2>Cierres anteriores</h2><span class="muted">Últimos {{ store.history().length }}</span></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Turno</th><th>Responsable</th><th class="num">Ingresos</th><th class="num">Esperado</th><th class="num">Contado</th><th class="num">Diferencia</th></tr></thead>
              <tbody>
                @for (h of store.history(); track h.id) {
                  <tr>
                    <td>{{ time(h.openedAt) }} → {{ h.closedAt ? time(h.closedAt) : '—' }}</td>
                    <td>{{ h.userName || '—' }}{{ h.closedByName && h.closedByName !== h.userName ? ' / ' + h.closedByName : '' }}</td>
                    <td class="num">{{ m(h.totals.income) }}</td>
                    <td class="num">{{ m(h.expectedBalance) }}</td>
                    <td class="num">{{ m(h.countedBalance) }}</td>
                    <td class="num"><span class="chip" [attr.data-tone]="tone(+(h.difference ?? 0))">{{ signed(+(h.difference ?? 0)) }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { --ink: #2a1b12; --copper: #944928; --line: #e6dfd5; --muted: #57534e; --paper: #f7f3ec;
      color: #1c1c16; margin: 0 auto; max-width: 1240px; padding: clamp(20px, 4vw, 40px); }
    .material-symbols-outlined { font-size: 20px; line-height: 1; }
    button:focus-visible, input:focus-visible, select:focus-visible { outline: 3px solid #c4703f; outline-offset: 2px; }
    .head { align-items: flex-end; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; margin-bottom: 20px; }
    .eyebrow { color: var(--copper); font-size: 13px; font-weight: 700; letter-spacing: .12em; margin: 0 0 6px; text-transform: uppercase; }
    h1 { font: 700 clamp(28px, 3.6vw, 40px)/1.15 'Vollkorn', serif; margin: 0; }
    h1 em { color: var(--copper); }
    .sub { color: var(--muted); margin: 6px 0 0; }
    h2 { font: 600 20px 'Vollkorn', serif; margin: 0 0 12px; }
    .muted { color: var(--muted); }
    .reg { display: grid; gap: 4px; min-width: 240px; }
    .reg label, .field label, .lbl { color: var(--ink); font-size: 14px; font-weight: 700; }
    .input { background: #fff; border: 1.5px solid var(--line); border-radius: 12px; color: #1c1c16; font: 15px 'Plus Jakarta Sans', sans-serif; min-height: 44px; padding: 0 12px; width: 100%; }
    .input:focus { border-color: #c4703f; box-shadow: 0 0 0 4px rgba(196,112,63,.15); outline: none; }
    .money { font-size: 18px; font-variant-numeric: tabular-nums; font-weight: 700; }
    .btn { align-items: center; border: 1.5px solid transparent; border-radius: 12px; cursor: pointer; display: inline-flex; font: 700 15px 'Plus Jakarta Sans', sans-serif; gap: 6px; justify-content: center; min-height: 46px; padding: 0 18px; white-space: nowrap; }
    .btn:disabled { cursor: not-allowed; opacity: .55; }
    .btn-primary { background: linear-gradient(135deg, #e09a68, #c4703f); color: #17100c; }
    .btn-dark { background: #412311; color: #fff; }
    .btn-outline { background: #fff; border-color: var(--line); color: var(--ink); }
    .btn-outline:hover { border-color: #c4703f; }
    .alert { align-items: center; border-radius: 12px; display: flex; font-size: 15px; gap: 10px; margin-bottom: 16px; padding: 12px 14px; }
    .alert.error { background: #fdecea; border: 1px solid #f2bdb8; color: #8c1d12; }
    .alert.ok { background: #e6f5ed; border: 1px solid #a9dcc0; color: #0f5c37; }
    .card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px 22px; }
    .card-head { align-items: baseline; display: flex; justify-content: space-between; }
    .status { align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 16px; display: flex; gap: 12px; margin-bottom: 16px; padding: 14px 18px; }
    .status div { flex: 1; }
    .status strong { display: block; }
    .status small { color: var(--muted); }
    .dot { background: #1f8a57; border-radius: 50%; box-shadow: 0 0 0 4px rgba(31,138,87,.18); height: 10px; width: 10px; }
    .grid4 { display: grid; gap: 14px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 16px; }
    .kpi { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; }
    .kpi.hl { background: #2a1b12; border-color: #2a1b12; color: #f6eee4; }
    .kpi.hl small, .kpi.hl .k-label { color: #d9cdc1; }
    .k-label { color: var(--muted); display: block; font-size: 14px; font-weight: 600; }
    .kpi strong { display: block; font: 700 28px/1.2 'Vollkorn', serif; font-variant-numeric: tabular-nums; margin: 4px 0; }
    .kpi small { color: var(--muted); font-size: 13px; }
    .two { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); }
    form.card { display: grid; gap: 14px; align-content: start; }
    .field { display: grid; gap: 6px; }
    .seg { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; display: grid; gap: 4px; grid-template-columns: repeat(4, 1fr); padding: 4px; }
    .seg button { background: none; border: 0; border-radius: 9px; color: var(--muted); cursor: pointer; font: 600 14px 'Plus Jakarta Sans', sans-serif; min-height: 40px; padding: 0 6px; }
    .seg button.on { background: #fff; box-shadow: 0 2px 8px rgba(42,27,18,.1); color: var(--ink); }
    .hint { color: var(--muted); font-size: 13px; margin: 0; }
    .moves { display: grid; gap: 2px; list-style: none; margin: 0; padding: 0; }
    .moves li { align-items: center; border-bottom: 1px solid #f0ebe3; display: flex; gap: 12px; padding: 10px 2px; }
    .ic { align-items: center; background: #e6f5ed; border-radius: 10px; color: #146c43; display: flex; flex: none; height: 36px; justify-content: center; width: 36px; }
    .ic.out { background: #fdecea; color: #8c1d12; }
    .mv-text { flex: 1; min-width: 0; }
    .mv-text strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mv-text small { color: var(--muted); font-size: 13px; }
    .amt { color: #146c43; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .amt.out { color: #8c1d12; }
    .close { border-color: #ecc3a6; margin-bottom: 16px; }
    .close-grid { align-items: end; display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); }
    .calc { background: var(--paper); border-radius: 14px; display: grid; gap: 6px; padding: 12px 14px; }
    .calc div { display: flex; justify-content: space-between; }
    .calc b { font-variant-numeric: tabular-nums; }
    .diff[data-tone='ok'] b { color: #146c43; }
    .diff[data-tone='short'] b { color: #8c1d12; }
    .diff[data-tone='over'] b { color: #7a4d00; }
    .row-end { display: flex; gap: 10px; justify-content: flex-end; }
    .opener { align-items: center; display: flex; flex-wrap: wrap; gap: 18px; margin-bottom: 16px; }
    .big { color: var(--copper); font-size: 40px; }
    .op-text { flex: 1 1 280px; }
    .op-text h2 { margin-bottom: 4px; }
    .op-text p { margin: 0; }
    .inline { display: flex; flex-wrap: wrap; gap: 10px; }
    .inline .input { flex: 1 1 200px; }
    .empty { align-items: center; border: 2px dashed var(--line); border-radius: 16px; color: var(--muted); display: flex; flex-direction: column; gap: 8px; padding: 40px 16px; text-align: center; }
    .empty .material-symbols-outlined { color: #a08d7e; font-size: 34px; }
    .empty strong { color: var(--ink); font-size: 17px; }
    .empty p { margin: 0 0 6px; }
    .hist { margin-top: 16px; }
    .table-wrap { overflow-x: auto; }
    table { border-collapse: collapse; min-width: 640px; width: 100%; }
    th { border-bottom: 1px solid var(--line); color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: .06em; padding: 8px 10px; text-align: left; text-transform: uppercase; }
    td { border-bottom: 1px solid #f0ebe3; font-size: 14px; padding: 10px; }
    .num { font-variant-numeric: tabular-nums; text-align: right; }
    .chip { border-radius: 999px; font-size: 12px; font-weight: 700; padding: 3px 10px; }
    .chip[data-tone='ok'] { background: #e6f5ed; color: #0f5c37; }
    .chip[data-tone='short'] { background: #fdecea; color: #8c1d12; }
    .chip[data-tone='over'] { background: #fff4dc; color: #7a4d00; }
    .sk { animation: pulse 1.4s ease-in-out infinite; background: #f1ece4; border-radius: 12px; display: block; }
    @keyframes pulse { 50% { opacity: .55; } }
    .sr { height: 1px; overflow: hidden; position: absolute; width: 1px; clip: rect(0 0 0 0); }
    @media (max-width: 1100px) { .grid4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .two { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .grid4, .close-grid { grid-template-columns: 1fr; } .seg { grid-template-columns: 1fr 1fr; } }
    @media (prefers-reduced-motion: reduce) { .sk { animation: none; } }
  `],
})
export class CashComponent implements OnInit {
  readonly labels = MOVEMENT_LABELS
  readonly methodLabels = METHOD_LABELS
  readonly movementTypes: NewMovement['type'][] = ['sale', 'expense', 'refund', 'adjustment']
  readonly methods: PaymentMethod[] = ['cash', 'card_manual', 'transfer_manual', 'other']

  readonly closing = signal(false)
  base = ''
  counted = ''
  closeNotes = ''
  newRegisterName = 'Caja principal'
  mv: NewMovement = { type: 'sale', method: 'cash', amount: '', notes: '' }

  readonly diff = computed(() => Number(this.counted || 0) - Number(this.store.openSession()?.totals.expectedCash ?? 0))

  constructor(public store: CashStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  m(v: string | number | null | undefined): string {
    return this.store.money(v ?? 0, this.store.openSession()?.currency ?? this.store.sessions()[0]?.currency ?? 'COP')
  }

  signed(v: number): string {
    return v === 0 ? this.m(0) : `${v > 0 ? '+' : '−'}${this.m(Math.abs(v))}`
  }

  tone(v: number): 'ok' | 'short' | 'over' {
    return Math.abs(v) < 0.005 ? 'ok' : v < 0 ? 'short' : 'over'
  }

  diffTone(): 'ok' | 'short' | 'over' {
    return this.tone(this.diff())
  }

  time(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  validMoney(v: string): boolean {
    return /^\d{1,10}(\.\d{1,2})?$/.test(String(v).trim())
  }

  isOut(type: MovementType): boolean {
    return OUTFLOW_TYPES.includes(type)
  }

  isOutflow(): boolean {
    return this.isOut(this.mv.type)
  }

  canAdd(): boolean {
    return this.validMoney(this.mv.amount) && Number(this.mv.amount) > 0 && (this.mv.type === 'sale' || !!this.mv.notes?.trim())
  }

  openSession(): void {
    this.store.open(this.base.trim(), () => (this.base = ''))
  }

  closeSession(): void {
    this.store.close(this.counted.trim(), this.closeNotes.trim(), () => {
      this.counted = ''
      this.closeNotes = ''
      this.closing.set(false)
    })
  }

  addMovement(): void {
    if (!this.canAdd()) return
    const data: NewMovement = { ...this.mv, amount: this.mv.amount.trim(), notes: this.mv.notes?.trim() || undefined }
    this.store.addMovement(data, () => (this.mv = { type: this.mv.type, method: this.mv.method, amount: '', notes: '' }))
  }

  createRegister(): void {
    this.store.createRegister(this.newRegisterName.trim() || 'Caja principal', () => {})
  }
}
