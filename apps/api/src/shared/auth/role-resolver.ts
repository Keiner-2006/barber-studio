import { getPlatformDb, getTenantDb } from '@/shared/db'
import { platformUsers, platformMemberships } from '@/shared/db/schema/platform-schema'
import { users, userRoles, roles } from '@/shared/db/schema/identity'
import { eq, or, and, ne } from 'drizzle-orm'

export type UserRole =
  | 'owner'
  | 'admin'
  | 'app'
  | 'reception'
  | 'barber'
  | 'inventory_manager'
  | 'accountant'
  | 'customer'

export const ROLE_CATEGORIES = {
  company_member: ['owner', 'admin', 'app', 'reception', 'barber', 'inventory_manager', 'accountant'],
  customer: ['customer'],
  platform_member: ['platform_admin', 'platform_support'],
} as const

export type RoleCategory = keyof typeof ROLE_CATEGORIES

export function getRoleCategory(role: string): RoleCategory | null {
  for (const [category, roleList] of Object.entries(ROLE_CATEGORIES)) {
    if ((roleList as readonly string[]).includes(role)) {
      return category as RoleCategory
    }
  }
  return null
}

export async function resolveUserRole(
  email: string,
  tenantId?: string
): Promise<{ role: string | null; category: RoleCategory | null; platformUserId?: string; localUserId?: string }> {
  if (tenantId) {
    const tenantDb = getTenantDb()
    const [localUser] = await tenantDb
      .select({
        userId: users.id,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.email, email))
      .limit(1)

    if (localUser && localUser.roleName) {
      const category = getRoleCategory(localUser.roleName)
      return {
        role: localUser.roleName,
        category,
        localUserId: localUser.userId,
      }
    }
  }

  const platformDb = getPlatformDb()

  const [platformUser] = await platformDb
    .select({
      userId: platformUsers.id,
      membershipRole: platformMemberships.role,
    })
    .from(platformUsers)
    .innerJoin(platformMemberships, eq(platformMemberships.userId, platformUsers.id))
    .where(and(eq(platformUsers.email, email), or(eq(platformMemberships.role, 'platform_admin'), eq(platformMemberships.role, 'platform_support'))))
    .limit(1)

  if (platformUser) {
    const category = getRoleCategory(platformUser.membershipRole)
    return {
      role: platformUser.membershipRole,
      category,
      platformUserId: platformUser.userId,
    }
  }

  const [fallbackMembership] = await platformDb
    .select({
      userId: platformUsers.id,
      membershipRole: platformMemberships.role,
    })
    .from(platformUsers)
    .innerJoin(platformMemberships, eq(platformMemberships.userId, platformUsers.id))
    .where(and(eq(platformUsers.email, email), ne(platformMemberships.role, 'platform_admin'), ne(platformMemberships.role, 'platform_support')))
    .limit(1)

  if (fallbackMembership) {
    const category = getRoleCategory(fallbackMembership.membershipRole)
    return {
      role: fallbackMembership.membershipRole,
      category,
      platformUserId: fallbackMembership.userId,
    }
  }

  return { role: null, category: null }
}

export function validateRoleForFlow(
  userRole: string | null,
  expectedFlow: 'company_member' | 'customer' | 'platform_member'
): boolean {
  if (!userRole) return false
  return (ROLE_CATEGORIES[expectedFlow] as readonly string[]).includes(userRole)
}
