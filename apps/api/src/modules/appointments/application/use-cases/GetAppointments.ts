import { IAppointmentRepository, AppointmentFilters } from '../ports/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'
import { getRequestContext } from '@/shared/tenancy/request-context'

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

    // Auto-filter by staffId for barbers
    let effectiveStaffId = request.staffId
    try {
      const context = getRequestContext()
      if (context.userRole === 'barber' && !request.staffId) {
        effectiveStaffId = context.staffId
      }
      // Reception can see all appointments (no staffId filter)
      // Admin/Owner/App see all (no staffId filter)
    } catch {
      // No request context available, proceed with provided filters
    }

    const filters: AppointmentFilters = {
      branchId: request.branchId,
      staffId: effectiveStaffId,
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