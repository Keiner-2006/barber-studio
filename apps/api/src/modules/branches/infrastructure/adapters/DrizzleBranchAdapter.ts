import { IBranchRepository, CreateBranchData, UpdateBranchData } from '../../application/ports/IBranchRepository'
import { Branch } from '../../domain/entities/Branch'
import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { branches, staffProfiles } from '@/shared/db/schema/branches'
import { eq, and } from 'drizzle-orm'

export class DrizzleBranchAdapter implements IBranchRepository {
  async findById(id: string): Promise<Branch | null> {
    const row = await db.query.branches.findFirst({
      where: and(eq(branches.id, id), eq(branches.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toDomain(row)
  }

  async findByCode(code: string): Promise<Branch | null> {
    const row = await db.query.branches.findFirst({
      where: and(eq(branches.code, code), eq(branches.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toDomain(row)
  }

  async create(data: CreateBranchData): Promise<Branch> {
    const [row] = await db
      .insert(branches)
      .values({
        ...data,
        tenantId: getTenantId(),
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? null,
        postalCode: data.postalCode ?? null,
        phone: data.phone ?? null,
        timezone: data.timezone ?? null,
        operatingHours: data.operatingHours ?? null,
      })
      .returning()

    return this.toDomain(row)
  }

  async update(id: string, data: UpdateBranchData): Promise<Branch | null> {
    const updateData: any = { updatedAt: new Date() }
    if (data.name !== undefined) updateData.name = data.name
    if (data.address !== undefined) updateData.address = data.address
    if (data.city !== undefined) updateData.city = data.city
    if (data.state !== undefined) updateData.state = data.state
    if (data.country !== undefined) updateData.country = data.country
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.timezone !== undefined) updateData.timezone = data.timezone
    if (data.status !== undefined) updateData.status = data.status
    if (data.operatingHours !== undefined) updateData.operatingHours = data.operatingHours

    const [row] = await db
      .update(branches)
      .set(updateData)
      .where(and(eq(branches.id, id), eq(branches.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toDomain(row)
  }

  async list(): Promise<Branch[]> {
    const rows = await db.query.branches.findMany({
      where: eq(branches.tenantId, getTenantId()),
      orderBy: [branches.name],
    })

    return rows.map((row) => this.toDomain(row))
  }

  async getStaff(branchId: string): Promise<any[]> {
    return db.query.staffProfiles.findMany({
      where: and(eq(staffProfiles.status, 'active'), eq(staffProfiles.tenantId, getTenantId())),
    })
  }

  private toDomain(row: any): Branch {
    return Branch.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      code: row.code,
      name: row.name,
      address: row.address ?? null,
      city: row.city ?? null,
      state: row.state ?? null,
      country: row.country ?? null,
      postalCode: row.postalCode ?? null,
      phone: row.phone ?? null,
      timezone: row.timezone ?? null,
      status: row.status,
      operatingHours: row.operatingHours ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}