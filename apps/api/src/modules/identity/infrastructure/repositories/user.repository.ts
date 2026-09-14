import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { users, roles, userRoles, userBranches } from '@/shared/db/schema/identity'
import { eq, like, or, desc, and, isNull } from 'drizzle-orm'

export const userRepository = {
  async findById(id: string) {
    return db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.tenantId, getTenantId())),
    })
  },

  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: and(eq(users.email, email), eq(users.tenantId, getTenantId())),
    })
  },

  async create(data: { email: string; name: string; passwordHash: string }) {
    const [user] = await db
      .insert(users)
      .values({
        tenantId: getTenantId(),
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      })
      .returning()
    return user
  },

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.tenantId, getTenantId())))
      .returning()
    return user
  },

  async list(query?: string, cursor?: string, limit = 50) {
    const conditions = [isNull(users.deletedAt), eq(users.tenantId, getTenantId())]
    if (query) {
      conditions.push(
        or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`),
          like(users.phone, `%${query}%`)
        )!
      )
    }
    if (cursor) {
      conditions.push(eq(users.id, cursor))
    }

    return db.query.users.findMany({
      where: and(...conditions),
      orderBy: [desc(users.createdAt)],
      limit,
    })
  },

  async getUserRoles(userId: string) {
    return db
      .select({ roleId: userRoles.roleId, roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(userRoles.tenantId, getTenantId()), eq(roles.tenantId, getTenantId())))
  },

  async getUserBranches(userId: string) {
    return db
      .select({ branchId: userBranches.branchId })
      .from(userBranches)
      .where(and(eq(userBranches.userId, userId), eq(userBranches.tenantId, getTenantId())))
  },

  async assignRole(userId: string, roleId: string) {
    return db.insert(userRoles).values({ tenantId: getTenantId(), userId, roleId })
  },

  async assignBranch(userId: string, branchId: string) {
    return db.insert(userBranches).values({ tenantId: getTenantId(), userId, branchId })
  },
}
