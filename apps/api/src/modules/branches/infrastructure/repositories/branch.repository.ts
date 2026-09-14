import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { branches, staffProfiles } from '@/shared/db/schema/branches'
import { eq, and } from 'drizzle-orm'
import type { CreateBranchInput } from '../../presentation/schemas/branch.schema'

export const branchRepository = {
  async findById(id: string) {
    return db.query.branches.findFirst({
      where: and(eq(branches.id, id), eq(branches.tenantId, getTenantId())),
    })
  },

  async findByCode(code: string) {
    return db.query.branches.findFirst({
      where: and(eq(branches.code, code), eq(branches.tenantId, getTenantId())),
    })
  },

  async create(data: CreateBranchInput) {
    const [branch] = await db
      .insert(branches)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return branch
  },

  async update(id: string, data: Partial<typeof branches.$inferInsert>) {
    const [branch] = await db
      .update(branches)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(branches.id, id), eq(branches.tenantId, getTenantId())))
      .returning()
    return branch
  },

  async list() {
    return db.query.branches.findMany({
      where: eq(branches.tenantId, getTenantId()),
      orderBy: [branches.name],
    })
  },

  async getStaff(branchId: string) {
    return db.query.staffProfiles.findMany({
      where: and(eq(staffProfiles.status, 'active'), eq(staffProfiles.tenantId, getTenantId())),
    })
  },
}
