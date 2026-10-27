export interface Appointment {
  id: string
  tenantId: string
  branchId: string
  customerId: string
  staffId: string
  serviceId: string
  startsAt: string
  endsAt: string
  serviceNameSnapshot: string
  serviceDurationSnapshot: number
  priceSnapshot: string
  currencySnapshot: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'in_service' | 'completed' | 'cancelled' | 'no_show'
  source?: string
  notes?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentQuery {
  branchId?: string
  staffId?: string
  customerId?: string
  status?: string
  from?: string
  to?: string
  cursor?: string
  limit?: number
}

export interface CreateAppointment {
  branchId: string
  customerId: string
  staffId: string
  serviceId: string
  startsAt: string
  notes?: string
  idempotencyKey: string
}

export interface CustomerMap {
  [id: string]: { firstName: string; lastName: string }
}

export interface StaffMap {
  [id: string]: { displayName: string; role?: string }
}

export interface AppointmentRow {
  id: string
  time: string
  clientName: string
  service: string
  barber: string
  status: string
  statusClass: string
}

export interface AgendaStats {
  total: number
  pending: number
  confirmed: number
  checkedIn: number
  inService: number
  completed: number
  cancelled: number
  noShow: number
}

export interface StaffOption {
  id: string
  displayName: string
  role?: string
}

export interface CustomerOption {
  id: string
  name: string
}
