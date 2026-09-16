import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AgendaStore } from './agenda.store'

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">{{ store.dateLabel() }}</p>
          <h1>Agenda <span class="accent">del día.</span></h1>
          <p class="subtitle">Gestionas turnos, disponibilidad y atención en tiempo real.</p>
        </div>
        <div class="header-actions">
          <button class="secondary-button" (click)="store.prevDay()">←</button>
          <button class="secondary-button" (click)="store.nextDay()">→</button>
          <button class="primary-button" (click)="store.openNewBooking()">+ Nueva reserva</button>
        </div>
      </div>

      @if (store.loading()) {
        <div class="loading">Cargando agenda...</div>
      } @else if (store.appointmentRows().length === 0) {
        <div class="empty-state">
          <p>No hay reservas para este día</p>
          <p class="hint">Presiona "Nueva reserva" para crear una.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="agenda-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Barbero</th>
                <th>Estado</th>
                <th class="actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (appt of store.appointmentRows(); track appt.id) {
                <tr>
                  <td class="time-cell">{{ appt.time }}</td>
                  <td>{{ appt.clientName }}</td>
                  <td>{{ appt.service }}</td>
                  <td>{{ appt.barber }}</td>
                  <td>
                    <span class="status-badge" [class]="appt.statusClass">{{ appt.status }}</span>
                  </td>
                  <td class="actions-cell">
                    <select class="action-select" (change)="store.changeStatus(appt.id, $event)">
                      <option value="">Cambiar estado</option>
                      <option value="confirmed">Confirmar</option>
                      <option value="checked_in">En espera</option>
                      <option value="in_service">En servicio</option>
                      <option value="completed">Completar</option>
                      <option value="cancelled">Cancelar</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .secondary-button { padding: 8px 14px; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .loading { padding: 48px; text-align: center; color: #6b7280; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; }
    .empty-state p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
    .hint { font-size: 13px; color: #6b7280; margin-top: 8px; }
    .table-wrapper { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .agenda-table { width: 100%; border-collapse: collapse; }
    .agenda-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .agenda-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .time-cell { font-family: monospace; font-weight: 500; white-space: nowrap; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-waiting { background: #f3f4f6; color: #374151; }
    .status-completed { background: #dbeafe; color: #1e40af; }
    .status-cancelled { background: #fee2e2; color: #991b2b; }
    .actions-header { width: 120px; }
    .actions-cell { width: 120px; }
    .action-select { padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; background: white; cursor: pointer; }
    .action-select:focus { outline: 2px solid #b87333; outline-offset: 1px; }
  `]
})
export class AgendaComponent implements OnInit {
  constructor(public store: AgendaStore) {}

  ngOnInit(): void {
    this.store.load()
  }
}
