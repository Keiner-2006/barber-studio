import { Injectable, signal, computed } from '@angular/core'
import { AgendaApi } from '../agenda/agenda.api'
import { Appointment } from '../agenda/agenda.models'
import { CustomersApi } from '../customers/customers.api'
import { StaffApi } from '../agenda/staff.api'
import { StaffMember } from '../agenda/staff.models'
import { AuthService } from '../../core/auth/auth.service'
import { TenantService } from '../../core/tenancy/tenant.service'
import { Customer } from '../customers/customers.models'
import { ChartSeries } from '../../shared/components/bar-chart/bar-chart.component'
import { formatChartValue } from '../../shared/components/chart-format'
import { Kpi, AppointmentRow, StatusTone } from './dashboard.models'

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pendiente', tone: 'pending' },
  confirmed: { label: 'Confirmada', tone: 'confirmed' },
  checked_in: { label: 'En espera', tone: 'waiting' },
  in_service: { label: 'En servicio', tone: 'active' },
  completed: { label: 'Completada', tone: 'done' },
  cancelled: { label: 'Cancelada', tone: 'cancelled' },
  no_show: { label: 'No asistió', tone: 'cancelled' },
}

/** yyyy-mm-dd in the browser's timezone (toISOString would shift evening appointments to tomorrow). */
const localDay = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const price = (a: Appointment): number => Number(a.priceSnapshot) || 0
const money = (v: number): string => formatChartValue(v, 'money')

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private appointments = signal<Appointment[]>([])
  private customers = signal<Record<string, Customer>>({})
  private staff = signal<Record<string, StaffMember>>({})
  private _isLoading = signal(true)
  private _userName = signal('')
  private pendingLoads = 0

  readonly isLoading = this._isLoading.asReadonly()
  readonly userName = this._userName.asReadonly()
  readonly todayLabel = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  readonly greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  })()

  readonly todaysAppointments = computed(() => {
    const today = localDay(new Date())
    return this.appointments().filter((a) => localDay(new Date(a.startsAt)) === today)
  })

  readonly kpis = computed((): Kpi[] => {
    const todays = this.todaysAppointments()
    const completed = todays.filter((a) => a.status === 'completed')
    const active = todays.filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
    const pending = todays.filter((a) => a.status === 'pending').length
    const confirmed = todays.filter((a) => a.status === 'confirmed').length
    const revenue = completed.reduce((s, a) => s + price(a), 0)
    const rate = active.length ? Math.round((completed.length / active.length) * 100) : 0
    return [
      { label: 'Citas hoy', value: String(active.length), detail: `${pending} pendientes · ${confirmed} confirmadas`, icon: 'event_available', tone: 'copper' },
      { label: 'Ingresos hoy', value: money(revenue), detail: `${completed.length} ${completed.length === 1 ? 'servicio completado' : 'servicios completados'}`, icon: 'payments', tone: 'green' },
      { label: 'Ticket promedio', value: money(completed.length ? revenue / completed.length : 0), detail: 'Por servicio completado', icon: 'receipt_long', tone: 'blue' },
      { label: 'Completadas', value: `${rate}%`, detail: `${completed.length} de ${active.length} citas activas`, icon: 'task_alt', tone: 'neutral' },
    ]
  })

  readonly appointmentRows = computed((): AppointmentRow[] =>
    [...this.todaysAppointments()]
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((appt) => this.toRow(appt)),
  )

  /** Revenue from completed appointments for each of the last 7 days (today last). */
  readonly weekChart = computed((): ChartSeries[] => {
    const byDay = new Map<string, number>()
    for (const a of this.appointments()) {
      if (a.status !== 'completed') continue
      const key = localDay(new Date(a.startsAt))
      byDay.set(key, (byDay.get(key) ?? 0) + price(a))
    }
    const bars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const value = byDay.get(localDay(d)) ?? 0
      const name = d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')
      return { label: i === 6 ? 'Hoy' : name.charAt(0).toUpperCase() + name.slice(1), value, displayValue: money(value), isToday: i === 6 }
    })
    return [{ name: 'Ingresos', color: '#b85a2b', bars }]
  })

  readonly weekTotal = computed(() => money(this.weekChart()[0].bars.reduce((s, b) => s + b.value, 0)))

  readonly topCustomers = computed(() => {
    const custMap = this.customers()
    return this.todaysAppointments()
      .filter((a) => a.status === 'completed')
      .map((a) => {
        const c = custMap[a.customerId]
        return {
          name: c ? `${c.firstName} ${c.lastName}`.trim() : 'Cliente',
          service: a.serviceNameSnapshot || 'Servicio',
          price: price(a),
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
  ) {}

  load(): void {
    this._userName.set(this.authService.user()?.name?.split(' ')[0] ?? '')
    this._isLoading.set(true)
    this.pendingLoads = 3

    const from = new Date()
    from.setDate(from.getDate() - 6)
    from.setHours(0, 0, 0, 0)
    const to = new Date()
    to.setHours(23, 59, 59, 999)

    this.agendaApi
      .getAppointments({ branchId: this.tenantService.getBranchId() ?? undefined, from: from.toISOString(), to: to.toISOString() })
      .subscribe({
        next: (appts) => this.appointments.set(appts ?? []),
        error: () => this.markLoaded(),
        complete: () => this.markLoaded(),
      })

    this.customersApi.search({ limit: 50 }).subscribe({
      next: (resp) => {
        const map: Record<string, Customer> = {}
        ;(resp.data ?? []).forEach((c) => (map[c.id] = c))
        this.customers.set(map)
      },
      error: () => this.markLoaded(),
      complete: () => this.markLoaded(),
    })

    this.staffApi.getStaff().subscribe({
      next: (list) => {
        const map: Record<string, StaffMember> = {}
        list.forEach((s) => (map[s.id] = s))
        this.staff.set(map)
      },
      error: () => this.markLoaded(),
      complete: () => this.markLoaded(),
    })
  }

  formatPrice(v: number): string {
    return money(v)
  }

  private markLoaded(): void {
    this.pendingLoads--
    if (this.pendingLoads <= 0) this._isLoading.set(false)
  }

  private toRow(appt: Appointment): AppointmentRow {
    const customer = this.customers()[appt.customerId]
    const name = customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Cliente'
    const s = STATUS[appt.status]
    return {
      id: appt.id,
      time: new Date(appt.startsAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      name,
      service: appt.serviceNameSnapshot || 'Servicio',
      barber: this.staff()[appt.staffId]?.displayName || 'Barbero',
      status: s?.label ?? appt.status,
      statusTone: s?.tone ?? 'waiting',
      initials: name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
    }
  }
}
