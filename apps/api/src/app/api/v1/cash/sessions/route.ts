import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { cashRepository } from '@/modules/cash/infrastructure/repositories/cash.repository'
import { db } from '@/shared/db'
import { users } from '@/shared/db/schema/identity'
import { cashSessions, cashTransactions, cashRegisters } from '@/shared/db/schema/cash'
import { eq, and, desc, inArray } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const registerId = searchParams.get('registerId') || undefined
      const openOnly = searchParams.get('openOnly') === 'true'
      const sessionId = searchParams.get('sessionId')

      if (sessionId) {
        const transactions = await cashRepository.getSessionTransactions(sessionId)

        const transactionIds = transactions.map((t) => t.actorId)
        let actorNameMap = new Map<string, string>()
        if (transactionIds.length > 0) {
          const actorUsers = await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(inArray(users.id, transactionIds))
          actorNameMap = new Map(actorUsers.map((u) => [u.id, u.name]))
        }

        const enriched = transactions.map((t) => ({
          ...t,
          actorName: actorNameMap.get(t.actorId) || null,
        }))

        return NextResponse.json({ data: enriched })
      }

      if (registerId) {
        const sessions = await cashRepository.listSessions(registerId, openOnly)
        return NextResponse.json({ data: sessions })
      }

      const sessions = await cashRepository.listSessions(undefined, openOnly)
      const registerIds = [...new Set(sessions.map((s) => s.cashRegisterId))]
      const registerMap = new Map<string, string>()
      if (registerIds.length > 0) {
        const registers = await db
          .select({ id: cashRegisters.id, name: cashRegisters.name })
          .from(cashRegisters)
          .where(inArray(cashRegisters.id, registerIds))
        registers.forEach((r) => registerMap.set(r.id, r.name))
      }

      const enriched = sessions.map((s) => ({
        ...s,
        cashRegisterName: registerMap.get(s.cashRegisterId) || null,
      }))
      return NextResponse.json({ data: enriched })
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
