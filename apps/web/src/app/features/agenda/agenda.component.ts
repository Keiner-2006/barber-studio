import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { AgendaStore } from './agenda.store'
import { ROLE_LABELS } from '@navaja/shared'

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
      } @else {
        <div class="stats-bar">
          <span class="stat-chip"><b>{{ store.stats().total }}</b> Total</span>
          <span class="stat-chip confirmed"><b>{{ store.stats().confirmed }}</b> Confirmadas</span>
          <span class="stat-chip pending"><b>{{ store.stats().pending }}</b> Pendientes</span>
          <span class="stat-chip waiting"><b>{{ store.stats().checkedIn }}</b> En espera</span>
          <span class="stat-chip active"><b>{{ store.stats().inService }}</b> En servicio</span>
          <span class="stat-chip completed"><b>{{ store.stats().completed }}</b> Completadas</span>
          <span class="stat-chip cancelled"><b>{{ store.stats().cancelled }}</b> Canceladas</span>
          <span class="stat-chip cancelled"><b>{{ store.stats().noShow }}</b> No asistió</span>
        </div>

        @if (store.appointmentRows().length === 0) {
          <div class="empty-state">
            <p>Sin turnos programados</p>
            <p class="hint">Usa el calendario para ver otros días o crea una nueva reserva.</p>
          </div>
        }

        @if (store.appointmentRows().length > 0) {
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
      }

      @if (store.bookingOpen()) {
        <div class="modal-backdrop" (click)="store.closeBookingModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Nueva reserva</h3>

            <div class="form-group">
              <label>Cliente</label>
<select (change)="store.setBookingFieldFromEvent('customerId', $event)" [value]="store.bookingCustomerId()">
              <option value="">Seleccionar cliente...</option>
              @for (c of store.customerList(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
            </div>

            <div class="form-group">
              <label>Servicio</label>
              <select (change)="store.setBookingFieldFromEvent('serviceId', $event)" [value]="store.bookingServiceId()">
                <option value="">Seleccionar servicio...</option>
                @for (svc of store.services(); track svc.id) {
                  <option [value]="svc.id">{{ svc.name }} ({{ svc.durationMinutes }}min)</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Barbero</label>
<select (change)="store.setBookingFieldFromEvent('staffId', $event)" [value]="store.bookingStaffId()">
                <option value="">Seleccionar barbero...</option>
                @for (s of store.staffList(); track s.id) {
                  <option [value]="s.id">{{ s.displayName }} ({{ getRoleLabel(s.role || '') }})</option>
                }
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Fecha</label>
                <input type="date" [value]="store.bookingDate()" (change)="store.setBookingFieldFromEvent('date', $event)" />
              </div>
              <div class="form-group">
                <label>Hora</label>
                <input type="time" [value]="store.bookingTime()" (change)="store.setBookingFieldFromEvent('time', $event)" />
              </div>
            </div>

            <div class="form-group">
              <label>Notas</label>
              <textarea [ngModel]="store.bookingNotes()" (ngModelChange)="store.setBookingField('notes', $event)" placeholder="Notas opcionales..."></textarea>
            </div>

            <div class="dialog-actions">
              <button class="secondary-button" (click)="store.closeBookingModal()">Cancelar</button>
              <button class="primary-button" (click)="store.createBooking()" [disabled]="store.saving()">
                {{ store.saving() ? 'Creando...' : 'Crear turno' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
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
      .stats-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; padding: 12px 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; }
      .stat-chip { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; background: white; border: 1px solid #e5e7eb; color: #374151; }
      .stat-chip b { color: #111827; }
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

      .modal-backdrop {
        position: fixed; inset: 0; background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center; z-index: 100;
      }
      .modal {
        background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto;
      }
      .modal h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; margin: 0 0 16px; }
      .form-group { margin-bottom: 12px; }
      .form-group label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
      .form-group input, .form-group select, .form-group textarea {
        width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;
      }
      .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #b87333; outline: none; }
      .form-row { display: flex; gap: 12px; }
      .form-row .form-group { flex: 1; }
      .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
      .primary-button:disabled { opacity: 0.5; cursor: not-allowed; }
      textarea { resize: vertical; min-height: 60px; }
    `,
  ],
})
export class AgendaComponent implements OnInit {
  constructor(public store: AgendaStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  getRoleLabel(role: string): string {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role
  }
}
