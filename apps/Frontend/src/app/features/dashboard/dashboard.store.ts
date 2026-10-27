import { Injectable, signal, computed } from '@angular/core'
import { AgendaApi } from '../agenda/agenda.api'
import { Appointment } from '../agenda/agenda.models'
import { CustomersApi } from '../customers/customers.api'
import { StaffApi } from '../agenda/staff.api'
import { StaffMember } from '../agenda/staff.models'
import { AuthService } from '../../core/auth/auth.service'
import { TenantService } from '../../core/tenancy/tenant.service'
import { Customer } from '../customers/customers.models'
import { Kpi, WeekDay, AppointmentRow, TodayMetric } from './dashboard.models'

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
  readonly todayLabel = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  readonly todayIso = computed(() => new Date().toISOString().split('T')[0])

  readonly todaysAppointments = computed(() =>
    this.appointments().filter((a) => a.startsAt.startsWith(this.todayIso())),
  )

  readonly kpis = computed((): Kpi[] => {
    const todays = this.todaysAppointments()
    const completed = todays.filter((a) => a.status === 'completed')
    const pending = todays.filter((a) => a.status === 'pending')
    const confirmed = todays.filter((a) => a.status === 'confirmed')
    const revenue = completed.reduce((sum, a) => sum + parseFloat(a.priceSnapshot || '0'), 0)
    const count = completed.length
    const avgTicket = count > 0 ? revenue / count : 0
    const customerCount = Object.keys(this.customers()).length

    return [
      {
        label: 'Clientes atendidos hoy',
        value: String(count),
        trend: count > 0 ? '+ hoy' : 'Sin citas',
        detail: `${pending.length} pendientes · ${confirmed.length} confirmadas`,
        icon: '👤',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
      },
      {
        label: 'Ingresos hoy',
        value: `$${revenue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`,
        trend: `${count} servicios`,
        detail: 'Citas completadas',
        icon: '💰',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
      {
        label: 'Ticket promedio',
        value: `$${Math.round(avgTicket).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`,
        trend: count > 0 ? 'por visita' : '—',
        detail: 'Promedio por servicio',
        icon: '🧾',
        color: 'text-primary-400',
        bg: 'bg-primary-500/10',
      },
      {
        label: 'Citas hoy',
        value: String(todays.length),
        trend: `${completed.length} completadas`,
        detail: `${pending.length} pendientes · ${confirmed.length} confirmadas`,
        icon: '📅',
        color: 'text-primary-fixed-dim',
        bg: 'bg-primary-fixed-dim/10',
      },
    ]
  })

  readonly todayMetrics = computed((): TodayMetric[] => {
    const todays = this.todaysAppointments()
    const completed = todays.filter((a) => a.status === 'completed')
    const revenue = completed.reduce((sum, a) => sum + parseFloat(a.priceSnapshot || '0'), 0)
    const count = completed.length
    return [
      { label: 'Clientes atendidos', value: String(count), icon: '👤', color: 'text-amber-400' },
      { label: 'Ingresos generados', value: `$${revenue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`, icon: '💰', color: 'text-emerald-400' },
      { label: 'Ticket promedio', value: `$${Math.round(count > 0 ? revenue / count : 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`, icon: '🧾', color: 'text-primary-400' },
      { label: 'Tasa de completación', value: `${todays.length > 0 ? Math.round((count / todays.length) * 100) : 0}%`, icon: '📊', color: 'text-tertiary-400' },
    ]
  })

  readonly appointmentRows = computed((): AppointmentRow[] =>
    this.todaysAppointments()
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((appt) => this.toRow(appt)),
  )

  readonly weekData = computed((): WeekDay[] => {
    const appts = this.appointments()
    const today = new Date()
    const days: WeekDay[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().split('T')[0]
      const name = d.toLocaleDateString('es-CO', { weekday: 'short' })
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

  readonly topCustomers = computed(() => {
    const todays = this.todaysAppointments()
    const completed = todays.filter((a) => a.status === 'completed')
    const custMap = this.customers()
    return completed
      .map((a) => {
        const c = custMap[a.customerId]
        return {
          name: c ? `${c.firstName} ${c.lastName}`.trim() : 'Cliente',
          service: a.serviceNameSnapshot || 'Servicio',
          price: parseFloat(a.priceSnapshot || '0'),
          time: new Date(a.startsAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        }
      })
      .slice(0, 5)
  })

  constructor(
    private agendaApi: AgendaApi,
    private customersApi: CustomersApi,
    private staffApi: StaffApi,
    private authService: AuthService,
    private tenantService: TenantService,
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
    const statusMap: Record<string, { label: string; cls: string; color: string }> = {
      pending: { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border-amber-200', color: 'text-amber-600' },
      confirmed: { label: 'Confirmada', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: 'text-emerald-600' },
      checked_in: { label: 'En espera', cls: 'bg-slate-50 text-slate-700 border-slate-200', color: 'text-slate-600' },
      in_service: { label: 'En servicio', cls: 'bg-primary-50 text-primary-700 border-primary-200', color: 'text-primary-600' },
      completed: { label: 'Completada', cls: 'bg-blue-50 text-blue-700 border-blue-200', color: 'text-blue-600' },
      cancelled: { label: 'Cancelada', cls: 'bg-red-50 text-red-700 border-red-200', color: 'text-red-600' },
      no_show: { label: 'No asistió', cls: 'bg-red-50 text-red-700 border-red-200', color: 'text-red-600' },
    }
    const s = statusMap[appt.status]
    return {
      id: appt.id,
      time: new Date(appt.startsAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      name: customerName,
      service: appt.serviceNameSnapshot || 'Servicio',
      barber: barberName,
      status: s ? s.label : appt.status,
      initials: this.getInitials(customerName),
      avatarColor: 'bg-amber-500/20 text-amber-600',
      statusClass: s ? s.cls : '',
      statusColor: s ? s.color : 'text-slate-500',
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

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
  }
}
