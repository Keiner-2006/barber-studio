import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { catalogRepository } from '@/modules/catalog/infrastructure/repositories/catalog.repository'
import { updateServiceSchema } from '@/modules/catalog/presentation/schemas/catalog.schema'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const body = await request.json()
      const parsed = updateServiceSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }
      const service = await catalogRepository.updateService(id, parsed.data)
      if (!service) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Servicio no encontrado' }, requestId },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: service })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const service = await catalogRepository.deleteService(id)
      if (!service) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Servicio no encontrado' }, requestId },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: service })
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
