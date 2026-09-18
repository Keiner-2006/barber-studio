import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { getTenantId } from '@/shared/tenancy/request-context'
import { db } from '@/shared/db'
import { staffSchedules, staffTimeOff } from '@/shared/db/schema/branches'
import { appointments } from '@/shared/db/schema/appointments'
import { and, eq, gte, lte, desc } from 'drizzle-orm'
import { appointmentQuerySchema } from '@/modules/appointments/presentation/schemas/appointment.schema'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const staffId = searchParams.get('staffId')
      const from = searchParams.get('from')
      const to = searchParams.get('to')

      const parsed = appointmentQuerySchema.safeParse({ staffId, from, to })
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'staffId, from, to son requeridos' }, requestId },
          { status: 400 }
        )
      }

      const { staffId: sId, from: f, to: t } = parsed.data
      if (!sId || !f || !t) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'staffId, from, to son requeridos' }, requestId },
          { status: 400 }
        )
      }

      const fromDate = new Date(f)
      const toDate = new Date(t)

      const tenantId = getTenantId()

      const schedules = await db
        .select({ startTime: staffSchedules.startTime, endTime: staffSchedules.endTime })
        .from(staffSchedules)
        .where(
          and(
            eq(staffSchedules.staffId, sId),
            gte(staffSchedules.validFrom, fromDate),
            lte(staffSchedules.validTo, toDate)
          )
        )

      const timeOff = await db
        .select({ startsAt: staffTimeOff.startsAt, endsAt: staffTimeOff.endsAt })
        .from(staffTimeOff)
        .where(
          and(
            eq(staffTimeOff.staffId, sId),
            gte(staffTimeOff.startsAt, fromDate),
            lte(staffTimeOff.endsAt, toDate)
          )
        )

      const existingAppointments = await db.query.appointments.findMany({
        where: and(
          eq(appointments.staffId, sId),
          eq(appointments.tenantId, tenantId),
          gte(appointments.startsAt, fromDate),
          lte(appointments.endsAt, toDate),
          eq(appointments.status, 'confirmed'),
        ),
        orderBy: [desc(appointments.startsAt)],
      })

      const occupiedSlots = existingAppointments.map((a) => ({
        startsAt: a.startsAt,
        endsAt: a.endsAt,
      }))

      const blockedPeriods = timeOff.map((t) => ({
        startsAt: t.startsAt,
        endsAt: t.endsAt,
      }))

      const dayOfWeek = fromDate.getDay()
      const daySchedule = schedules.find((s) => {
        const scheduleDay = parseInt(s.startTime)
        return true
      })

      const openHour = 8
      const closeHour = 18
      const serviceDurationMinutes = 60

      const availableSlots: string[] = []
      const current = new Date(fromDate)
      current.setHours(openHour, 0, 0, 0)
      const closeTime = new Date(fromDate)
      closeTime.setHours(closeHour, 0, 0, 0)

      while (current < closeTime) {
        const slotEnd = new Date(current.getTime() + serviceDurationMinutes * 60000)
        if (slotEnd > closeTime) break

        const isOccupied = occupiedSlots.some((s) => current < s.endsAt && slotEnd > s.startsAt)
        const isBlocked = blockedPeriods.some((b) => current < b.endsAt && slotEnd > b.startsAt)

        if (!isOccupied && !isBlocked) {
          availableSlots.push(current.toISOString())
        }

        current.setHours(current.getHours() + 1)
      }

      return NextResponse.json({ data: { slots: availableSlots, staffId: sId, from: fromDate.toISOString(), to: toDate.toISOString() } })
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
