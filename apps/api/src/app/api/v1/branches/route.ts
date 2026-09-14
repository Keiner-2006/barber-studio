import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { branchRepository } from '@/modules/branches/infrastructure/repositories/branch.repository'
import { createBranchSchema } from '@/modules/branches/presentation/schemas/branch.schema'
import { parsePaginationParams, createPaginatedResponse } from '@/shared/pagination'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const branches = await branchRepository.list()
      return NextResponse.json({ data: branches })
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
      const parsed = createBranchSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const existing = await branchRepository.findByCode(parsed.data.code)
      if (existing) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Ya existe una sucursal con ese código' }, requestId },
          { status: 409 }
        )
      }

      const branch = await branchRepository.create(parsed.data)
      return NextResponse.json({ data: branch }, { status: 201 })
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
