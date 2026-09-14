import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { customerRepository } from '@/modules/customers/infrastructure/repositories/customer.repository'
import { createCustomerSchema, searchCustomerSchema } from '@/modules/customers/presentation/schemas/customer.schema'
import { parsePaginationParams, createPaginatedResponse } from '@/shared/pagination'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const parsed = searchCustomerSchema.safeParse(Object.fromEntries(searchParams))

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Parámetros inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const customers = await customerRepository.search(
        parsed.data.query,
        parsed.data.cursor,
        parsed.data.limit
      )

      return NextResponse.json(createPaginatedResponse(customers, customers.length === parsed.data.limit))
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
      const parsed = createCustomerSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const customer = await customerRepository.create(parsed.data)
      return NextResponse.json({ data: customer }, { status: 201 })
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
