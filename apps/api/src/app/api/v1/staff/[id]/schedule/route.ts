import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { getTenantId } from '@/shared/tenancy/request-context'
import { db } from '@/shared/db'
import { staffSchedules, staffTimeOff, staffProfiles } from '@/shared/db/schema/branches'
import { and, eq, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const tenantId = getTenantId()

      const profile = await db.query.staffProfiles.findFirst({
        where: and(eq(staffProfiles.id, id), eq(staffProfiles.tenantId, tenantId)),
      })
      if (!profile) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Staff no encontrado' }, requestId },
          { status: 404 }
        )
      }

      const schedules = await db.query.staffSchedules.findMany({
        where: eq(staffSchedules.staffId, id),
        orderBy: [staffSchedules.dayOfWeek, staffSchedules.startTime],
      })

      const timeOff = await db.query.staffTimeOff.findMany({
        where: eq(staffTimeOff.staffId, id),
        orderBy: [staffTimeOff.startsAt],
      })

      return NextResponse.json({ data: { profile, schedules, timeOff } })
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
