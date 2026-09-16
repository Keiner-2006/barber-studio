import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { getTenantId } from '@/shared/tenancy/request-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { db } from '@/shared/db'
import { auditEvents } from '@/shared/db/schema/audit'
import { desc, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)

      const events = await db.query.auditEvents.findMany({
        where: eq(auditEvents.tenantId, getTenantId()),
        orderBy: [desc(auditEvents.createdAt)],
        limit,
      })

      return NextResponse.json({ data: events })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
