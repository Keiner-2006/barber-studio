import { IAppointmentRepository, CreateAppointmentData } from '../ports/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'

export interface CreateAppointmentRequest {
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

export class CreateAppointmentUseCase {
  constructor(private readonly repository: IAppointmentRepository) {}

  async execute(request: CreateAppointmentRequest): Promise<Appointment> {
    if (!request.startsAt || isNaN(request.startsAt.getTime())) {
      throw new Error('Invalid start date')
    }

    if (request.serviceDurationSnapshot <= 0) {
      throw new Error('Service duration must be positive')
    }

    const data: CreateAppointmentData = {
      branchId: request.branchId,
      customerId: request.customerId,
      staffId: request.staffId,
      serviceId: request.serviceId,
      startsAt: request.startsAt,
      notes: request.notes ?? null,
      idempotencyKey: request.idempotencyKey,
      serviceNameSnapshot: request.serviceNameSnapshot,
      serviceDurationSnapshot: request.serviceDurationSnapshot,
      priceSnapshot: request.priceSnapshot,
      currencySnapshot: request.currencySnapshot,
    }

    return this.repository.create(data)
  }
}