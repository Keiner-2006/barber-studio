import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { cashRepository } from '@/modules/cash/infrastructure/repositories/cash.repository'
import { openCashSessionSchema, closeCashSessionSchema, cashTransactionSchema } from '@/modules/cash/presentation/schemas/cash.schema'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const sessionId = searchParams.get('sessionId')
      if (!sessionId) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'sessionId es requerido' }, requestId },
          { status: 400 }
        )
      }

      const transactions = await cashRepository.getSessionTransactions(sessionId)
      return NextResponse.json({ data: transactions })
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
    const result = await withTenantRequest(request.headers, async ({ context }) => {
      const body = await request.json()
      const { action } = body

      if (action === 'open') {
        const parsed = openCashSessionSchema.safeParse(body)
        if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
        const existing = await cashRepository.findOpenSession(parsed.data.cashRegisterId)
        if (existing) return NextResponse.json({ error: { code: 'CONFLICT', message: 'Ya hay una sesión abierta para esta caja' }, requestId }, { status: 409 })
        const cashSession = await cashRepository.createSession({ cashRegisterId: parsed.data.cashRegisterId, userId: context.userId, initialBalance: parsed.data.initialBalance })
        return NextResponse.json({ data: cashSession }, { status: 201 })
      }

      if (action === 'close') {
        const parsed = closeCashSessionSchema.safeParse(body)
        if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
        const sessionId = body.sessionId
        if (!sessionId) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'sessionId es requerido' }, requestId }, { status: 400 })
        const cashSession = await cashRepository.findSessionById(sessionId)
        if (!cashSession || !cashSession.isOpen) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sesión no encontrada o ya cerrada' }, requestId }, { status: 404 })
        const transactions = await cashRepository.getSessionTransactions(sessionId)
        const expected = transactions.reduce((acc, t) => { const amount = parseFloat(t.amount); return t.type === 'refund' || t.type === 'expense' ? acc - amount : acc + amount }, parseFloat(cashSession.initialBalance))
        const difference = parseFloat(parsed.data.countedBalance) - expected
        const closed = await cashRepository.closeSession(sessionId, { countedBalance: parsed.data.countedBalance, expectedBalance: expected.toString(), difference: difference.toString() })
        return NextResponse.json({ data: closed })
      }

      if (action === 'transaction') {
        const parsed = cashTransactionSchema.safeParse(body)
        if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
        const sessionId = body.sessionId
        if (!sessionId) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'sessionId es requerido' }, requestId }, { status: 400 })
        const cashSession = await cashRepository.findSessionById(sessionId)
        if (!cashSession || !cashSession.isOpen) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sesión no encontrada o ya cerrada' }, requestId }, { status: 404 })
        const transaction = await cashRepository.addTransaction(sessionId, { ...parsed.data, actorId: context.userId })
        return NextResponse.json({ data: transaction }, { status: 201 })
      }

      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Acción no válida' }, requestId }, { status: 400 })
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
