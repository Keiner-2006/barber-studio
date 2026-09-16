import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { ServiceRegistry } from '@/shared/container/ServiceRegistry'
import { z } from 'zod'

const reportQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  branchId: z.string().uuid().optional(),
})

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const parsed = reportQuerySchema.safeParse(Object.fromEntries(searchParams))
      if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Parámetros inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
      }
      const data = await ServiceRegistry.reportsAdapter.getSales({
        from: parsed.data.from ? new Date(parsed.data.from) : undefined,
        to: parsed.data.to ? new Date(parsed.data.to) : undefined,
        branchId: parsed.data.branchId,
      })
      return NextResponse.json({ data })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
