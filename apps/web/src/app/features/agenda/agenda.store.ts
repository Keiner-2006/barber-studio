import { Injectable, signal, computed } from '@angular/core'
import { Appointment, CustomerMap, StaffMap, AppointmentRow, AgendaStats, StaffOption, CustomerOption } from './agenda.models'
import { AgendaApi } from './agenda.api'
import { StaffApi } from './staff.api'
import { StaffMember } from './staff.models'
import { CustomersApi } from '../customers/customers.api'
import { CatalogApi } from '../catalog/catalog.api'
import { Service } from '../catalog/catalog.models'
import { TenantService } from '../../core/tenancy/tenant.service'

@Injectable({ providedIn: 'root' })
export class AgendaStore {
  private _appointments = signal<Appointment[]>([])
  private _customers = signal<CustomerMap>({})
  private _staff = signal<StaffMap>({})
  private _services = signal<Service[]>([])
  private _loading = signal(true)
  private _saving = signal(false)
  private _selectedDate = signal(new Date())
  private _bookingOpen = signal(false)
  private _bookingStaffId = signal<string>('')
  private _bookingServiceId = signal<string>('')
  private _bookingCustomerId = signal<string>('')
  private _bookingNotes = signal<string>('')
  private _bookingDate = signal<string>('')
  private _bookingTime = signal<string>('')
  private _staffList = signal<StaffOption[]>([])
  private _customerList = signal<CustomerOption[]>([])

  readonly loading = this._loading.asReadonly()
  readonly saving = this._saving.asReadonly()
  readonly selectedDate = this._selectedDate.asReadonly()
  readonly services = this._services.asReadonly()
  readonly bookingOpen = this._bookingOpen.asReadonly()
  readonly bookingStaffId = this._bookingStaffId.asReadonly()
  readonly bookingServiceId = this._bookingServiceId.asReadonly()
  readonly bookingCustomerId = this._bookingCustomerId.asReadonly()
  readonly bookingNotes = this._bookingNotes.asReadonly()
  readonly bookingDate = this._bookingDate.asReadonly()
  readonly bookingTime = this._bookingTime.asReadonly()
  readonly staffList = this._staffList.asReadonly()
  readonly customerList = this._customerList.asReadonly()

  readonly stats = computed((): AgendaStats => {
    const appts = this._appointments()
    const count = (status: string) => appts.filter((a) => a.status === status).length
    return {
      total: appts.length,
      pending: count('pending'),
      confirmed: count('confirmed'),
      checkedIn: count('checked_in'),
      inService: count('in_service'),
      completed: count('completed'),
      cancelled: count('cancelled'),
      noShow: count('no_show'),
    }
  })

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
    private catalogApi: CatalogApi,
    private tenantService: TenantService
  ) {}

  load(): void {
    this.loadStaff()
    this.loadCustomers()
    this.loadAppointments()
  }

  loadStaff(): void {
    this.staffApi.getStaff().subscribe({
      next: (list) => {
        const map: StaffMap = {}
        const opts: StaffOption[] = []
        list.forEach((s) => {
          map[s.id] = { displayName: s.displayName }
          if (s.isBookable) {
            opts.push({ id: s.id, displayName: s.displayName })
          }
        })
        this._staff.set(map)
        this._staffList.set(opts)
      },
      error: () => {
        this._staff.set({})
        this._staffList.set([])
      },
    })
  }

  loadCustomers(): void {
    this.customersApi.search({ limit: 100 }).subscribe({
      next: (resp) => {
        const map: CustomerMap = {}
        const opts: CustomerOption[] = []
        ;(resp.data ?? []).forEach((c) => {
          map[c.id] = { firstName: c.firstName, lastName: c.lastName }
          opts.push({ id: c.id, name: `${c.firstName} ${c.lastName}` })
        })
        this._customers.set(map)
        this._customerList.set(opts)
      },
      error: () => {
        this._customers.set({})
        this._customerList.set([])
      },
    })
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
    this.loadStaff()
    this.loadCustomers()
    this.loadServices()
    this._bookingOpen.set(true)
    this._bookingStaffId.set('')
    this._bookingServiceId.set('')
    this._bookingCustomerId.set('')
    this._bookingNotes.set('')
    this._bookingDate.set('')
    this._bookingTime.set('')
  }

  closeBookingModal(): void {
    this._bookingOpen.set(false)
  }

  setBookingField(field: string, value: string): void {
    switch (field) {
      case 'staffId': this._bookingStaffId.set(value); break
      case 'serviceId': this._bookingServiceId.set(value); break
      case 'customerId': this._bookingCustomerId.set(value); break
      case 'notes': this._bookingNotes.set(value); break
      case 'date': this._bookingDate.set(value); break
      case 'time': this._bookingTime.set(value); break
    }
  }

  async createBooking(): Promise<void> {
    if (!this._bookingStaffId() || !this._bookingServiceId() || !this._bookingCustomerId() || !this._bookingDate() || !this._bookingTime()) {
      return
    }
    this._saving.set(true)
    const branchId = this.tenantService.getBranchId()
    const startsAt = new Date(`${this._bookingDate()}T${this._bookingTime()}`)
    this.agendaApi.createAppointment({
      branchId: branchId || '',
      customerId: this._bookingCustomerId(),
      staffId: this._bookingStaffId(),
      serviceId: this._bookingServiceId(),
      startsAt: startsAt.toISOString(),
      notes: this._bookingNotes(),
      idempotencyKey: crypto.randomUUID(),
    }).subscribe({
      next: () => {
        this._bookingOpen.set(false)
        this._saving.set(false)
        this.loadAppointments()
      },
      error: () => this._saving.set(false),
    })
  }

  loadServices(): void {
    this.catalogApi.getServices().subscribe({
      next: (services) => this._services.set(services ?? []),
      error: () => this._services.set([]),
    })
  }

  loadAppointments(): void {
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
