import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { customerRepository } from '@/modules/customers/infrastructure/repositories/customer.repository'
import { updateCustomerSchema } from '@/modules/customers/presentation/schemas/customer.schema'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const body = await request.json()
      const parsed = updateCustomerSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }
      const customer = await customerRepository.update(id, parsed.data)
      if (!customer) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' }, requestId },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: customer })
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
      const customer = await customerRepository.delete(id)
      if (!customer) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' }, requestId },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: customer })
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
