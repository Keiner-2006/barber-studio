import { Injectable, signal, computed } from '@angular/core'
import { Appointment, CustomerMap, StaffMap, AppointmentRow } from './agenda.models'
import { AgendaApi } from './agenda.api'
import { StaffApi } from './staff.api'
import { StaffMember } from './staff.models'
import { CustomersApi } from '../customers/customers.api'
import { TenantService } from '../../core/tenancy/tenant.service'

@Injectable({ providedIn: 'root' })
export class AgendaStore {
  private _appointments = signal<Appointment[]>([])
  private _customers = signal<CustomerMap>({})
  private _staff = signal<StaffMap>({})
  private _loading = signal(true)
  private _selectedDate = signal(new Date())

  readonly loading = this._loading.asReadonly()
  readonly selectedDate = this._selectedDate.asReadonly()

  readonly dateLabel = computed(() => {
    return this._selectedDate().toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  })

  readonly appointmentRows = computed((): AppointmentRow[] =>
    this._appointments()
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((appt) => ({
        id: appt.id,
        time: new Date(appt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        clientName: this._customers()[appt.customerId]
          ? `${this._customers()[appt.customerId].firstName} ${this._customers()[appt.customerId].lastName}`
          : 'Cliente',
        service: appt.serviceNameSnapshot || 'Servicio',
        barber: this._staff()[appt.staffId]?.displayName || 'Barbero',
        status: this.getStatusLabel(appt.status),
        statusClass: this.getStatusClass(appt.status),
      }))
  )

  constructor(
    private agendaApi: AgendaApi,
    private staffApi: StaffApi,
    private customersApi: CustomersApi,
    private tenantService: TenantService
  ) {}

  load(): void {
    this.loadStaff()
    this.loadCustomers()
    this.loadAppointments()
  }

  prevDay(): void {
    const d = new Date(this._selectedDate())
    d.setDate(d.getDate() - 1)
    this._selectedDate.set(d)
    this.loadAppointments()
  }

  nextDay(): void {
    const d = new Date(this._selectedDate())
    d.setDate(d.getDate() + 1)
    this._selectedDate.set(d)
    this.loadAppointments()
  }

  changeStatus(id: string, event: Event): void {
    const action = (event.target as HTMLSelectElement).value
    if (!action) return
    this.agendaApi.updateStatus(id, action).subscribe({
      next: (updated) => {
        this._appointments.update((appts) =>
          appts.map((a) => (a.id === updated.id ? updated : a))
        )
      },
    })
  }

  openNewBooking(): void {
    window.location.href = '/agenda'
  }

  private loadAppointments(): void {
    this._loading.set(true)
    const branchId = this.tenantService.getBranchId()
    this.agendaApi.getDailyAppointments(branchId, new Date(this._selectedDate())).subscribe({
      next: (appts) => {
        this._appointments.set(appts ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  private loadCustomers(): void {
    this.customersApi.search({ limit: 100 }).subscribe({
      next: (resp) => {
        const map: CustomerMap = {}
        ;(resp.data ?? []).forEach((c) => {
          map[c.id] = { firstName: c.firstName, lastName: c.lastName }
        })
        this._customers.set(map)
      },
      error: () => {
        this._customers.set({})
      },
    })
  }

  private loadStaff(): void {
    this.staffApi.getStaff().subscribe({
      next: (list) => {
        const map: StaffMap = {}
        list.forEach((s) => {
          map[s.id] = { displayName: s.displayName }
        })
        this._staff.set(map)
      },
      error: () => {
        this._staff.set({})
      },
    })
  }

  private getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      checked_in: 'En espera',
      in_service: 'En servicio',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No asistió',
    }
    return map[status] || status
  }

  private getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      checked_in: 'status-waiting',
      in_service: 'status-pending',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      no_show: 'status-cancelled',
    }
    return map[status] || ''
  }
}
