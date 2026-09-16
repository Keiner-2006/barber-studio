import { Appointment } from '../../domain/entities/Appointment'
import { AppointmentPayment } from '../../domain/entities/AppointmentPayment'

export interface CreateAppointmentData {
  branchId: string
  customerId: string
  staffId: string
  serviceId: string
  startsAt: Date
  notes?: string | null
  idempotencyKey: string
  serviceNameSnapshot: string
  serviceDurationSnapshot: number
  priceSnapshot: string
  currencySnapshot: string
}

export interface UpdateAppointmentData {
  startsAt?: Date
  notes?: string | null
}

export interface AppointmentFilters {
  branchId?: string
  staffId?: string
  customerId?: string
  status?: string
  from?: Date
  to?: Date
  cursor?: string
  limit?: number
}

export interface CreatePaymentData {
  appointmentId: string
  amount: string
  currency: string
  method: 'cash' | 'card_manual' | 'transfer_manual' | 'other'
  reference?: string
  recordedBy?: string
}

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>
  create(data: CreateAppointmentData): Promise<Appointment>
  update(id: string, data: UpdateAppointmentData): Promise<Appointment | null>
  list(filters: AppointmentFilters): Promise<Appointment[]>
  findConflicting(staffId: string, startsAt: Date, endsAt: Date, excludeId?: string): Promise<Appointment[]>
  updateStatus(id: string, status: string, reason?: string): Promise<Appointment | null>
  getDailyAppointments(branchId: string, date: Date): Promise<Appointment[]>
}

export interface IAppointmentPaymentRepository {
  create(data: CreatePaymentData): Promise<AppointmentPayment>
  getPaymentsForAppointment(appointmentId: string): Promise<AppointmentPayment[]>
}

export interface IAppointmentService extends IAppointmentRepository {}

export interface IAppointmentPaymentService extends IAppointmentPaymentRepository {}