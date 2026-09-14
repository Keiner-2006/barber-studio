import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { catalogRepository } from '@/modules/catalog/infrastructure/repositories/catalog.repository'
import { createServiceSchema } from '@/modules/catalog/presentation/schemas/catalog.schema'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const categoryId = searchParams.get('categoryId') || undefined
      const services = await catalogRepository.listServices(categoryId)
      return NextResponse.json({ data: services })
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
      const parsed = createServiceSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const category = await catalogRepository.findCategoryById(parsed.data.categoryId)
      if (!category) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Categoría no encontrada' }, requestId },
          { status: 404 }
        )
      }

      const service = await catalogRepository.createService(parsed.data)
      return NextResponse.json({ data: service }, { status: 201 })
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
