import { Appointment } from '../agenda/agenda.models'
import { Customer } from '../customers/customers.models'
import { StaffMember } from '../agenda/staff.models'

export interface Kpi {
  label: string
  value: string
  trend: string
  detail: string
  icon: string
}

export interface WeekDay {
  label: string
  value: string
  height: number
  isToday: boolean
}

export interface AppointmentRow {
  id: string
  time: string
  name: string
  service: string
  barber: string
  status: string
  initials: string
  avatarColor: string
  statusClass: string
}

export interface DashboardState {
  appointments: Appointment[]
  customers: Record<string, Customer>
  staff: Record<string, StaffMember>
  isLoading: boolean
  userName: string
}
