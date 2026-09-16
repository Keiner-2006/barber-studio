import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { getTenantId } from '@/shared/tenancy/request-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { db } from '@/shared/db'
import { staffProfiles } from '@/shared/db/schema/branches'
import { users } from '@/shared/db/schema/identity'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const staff = await db
        .select({
          id: staffProfiles.id,
          userId: staffProfiles.userId,
          displayName: staffProfiles.displayName,
          bio: staffProfiles.bio,
          avatarUrl: staffProfiles.avatarUrl,
          commissionRate: staffProfiles.commissionRate,
          isBookable: staffProfiles.isBookable,
          status: staffProfiles.status,
          userEmail: users.email,
        })
        .from(staffProfiles)
        .leftJoin(users, eq(staffProfiles.userId, users.id))
        .where(and(eq(staffProfiles.status, 'active'), eq(staffProfiles.tenantId, getTenantId())))
        .orderBy(staffProfiles.displayName)

      return NextResponse.json({ data: staff })
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
