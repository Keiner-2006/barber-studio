import { IAppointmentRepository, UpdateAppointmentData } from '../ports/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'

export interface UpdateAppointmentRequest {
  id: string
  startsAt?: Date
  notes?: string | null
}

export class UpdateAppointmentUseCase {
  constructor(private readonly repository: IAppointmentRepository) {}

  async execute(request: UpdateAppointmentRequest): Promise<Appointment | null> {
    const existing = await this.repository.findById(request.id)
    if (!existing) {
      throw new Error('Appointment not found')
    }

    if (!existing.canCancel()) {
      throw new Error('Cannot update appointment in current status')
    }

    if (request.startsAt && isNaN(request.startsAt.getTime())) {
      throw new Error('Invalid start date')
    }

    const data: UpdateAppointmentData = {}
    if (request.startsAt !== undefined) data.startsAt = request.startsAt
    if (request.notes !== undefined) data.notes = request.notes

    return this.repository.update(request.id, data)
  }
}