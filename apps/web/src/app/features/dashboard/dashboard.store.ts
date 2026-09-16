import { Injectable, signal, computed } from '@angular/core'
import { AgendaApi } from '../agenda/agenda.api'
import { Appointment } from '../agenda/agenda.models'
import { CustomersApi } from '../customers/customers.api'
import { StaffApi } from '../agenda/staff.api'
import { StaffMember } from '../agenda/staff.models'
import { AuthService } from '../../core/auth/auth.service'
import { TenantService } from '../../core/tenancy/tenant.service'
import { Customer } from '../customers/customers.models'
import { Kpi, WeekDay, AppointmentRow } from './dashboard.models'

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private appointments = signal<Appointment[]>([])
  private customers = signal<Record<string, Customer>>({})
  private staff = signal<Record<string, StaffMember>>({})
  private _isLoading = signal(true)
  private _userName = signal('Usuario')
  private pendingLoads = 0

  readonly isLoading = this._isLoading.asReadonly()
  readonly userName = this._userName.asReadonly()
  readonly todayLabel = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  readonly kpis = computed((): Kpi[] => {
    const appts = this.appointments()
    const active = appts.filter((a) => a.status === 'confirmed' || a.status === 'completed')
    const revenue = active.reduce((sum, a) => sum + parseFloat(a.priceSnapshot || '0'), 0)
    const count = active.length
    const avgTicket = count > 0 ? revenue / count : 0
    const pending = appts.filter((a) => a.status === 'pending')
    const customerCount = Object.keys(this.customers()).length

    return [
      { label: 'Ingresos de hoy', value: `$${Math.round(revenue)}`, trend: 'Hoy', detail: `${count} confirmadas`, icon: '$' },
      { label: 'Reservas de hoy', value: String(appts.length), trend: `+${count}`, detail: `${pending.length} pendientes`, icon: '📅' },
      { label: 'Ticket promedio', value: `$${Math.round(avgTicket)}`, trend: '', detail: 'por visita', icon: '🧾' },
      { label: 'Clientes activos', value: String(customerCount), trend: '', detail: 'registrados', icon: '👤' },
    ]
  })

  readonly appointmentRows = computed((): AppointmentRow[] =>
    this.appointments()
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((appt) => this.toRow(appt))
  )

  readonly weekData = computed((): WeekDay[] => {
    const appts = this.appointments()
    const today = new Date()
    const days: WeekDay[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().split('T')[0]
      const name = d.toLocaleDateString('es-MX', { weekday: 'short' })
      const label = name.charAt(0).toUpperCase() + name.slice(1, 3)
      const dayAppts = appts.filter((a) => a.startsAt.startsWith(dayStr))
      const revenue = dayAppts.reduce((sum, a) => sum + parseFloat(a.priceSnapshot || '0'), 0)
      days.push({
        label,
        value: `$${Math.round(revenue)}`,
        height: Math.min((revenue / 500) * 100, 100) || 0,
        isToday: i === 0,
      })
    }
    return days
  })

  constructor(
    private agendaApi: AgendaApi,
    private customersApi: CustomersApi,
    private staffApi: StaffApi,
    private authService: AuthService,
    private tenantService: TenantService
  ) {
    const user = this.authService.user()
    if (user?.name) this._userName.set(user.name)
  }

  load(): void {
    const branchId = this.tenantService.getBranchId()
    const today = new Date()
    this.pendingLoads = 3

    this.agendaApi.getDailyAppointments(branchId, today).subscribe({
      next: (appts) => this.appointments.set(appts ?? []),
      error: () => {},
      complete: () => this.markLoaded(),
    })

    this.customersApi.search({ limit: 50 }).subscribe({
      next: (resp) => {
        const map: Record<string, Customer> = {}
        ;(resp.data ?? []).forEach((c) => (map[c.id] = c))
        this.customers.set(map)
      },
      error: () => {},
      complete: () => this.markLoaded(),
    })

    this.staffApi.getStaff().subscribe({
      next: (list) => {
        const map: Record<string, StaffMember> = {}
        list.forEach((s) => (map[s.id] = s))
        this.staff.set(map)
      },
      error: () => {},
      complete: () => this.markLoaded(),
    })
  }

  private markLoaded(): void {
    this.pendingLoads--
    if (this.pendingLoads <= 0) {
      this._isLoading.set(false)
    }
  }

  private toRow(appt: Appointment): AppointmentRow {
    const customer = this.customers()[appt.customerId]
    const staffMember = this.staff()[appt.staffId]
    const customerName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Cliente'
    const barberName = staffMember?.displayName || 'Barbero'
    const statusMap: Record<string, { label: string; cls: string }> = {
      pending: { label: 'Pendiente', cls: 'status-pending' },
      confirmed: { label: 'Confirmada', cls: 'status-confirmed' },
      checked_in: { label: 'En espera', cls: 'status-waiting' },
      in_service: { label: 'En servicio', cls: 'status-pending' },
      completed: { label: 'Completada', cls: 'status-completed' },
      cancelled: { label: 'Cancelada', cls: 'status-cancelled' },
      no_show: { label: 'No asistió', cls: 'status-cancelled' },
    }
    const s = statusMap[appt.status]
    return {
      id: appt.id,
      time: new Date(appt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      name: customerName,
      service: appt.serviceNameSnapshot || 'Servicio',
      barber: barberName,
      status: s ? s.label : appt.status,
      initials: this.getInitials(customerName),
      avatarColor: 'rgba(184,115,51,0.15)',
      statusClass: s ? s.cls : '',
    }
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
}
