import { ForbiddenError, NotFoundError } from '../errors/app-error';

export function ownStaffId(role: string, staffId?: string, requestedId?: string): string | undefined {
  if (role !== 'barber') return requestedId;
  if (!staffId) throw new ForbiddenError('No tienes un perfil de barbero activo');
  if (requestedId && requestedId !== staffId) throw new ForbiddenError('Solo puedes acceder a tu propia agenda');
  return staffId;
}

export function assertBarberAppointmentUpdate(
  ownId: string,
  appointment: { staffId: string | null; status: string },
  patch: { status?: string; notes?: string; startsAt?: string; endsAt?: string; staffId?: string },
): void {
  if (appointment.staffId !== ownId) throw new NotFoundError('Cita no encontrada');
  if (patch.staffId !== undefined || patch.startsAt !== undefined || patch.endsAt !== undefined) {
    throw new ForbiddenError('La recepción administra horarios y asignaciones');
  }
  if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
    throw new ForbiddenError('No puedes modificar una cita finalizada');
  }
  const transitions: Record<string, string[]> = {
    checked_in: ['in_service'],
    in_service: ['completed'],
  };
  if (patch.status && patch.status !== appointment.status && !transitions[appointment.status]?.includes(patch.status)) {
    throw new ForbiddenError('Solo puedes iniciar un servicio con el cliente presente o finalizarlo');
  }
}
