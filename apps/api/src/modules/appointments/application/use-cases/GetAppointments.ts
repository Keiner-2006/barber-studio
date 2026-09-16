import { IAppointmentRepository, AppointmentFilters } from '../ports/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'

export interface GetAppointmentsRequest {
  branchId?: string
  staffId?: string
  customerId?: string
  status?: string
  from?: Date
  to?: Date
  cursor?: string
  limit?: number
}

export class GetAppointmentsUseCase {
  constructor(private readonly repository: IAppointmentRepository) {}

  async execute(request: GetAppointmentsRequest): Promise<Appointment[]> {
    if (request.from && request.to && request.from > request.to) {
      throw new Error('Invalid date range: from cannot be after to')
    }

    const filters: AppointmentFilters = {
      branchId: request.branchId,
      staffId: request.staffId,
      customerId: request.customerId,
      status: request.status,
      from: request.from,
      to: request.to,
      cursor: request.cursor,
      limit: request.limit,
    }

    return this.repository.list(filters)
  }
}