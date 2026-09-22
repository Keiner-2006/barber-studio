import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/shared/provisioning/provisioning.service'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'

const service = new ProvisioningService()

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  const requestId = generateRequestId()
  try {
    const job = await service.getJob(params.jobId)
    if (!job) {
      throw new AppError('NOT_FOUND', 'Job de provisioning no encontrado')
    }

    return NextResponse.json({ data: job, requestId })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest, { params }: { params: { jobId: string } }) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()
    const { step, status } = body

    if (!status) {
      throw new AppError('VALIDATION_ERROR', 'status es requerido')
    }

    const job = await service.getJob(params.jobId)
    if (!job) {
      throw new AppError('NOT_FOUND', 'Job de provisioning no encontrado')
    }
    await service.advanceJob(params.jobId, step || 'completed', status, body.error)
    await service.activateTenant(job.tenantId)

    const updatedJob = await service.getJob(params.jobId)
    return NextResponse.json({ data: updatedJob, requestId })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
