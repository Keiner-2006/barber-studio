import type { AppointmentStatus } from '../enums/appointment-status.enum'
import type { PaymentMethod, PaymentStatus } from '../enums/payment-method.enum'

export type CreateAppointmentDTO = {
  branchId: string
  customerId: string
  staffId: string
  serviceId: string
  startsAt: string
  notes?: string
  idempotencyKey: string
}

export type UpdateAppointmentDTO = {
  startsAt?: string
  notes?: string
}

export type AppointmentResponseDTO = {
  id: string
  branchId: string
  customerName: string
  customerPhone?: string
  staffName: string
  serviceName: string
  serviceDurationMinutes: number
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  price: string
  currency: string
  source?: string
  notes?: string
  cancellationReason?: string
  createdAt: string
}

export type AppointmentPaymentDTO = {
  id: string
  appointmentId: string
  amount: string
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  reference?: string
  recordedBy: string
  createdAt: string
}

export type AvailabilityQueryDTO = {
  branchId: string
  serviceId: string
  staffId?: string
  from: string
  to: string
}

export type AvailableSlotDTO = {
  staffId: string
  staffName: string
  startsAt: string
  endsAt: string
}
