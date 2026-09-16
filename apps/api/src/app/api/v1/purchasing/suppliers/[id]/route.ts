import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { getTenantId } from '@/shared/tenancy/request-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { supplierRepository } from '@/modules/purchasing/infrastructure/repositories/supplier.repository'
import { z } from 'zod'

const updateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const supplier = await supplierRepository.findById(id)
      if (!supplier) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Proveedor no encontrado' }, requestId }, { status: 404 })
      }
      return NextResponse.json({ data: supplier })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const body = await request.json()
      const parsed = updateSupplierSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
      }
      const supplier = await supplierRepository.update(id, parsed.data)
      if (!supplier) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Proveedor no encontrado' }, requestId }, { status: 404 })
      }
      return NextResponse.json({ data: supplier })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const supplier = await supplierRepository.deactivate(id)
      if (!supplier) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Proveedor no encontrado' }, requestId }, { status: 404 })
      }
      return NextResponse.json({ data: supplier })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
