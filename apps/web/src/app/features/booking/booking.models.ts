import { Service, ServiceCategory } from '../catalog/catalog.models'
import { Branch } from '../../core/tenancy/tenant.models'

export interface StaffMember {
  id: string
  name: string
  email?: string
  specialty?: string
  avatarUrl?: string
}

export interface AvailableSlot {
  staffId: string
  staffName: string
  startsAt: string
  endsAt: string
}

export interface AvailabilityQuery {
  branchId: string
  serviceId: string
  staffId?: string
  from: string
  to: string
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

export type BookingStep = 'service' | 'branch' | 'staff' | 'time' | 'confirm'

export interface BookingState {
  selectedService: Service | null
  selectedCategory: ServiceCategory | null
  selectedBranch: Branch | null
  selectedStaff: StaffMember | null
  selectedSlot: AvailableSlot | null
}
