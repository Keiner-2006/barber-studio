import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { getTenantId } from '@/shared/tenancy/request-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { db } from '@/shared/db'
import { staffProfiles } from '@/shared/db/schema/branches'
import { users, userRoles, roles } from '@/shared/db/schema/identity'
import { eq, and, desc } from 'drizzle-orm'
import { createStaffSchema, updateStaffSchema, type CreateStaffInput, type UpdateStaffInput } from '@/modules/branches/presentation/schemas/staff.schema'

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
        role: roles.name,
      })
      .from(staffProfiles)
      .leftJoin(users, eq(staffProfiles.userId, users.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(roles.id, userRoles.roleId))
      .where(and(eq(staffProfiles.tenantId, getTenantId())))
      .orderBy(desc(staffProfiles.displayName))

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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const body = await request.json()
      const parsed = createStaffSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }
      const { displayName, bio, avatarUrl, commissionRate, isBookable, email } = parsed.data
      const existingUser = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : undefined
      if (!existingUser) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' }, requestId },
          { status: 404 }
        )
      }
      const [staff] = await db
        .insert(staffProfiles)
        .values({
          tenantId: getTenantId(),
          userId: existingUser.id,
          displayName,
          bio: bio ?? null,
          avatarUrl: avatarUrl ?? null,
          commissionRate: commissionRate ?? '0',
          isBookable: isBookable ?? true,
          status: 'active',
        })
        .returning()
      return NextResponse.json({ data: staff }, { status: 201 })
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

export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'id es requerido' }, requestId },
        { status: 400 }
      )
    }
    const result = await withTenantRequest(request.headers, async () => {
      const body = await request.json()
      const parsed = updateStaffSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }
      const updateData: any = { updatedAt: new Date() }
      if (parsed.data.displayName !== undefined) updateData.displayName = parsed.data.displayName
      if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio
      if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl
      if (parsed.data.commissionRate !== undefined) updateData.commissionRate = parsed.data.commissionRate
      if (parsed.data.isBookable !== undefined) updateData.isBookable = parsed.data.isBookable
      if (parsed.data.status !== undefined) updateData.status = parsed.data.status
      if (parsed.data.email !== undefined) {
        updateData.email = parsed.data.email
      }

      const [staff] = await db
        .update(staffProfiles)
        .set(updateData)
        .where(and(eq(staffProfiles.id, id), eq(staffProfiles.tenantId, getTenantId())))
        .returning()

      if (!staff) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Personal no encontrado' }, requestId },
          { status: 404 }
        )
      }
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

export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'id es requerido' }, requestId },
        { status: 400 }
      )
    }
    const result = await withTenantRequest(request.headers, async () => {
      const [staff] = await db
        .update(staffProfiles)
        .set({ status: 'inactive', updatedAt: new Date() })
        .where(and(eq(staffProfiles.id, id), eq(staffProfiles.tenantId, getTenantId())))
        .returning()

      if (!staff) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Personal no encontrado' }, requestId },
          { status: 404 }
        )
      }
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
