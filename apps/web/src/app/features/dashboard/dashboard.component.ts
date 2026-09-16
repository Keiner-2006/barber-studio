import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DashboardStore } from './dashboard.store'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div>
          <p class="greeting-label">{{ store.todayLabel }}</p>
          <h1 class="greeting">Buenos días, {{ store.userName() }}<span class="accent">.</span></h1>
          <p class="subtitle">Esto es lo que está pasando en tu estudio hoy.</p>
        </div>
        <button class="primary-button" (click)="store.createAppointment?.()" routerLink="/agenda">
          <span class="icon">+</span>
          Nueva reserva
        </button>
      </div>

      <div class="kpi-grid">
        @for (kpi of store.kpis(); track kpi.label) {
          <div class="kpi-card" [class.loading]="store.isLoading()">
            <div class="kpi-header">
              <span class="kpi-label">{{ kpi.label }}</span>
              <div class="kpi-icon">{{ kpi.icon }}</div>
            </div>
            <div class="kpi-value">{{ store.isLoading() ? '--' : kpi.value }}</div>
            <div class="kpi-trend positive">{{ kpi.trend }}</div>
            <div class="kpi-detail">{{ kpi.detail }}</div>
          </div>
        }
      </div>

      <div class="content-grid">
        <div class="card agenda-card" [class.loading]="store.isLoading()">
          <div class="card-header">
            <div>
              <h3>Agenda de hoy</h3>
              <p>{{ store.appointmentRows().length }} reservas</p>
            </div>
            <button class="link-button" routerLink="/agenda">Ver agenda completa →</button>
          </div>
          <div class="card-body">
            @if (store.appointmentRows().length === 0) {
              <p class="empty-state">No hay reservas para hoy</p>
            } @else {
              @for (appt of store.appointmentRows(); track appt.id) {
                <div class="appointment-row">
                  <span class="time">{{ appt.time }}</span>
                  <div class="appointment-info">
                    <p class="client-name">{{ appt.name }}</p>
                    <p class="service-info">{{ appt.service }} · {{ appt.barber }}</p>
                  </div>
                  <span class="status-badge" [class]="appt.statusClass">
                    {{ appt.status }}
                  </span>
                </div>
              }
            }
          </div>
        </div>

        <div class="card chart-card" [class.loading]="store.isLoading()">
          <div class="card-header">
            <div>
              <h3>Rendimiento semanal</h3>
              <p>Ingresos por día</p>
            </div>
          </div>
          <div class="chart-body">
            @for (day of store.weekData(); track day.label) {
              <div class="bar-group">
                <span class="bar-value">{{ day.value }}</span>
                <div class="bar" [style.height.%]="day.height" [class.today]="day.isToday"></div>
                <span class="bar-label">{{ day.label }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .greeting-label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    .greeting { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .primary-button { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: transform 0.1s; }
    .primary-button:hover { transform: translateY(-1px); }
    .icon { font-size: 18px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .kpi-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .kpi-label { font-size: 13px; color: #6b7280; }
    .kpi-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 8px; font-size: 14px; }
    .kpi-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #2d2d2d; }
    .kpi-trend { font-size: 12px; font-weight: 600; margin-top: 4px; }
    .kpi-trend.positive { color: #22c55e; }
    .kpi-detail { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 16px; color: #2d2d2d; }
    .card-header p { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .link-button { background: none; border: none; color: #b87333; font-size: 12px; font-weight: 500; cursor: pointer; }
    .link-button:hover { text-decoration: underline; }
    .card-body { padding: 0; min-height: 280px; }
    .empty-state { padding: 24px 20px; color: #6b7280; font-size: 13px; }
    .appointment-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
    .appointment-row:last-child { border-bottom: none; }
    .appointment-info { flex: 1; min-width: 0; }
    .client-name { font-size: 14px; font-weight: 500; color: #2d2d2d; }
    .service-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-waiting { background: #f3f4f6; color: #374151; }
    .status-completed { background: #dbeafe; color: #1e40af; }
    .status-cancelled { background: #fee2e2; color: #991b2b; }
    .barber-name { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .chart-body { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; padding: 20px; height: 200px; border-bottom: 1px solid #e5e7eb; }
    .bar-group { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
    .bar-value { font-size: 10px; color: #6b7280; }
    .bar { width: 100%; max-width: 32px; background: rgba(184,115,51,0.2); border-radius: 2px 2px 0 0; transition: height 0.3s; }
    .bar.today { background: #b87333; }
    .bar-label { font-size: 10px; color: #6b7280; }
    .card.loading { opacity: 0.6; pointer-events: none; }
    .card.loading .bar { background: #e5e7eb; height: 20px; }
  `]
})
export class DashboardComponent implements OnInit {
  constructor(public store: DashboardStore) {}

  ngOnInit(): void {
    this.store.load()
  }
}
