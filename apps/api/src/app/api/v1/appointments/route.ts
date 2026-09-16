import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { ServiceRegistry } from '@/shared/container/ServiceRegistry'
import { createAppointmentSchema, appointmentQuerySchema } from '@/modules/appointments/presentation/schemas/appointment.schema'
import { catalogRepository } from '@/modules/catalog/infrastructure/repositories/catalog.repository'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const parsed = appointmentQuerySchema.safeParse(Object.fromEntries(searchParams))

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Parámetros inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const appointments = await ServiceRegistry.appointments.list.execute({
        branchId: parsed.data.branchId,
        staffId: parsed.data.staffId,
        customerId: parsed.data.customerId,
        status: parsed.data.status,
        from: parsed.data.from ? new Date(parsed.data.from) : undefined,
        to: parsed.data.to ? new Date(parsed.data.to) : undefined,
        cursor: parsed.data.cursor,
        limit: parsed.data.limit,
      })

      return NextResponse.json({ data: appointments.map(a => a.toPlain()) })
    })
    if (!result) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId },
        { status: 401 }
      )
    }

    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const body = await request.json()
      const parsed = createAppointmentSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const service = await catalogRepository.findServiceById(parsed.data.serviceId)
      if (!service) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Servicio no encontrado' }, requestId },
          { status: 404 }
        )
      }

      const startsAt = new Date(parsed.data.startsAt)
      const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000)
      const conflicts = await ServiceRegistry.appointmentAdapter.findConflicting(
        parsed.data.staffId,
        startsAt,
        endsAt
      )

      if (conflicts.length > 0) {
        return NextResponse.json(
          { error: { code: 'APPOINTMENT_CONFLICT', message: 'El horario ya no está disponible', details: { conflicts: conflicts.map(c => ({ id: c.id, startsAt: c.startsAt, endsAt: c.endsAt })) } }, requestId },
          { status: 409 }
        )
      }

      const appointment = await ServiceRegistry.appointments.create.execute({
        branchId: parsed.data.branchId,
        customerId: parsed.data.customerId,
        staffId: parsed.data.staffId,
        serviceId: parsed.data.serviceId,
        startsAt: new Date(parsed.data.startsAt),
        notes: parsed.data.notes,
        idempotencyKey: parsed.data.idempotencyKey,
        serviceNameSnapshot: service.name,
        serviceDurationSnapshot: service.durationMinutes,
        priceSnapshot: service.priceBase,
        currencySnapshot: service.currency,
      })
      return NextResponse.json({ data: appointment.toPlain() }, { status: 201 })
    })
    if (!result) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId },
        { status: 401 }
      )
    }

    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
