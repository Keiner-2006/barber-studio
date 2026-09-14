import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div>
          <p class="greeting-label">Lunes, 7 de septiembre de 2026</p>
          <h1 class="greeting">Buenos días, Mariana<span class="accent">.</span></h1>
          <p class="subtitle">Esto es lo que está pasando en tu estudio hoy.</p>
        </div>
        <button class="primary-button">
          <span class="icon">+</span>
          Nueva reserva
        </button>
      </div>

      <div class="kpi-grid">
        @for (kpi of kpis; track kpi.label) {
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">{{ kpi.label }}</span>
              <div class="kpi-icon">{{ kpi.icon }}</div>
            </div>
            <div class="kpi-value">{{ kpi.value }}</div>
            <div class="kpi-trend positive">{{ kpi.trend }}</div>
            <div class="kpi-detail">{{ kpi.detail }}</div>
          </div>
        }
      </div>

      <div class="content-grid">
        <div class="card agenda-card">
          <div class="card-header">
            <div>
              <h3>Agenda de hoy</h3>
              <p>24 reservas · 8 pendientes</p>
            </div>
            <button class="link-button">Ver agenda completa →</button>
          </div>
          <div class="card-body">
            @for (appointment of appointments; track appointment.time) {
              <div class="appointment-row">
                <span class="time">{{ appointment.time }}</span>
                <div class="avatar" [style.background]="appointment.avatarColor">
                  {{ appointment.initials }}
                </div>
                <div class="appointment-info">
                  <p class="client-name">{{ appointment.name }}</p>
                  <p class="service-info">{{ appointment.service }} · {{ appointment.barber }}</p>
                </div>
                <span class="status-badge" [class]="appointment.statusClass">
                  {{ appointment.status }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h3>Rendimiento semanal</h3>
              <p>Ingresos por día</p>
            </div>
          </div>
          <div class="chart-body">
            @for (day of weekData; track day.label) {
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
    .dashboard {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .greeting-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .greeting {
      font-family: 'DM Serif Display', serif;
      font-size: 36px;
      color: #2d2d2d;
    }

    .accent {
      color: #b87333;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin-top: 8px;
    }

    .primary-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: #b87333;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .primary-button:hover {
      transform: translateY(-1px);
    }

    .icon {
      font-size: 18px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .kpi-label {
      font-size: 13px;
      color: #6b7280;
    }

    .kpi-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 14px;
    }

    .kpi-value {
      font-family: 'DM Serif Display', serif;
      font-size: 28px;
      color: #2d2d2d;
    }

    .kpi-trend {
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
    }

    .kpi-trend.positive {
      color: #22c55e;
    }

    .kpi-detail {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 20px;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-header h3 {
      font-family: 'DM Serif Display', serif;
      font-size: 16px;
      color: #2d2d2d;
    }

    .card-header p {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }

    .link-button {
      background: none;
      border: none;
      color: #b87333;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }

    .link-button:hover {
      text-decoration: underline;
    }

    .appointment-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
    }

    .appointment-row:last-child {
      border-bottom: none;
    }

    .time {
      font-family: monospace;
      font-size: 12px;
      color: #6b7280;
      width: 48px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }

    .appointment-info {
      flex: 1;
      min-width: 0;
    }

    .client-name {
      font-size: 14px;
      font-weight: 500;
      color: #2d2d2d;
    }

    .service-info {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
    }

    .status-confirmed {
      background: #dcfce7;
      color: #166534;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-waiting {
      background: #f3f4f6;
      color: #374151;
    }

    .chart-body {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      padding: 20px;
      height: 200px;
      border-bottom: 1px solid #e5e7eb;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .bar-value {
      font-size: 10px;
      color: #6b7280;
    }

    .bar {
      width: 100%;
      max-width: 32px;
      background: rgba(184, 115, 51, 0.2);
      border-radius: 2px 2px 0 0;
      transition: height 0.3s;
    }

    .bar.today {
      background: #b87333;
    }

    .bar-label {
      font-size: 10px;
      color: #6b7280;
    }
  `]
})
export class DashboardComponent {
  kpis = [
    { label: 'Ingresos de hoy', value: '$18,420', trend: '+12.5%', detail: 'vs. lunes pasado', icon: '$' },
    { label: 'Reservas de hoy', value: '24', trend: '+8.2%', detail: 'de 32 espacios', icon: '📅' },
    { label: 'Clientes nuevos', value: '7', trend: '+23.1%', detail: 'esta semana', icon: '👤' },
    { label: 'Ticket promedio', value: '$768', trend: '+4.6%', detail: 'por visita', icon: '🧾' },
  ]

  appointments = [
    { time: '09:00', name: 'Mateo Rojas', service: 'Corte clásico', barber: 'Andrés', status: 'Confirmada', initials: 'MR', avatarColor: 'rgba(184,115,51,0.15)', statusClass: 'status-confirmed' },
    { time: '09:45', name: 'Camila Torres', service: 'Corte + barba', barber: 'Santiago', status: 'En espera', initials: 'CT', avatarColor: '#dcfce7', statusClass: 'status-waiting' },
    { time: '10:30', name: 'Diego Herrera', service: 'Barba premium', barber: 'Andrés', status: 'Confirmada', initials: 'DH', avatarColor: 'rgba(184,115,51,0.15)', statusClass: 'status-confirmed' },
    { time: '11:15', name: 'Nicolás Vega', service: 'Corte infantil', barber: 'Santiago', status: 'Pendiente', initials: 'NV', avatarColor: '#fef3c7', statusClass: 'status-pending' },
  ]

  weekData = [
    { label: 'Lun', value: '$12k', height: 55, isToday: false },
    { label: 'Mar', value: '$15k', height: 68, isToday: false },
    { label: 'Mié', value: '$11k', height: 50, isToday: false },
    { label: 'Jue', value: '$17k', height: 78, isToday: false },
    { label: 'Vie', value: '$21k', height: 94, isToday: false },
    { label: 'Sáb', value: '$26k', height: 100, isToday: true },
    { label: 'Dom', value: '$18k', height: 72, isToday: false },
  ]
}
