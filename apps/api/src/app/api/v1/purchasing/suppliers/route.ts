import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { getTenantId } from '@/shared/tenancy/request-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { supplierRepository } from '@/modules/purchasing/infrastructure/repositories/supplier.repository'
import { parsePaginationParams, createPaginatedResponse } from '@/shared/pagination'
import { z } from 'zod'

const createSupplierSchema = z.object({
  name: z.string().min(1).max(200),
  contactName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const parsed = parsePaginationParams(searchParams)
      const suppliers = await supplierRepository.list(getTenantId())
      return NextResponse.json(createPaginatedResponse(suppliers, suppliers.length >= parsed.limit))
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
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
      const parsed = createSupplierSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
      }
      const existing = await supplierRepository.findByName(parsed.data.name, getTenantId())
      if (existing) {
        return NextResponse.json({ error: { code: 'CONFLICT', message: `Ya existe un proveedor con el nombre "${parsed.data.name}"` }, requestId }, { status: 409 })
      }
      const supplier = await supplierRepository.create(parsed.data)
      return NextResponse.json({ data: supplier }, { status: 201 })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
