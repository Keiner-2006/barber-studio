import { Injectable, Inject } from '@nestjs/common';
import type { IAppointmentRepository, Appointment, AppointmentFilters } from '../appointment.domain';

@Injectable()
export class GetAppointmentsUseCase {
  constructor(@Inject('IAppointmentRepository') private readonly repo: IAppointmentRepository) {}

  async execute(tenantId: string, filters?: AppointmentFilters): Promise<Appointment[]> {
    return this.repo.findAll(tenantId, filters);
  }
}