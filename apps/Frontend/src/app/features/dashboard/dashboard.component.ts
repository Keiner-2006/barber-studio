import { Component, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { DashboardStore } from './dashboard.store'
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BarChartComponent],
  template: `
    <div class="dash">
      <header class="head">
        <div>
          <p class="date">{{ store.todayLabel }}</p>
          <h1>{{ store.greeting }}@if (store.userName()) {, {{ store.userName() }}}<span class="dot">.</span></h1>
          <p class="sub">Así va tu estudio hoy.</p>
        </div>
        <a class="btn" routerLink="/agenda"><span class="material-symbols-outlined" aria-hidden="true">add</span> Nueva reserva</a>
      </header>

      <section class="kpis" aria-label="Indicadores de hoy">
        @for (k of store.kpis(); track k.label) {
          <article class="kpi">
            <div class="kpi-top">
              <span class="kpi-label">{{ k.label }}</span>
              <span class="kpi-icon" [attr.data-tone]="k.tone"><span class="material-symbols-outlined" aria-hidden="true">{{ k.icon }}</span></span>
            </div>
            @if (store.isLoading()) { <span class="sk sk-value"></span> } @else { <strong class="kpi-value">{{ k.value }}</strong> }
            <p class="kpi-detail">{{ k.detail }}</p>
          </article>
        }
      </section>

      <div class="grid">
        <section class="card agenda">
          <div class="card-head">
            <div>
              <h2>Agenda de hoy</h2>
              <p>{{ store.appointmentRows().length }} {{ store.appointmentRows().length === 1 ? 'cita programada' : 'citas programadas' }}</p>
            </div>
            <a class="link" routerLink="/agenda">Ver agenda <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
          </div>
          @if (store.isLoading()) {
            <div class="rows">@for (i of [1, 2, 3]; track i) { <div class="sk sk-row"></div> }</div>
          } @else if (store.appointmentRows().length === 0) {
            <div class="empty">
              <span class="material-symbols-outlined" aria-hidden="true">event_available</span>
              <p><strong>No hay citas para hoy</strong></p>
              <p>Comparte tu página de reservas o crea una cita desde la agenda.</p>
            </div>
          } @else {
            <ul class="rows">
              @for (a of store.appointmentRows(); track a.id) {
                <li class="row">
                  <time>{{ a.time }}</time>
                  <span class="avatar" aria-hidden="true">{{ a.initials }}</span>
                  <div class="who"><strong>{{ a.name }}</strong><span>{{ a.service }} · {{ a.barber }}</span></div>
                  <span class="status" [attr.data-tone]="a.statusTone">{{ a.status }}</span>
                </li>
              }
            </ul>
          }
        </section>

        <div class="side">
          <section class="card">
            <div class="card-head">
              <div>
                <h2>Ingresos de la semana</h2>
                <p>Citas completadas · últimos 7 días</p>
              </div>
              <strong class="total">{{ store.weekTotal() }}</strong>
            </div>
            @if (store.isLoading()) { <div class="sk sk-chart"></div> } @else { <app-bar-chart [series]="store.weekChart()" format="money" /> }
          </section>

          <section class="card">
            <div class="card-head"><div><h2>Atendidos hoy</h2><p>Últimos servicios completados</p></div></div>
            @if (store.topCustomers().length === 0) {
              <p class="muted">Aún no hay clientes atendidos hoy.</p>
            } @else {
              <ul class="served">
                @for (c of store.topCustomers(); track $index) {
                  <li>
                    <span class="avatar small" aria-hidden="true">{{ c.name.charAt(0) }}</span>
                    <div class="who"><strong>{{ c.name }}</strong><span>{{ c.service }}</span></div>
                    <span class="amount">{{ store.formatPrice(c.price) }}</span>
                  </li>
                }
              </ul>
            }
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dash { --ink: #1c1c16; --ink-2: #57534e; --line: #e6dfd5; --copper: #944928; --paper: #f7f3ec;
      color: var(--ink); margin: 0 auto; max-width: 1320px; padding: clamp(20px, 4vw, 40px); }
    .material-symbols-outlined { font-size: 20px; line-height: 1; }

    .head { align-items: flex-end; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; margin-bottom: 28px; }
    .date { color: var(--copper); font-size: 13px; font-weight: 700; letter-spacing: .08em; margin: 0 0 6px; text-transform: uppercase; }
    h1 { font: 700 clamp(28px, 3.6vw, 40px)/1.15 'Vollkorn', serif; margin: 0; }
    .dot { color: var(--copper); }
    .sub { color: var(--ink-2); font-size: 15px; margin: 6px 0 0; }
    .btn { align-items: center; background: #412311; border-radius: 12px; color: #fff; display: inline-flex; font-size: 15px; font-weight: 700; gap: 6px; min-height: 46px; padding: 0 18px; text-decoration: none; transition: background .2s, transform .2s; }
    .btn:hover { background: #5a3825; transform: translateY(-1px); }
    a:focus-visible { outline: 3px solid #c4703f; outline-offset: 3px; }

    .kpis { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 24px; }
    .kpi { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; }
    .kpi-top { align-items: center; display: flex; justify-content: space-between; margin-bottom: 10px; }
    .kpi-label { color: var(--ink-2); font-size: 14px; font-weight: 600; }
    .kpi-icon { align-items: center; border-radius: 10px; display: flex; height: 38px; justify-content: center; width: 38px; }
    .kpi-icon[data-tone='copper'] { background: #fbeee4; color: #8c4029; }
    .kpi-icon[data-tone='green'] { background: #e5f4ec; color: #146c43; }
    .kpi-icon[data-tone='blue'] { background: #e7effa; color: #1f5fae; }
    .kpi-icon[data-tone='neutral'] { background: #f1ece4; color: #57534e; }
    .kpi-value { display: block; font: 700 30px/1.15 'Vollkorn', serif; font-variant-numeric: tabular-nums; }
    .kpi-detail { color: var(--ink-2); font-size: 13px; margin: 6px 0 0; }

    .grid { display: grid; gap: 20px; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); }
    .side { display: grid; gap: 20px; align-content: start; }
    .card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px 22px; }
    .card-head { align-items: flex-start; display: flex; gap: 12px; justify-content: space-between; margin-bottom: 16px; }
    .card-head h2 { font: 600 21px/1.2 'Vollkorn', serif; margin: 0; }
    .card-head p { color: var(--ink-2); font-size: 13px; margin: 3px 0 0; }
    .total { font: 700 22px 'Vollkorn', serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .link { align-items: center; border-radius: 8px; color: var(--copper); display: inline-flex; flex: none; font-size: 14px; font-weight: 700; gap: 4px; text-decoration: none; }
    .link .material-symbols-outlined { font-size: 18px; }
    .link:hover { text-decoration: underline; }

    .rows { display: grid; gap: 2px; list-style: none; margin: 0; padding: 0; }
    .row { align-items: center; border-radius: 12px; display: grid; gap: 14px; grid-template-columns: 52px 40px minmax(0, 1fr) auto; padding: 12px 10px; transition: background .15s; }
    .row:hover { background: var(--paper); }
    .row time { color: var(--ink); font-size: 14px; font-variant-numeric: tabular-nums; font-weight: 700; }
    .avatar { align-items: center; background: #fbeee4; border-radius: 50%; color: #74361f; display: flex; font-size: 14px; font-weight: 700; height: 40px; justify-content: center; width: 40px; }
    .avatar.small { font-size: 13px; height: 34px; width: 34px; }
    .who { min-width: 0; }
    .who strong { display: block; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .who span { color: var(--ink-2); display: block; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status { border: 1px solid; border-radius: 999px; font-size: 12px; font-weight: 700; padding: 4px 10px; white-space: nowrap; }
    .status[data-tone='pending'] { background: #fff6e0; border-color: #f1d48f; color: #7a4d00; }
    .status[data-tone='confirmed'] { background: #e6f5ed; border-color: #a9dcc0; color: #0f5c37; }
    .status[data-tone='waiting'] { background: #f1f2f4; border-color: #d3d6db; color: #3d4450; }
    .status[data-tone='active'] { background: #fbeee4; border-color: #ecc3a6; color: #74361f; }
    .status[data-tone='done'] { background: #e8f0fb; border-color: #b6cdef; color: #1d4f91; }
    .status[data-tone='cancelled'] { background: #fdeceb; border-color: #f2bdb8; color: #8c1d12; }

    .empty { align-items: center; border: 2px dashed var(--line); border-radius: 14px; color: var(--ink-2); display: flex; flex-direction: column; padding: 36px 16px; text-align: center; }
    .empty .material-symbols-outlined { color: #a08d7e; font-size: 32px; margin-bottom: 8px; }
    .empty p { font-size: 14px; margin: 2px 0; }
    .empty strong { color: var(--ink); }
    .muted { color: var(--ink-2); font-size: 14px; margin: 0; }

    .served { display: grid; gap: 4px; list-style: none; margin: 0; padding: 0; }
    .served li { align-items: center; border-radius: 12px; display: grid; gap: 12px; grid-template-columns: 34px minmax(0, 1fr) auto; padding: 8px; }
    .served li:hover { background: var(--paper); }
    .amount { font-size: 14px; font-variant-numeric: tabular-nums; font-weight: 700; }

    .sk { animation: pulse 1.4s ease-in-out infinite; background: #f1ece4; border-radius: 10px; display: block; }
    .sk-value { height: 34px; width: 60%; }
    .sk-row { height: 56px; margin-bottom: 6px; }
    .sk-chart { height: 280px; }
    @keyframes pulse { 50% { opacity: .55; } }
    @media (prefers-reduced-motion: reduce) { .sk { animation: none; } .btn, .row { transition: none; } }

    @media (max-width: 1100px) { .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } .grid { grid-template-columns: 1fr; } }
    @media (max-width: 560px) {
      .kpis { grid-template-columns: 1fr; }
      .btn { width: 100%; justify-content: center; }
      .row { grid-template-columns: 48px minmax(0, 1fr) auto; }
      .row .avatar { display: none; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  constructor(public store: DashboardStore) {}

  ngOnInit(): void {
    this.store.load()
  }
}
