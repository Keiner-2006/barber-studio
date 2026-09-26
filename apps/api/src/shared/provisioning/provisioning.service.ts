import { getPlatformDb, getTenantDb } from '@/shared/db'
import { platformTenants, platformUsers, platformMemberships, tenantProvisioningJobs, tenantBranding } from '@/shared/db/schema/platform-schema'
import { users, roles, userRoles, branches } from '@/shared/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { AppError } from '@/shared/errors/app-error'
import { runWithRequestContext, type RequestContext } from '@/shared/tenancy/request-context'
import { resolveDatabaseUrl } from '@/shared/tenancy/tenant-context'

const DEFAULT_BRANCH_NAME = 'Sucursal Principal'

export interface CreateTenantInput {
  legalName: string
  tradeName: string
  slug: string
  businessType: 'barberia' | 'peluqueria' | 'grooming' | 'otro'
  email: string
  ownerName: string
  ownerLastName?: string
  phone?: string
  documentType?: string
  documentNumber?: string
  birthDate?: string
  city?: string
  logoUrl?: string
  primaryColor?: string
}

export interface ProvisioningResult {
  jobId: string
  tenantId: string
  status: string
}

export class ProvisioningService {
  async createTenantAndJob(input: CreateTenantInput): Promise<ProvisioningResult> {
    const platformDb = getPlatformDb()
    const tenantId = randomUUID()
    const jobId = randomUUID()
    const membershipId = randomUUID()

    const [existingUser] = await platformDb
      .select({ id: platformUsers.id, email: platformUsers.email, name: platformUsers.name })
      .from(platformUsers)
      .where(eq(platformUsers.email, input.email))
      .limit(1)

    const userId = existingUser?.id || randomUUID()

if (!existingUser) {
       await platformDb.insert(platformUsers).values({
         id: userId,
         email: input.email,
         name: input.ownerName,
         lastName: input.ownerLastName || null,
         phone: input.phone || null,
         documentType: input.documentType || null,
         documentNumber: input.documentNumber || null,
         birthDate: input.birthDate || null,
         city: input.city || null,
         passwordHash: 'oauth:better-auth',
         status: 'active',
       })
     } else {
       await platformDb.update(platformUsers)
         .set({
           ...(input.ownerLastName && { lastName: input.ownerLastName }),
           ...(input.phone && { phone: input.phone }),
           ...(input.documentType && { documentType: input.documentType }),
           ...(input.documentNumber && { documentNumber: input.documentNumber }),
           ...(input.birthDate && { birthDate: input.birthDate }),
           ...(input.city && { city: input.city }),
         })
         .where(eq(platformUsers.id, existingUser.id))
     }

    await platformDb.insert(platformTenants).values({
      id: tenantId,
      legalName: input.legalName,
      tradeName: input.tradeName,
      slug: input.slug,
      businessType: input.businessType,
      status: 'provisioning',
      phone: input.phone || null,
    })

    await platformDb.insert(platformMemberships).values({
      id: membershipId,
      tenantId,
      userId,
      role: 'owner',
      status: 'active',
    })

    await platformDb.insert(tenantBranding).values({
      tenantId,
      logoUrl: input.logoUrl || null,
      primaryColor: input.primaryColor || null,
      socialLinks: {},
      publicBookingEnabled: true,
    })

    await platformDb.insert(tenantProvisioningJobs).values({
      id: jobId,
      tenantId,
      idempotencyKey: `onboarding_${tenantId}`,
      status: 'queued',
      step: 'tenant_created',
    })

    return { jobId, tenantId, status: 'queued' }
  }

  async createTenantData(tenantId: string, tenant: typeof platformTenants.$inferSelect, platformUserId: string): Promise<void> {
    const platformDb = getPlatformDb()
    const databaseUrl = resolveDatabaseUrl(tenant as any)

    const [platformUser] = await platformDb
      .select({ email: platformUsers.email, name: platformUsers.name })
      .from(platformUsers)
      .where(eq(platformUsers.id, platformUserId))
      .limit(1)

    const ctx: RequestContext = {
      tenantId,
      userId: platformUserId,
      userRole: 'owner',
      databaseUrl,
      requestId: randomUUID(),
    }

    await runWithRequestContext(ctx, async () => {
      const tenantDb = getTenantDb()

      const [existingBranch] = await tenantDb.select().from(branches).where(eq(branches.tenantId, tenantId)).limit(1)
      if (!existingBranch) {
        await tenantDb.insert(branches).values({
          id: randomUUID(),
          tenantId,
          code: 'MAIN',
          name: DEFAULT_BRANCH_NAME,
          address: null,
          city: null,
          state: null,
          country: 'CO',
          postalCode: null,
          phone: tenant.phone || null,
          timezone: 'America/Bogota',
          status: 'active',
        })
      }

      const existingRoles = await tenantDb.select().from(roles).where(eq(roles.tenantId, tenantId))
      if (existingRoles.length === 0) {
        const roleData = [
          { name: 'admin', description: 'Administrador del negocio', isSystem: true },
          { name: 'app', description: 'Aplicación de gestión', isSystem: true },
          { name: 'barber', description: 'Barbero', isSystem: true },
          { name: 'reception', description: 'Recepcionista', isSystem: true },
          { name: 'inventory_manager', description: 'Gestor de inventario', isSystem: true },
          { name: 'accountant', description: 'Contador', isSystem: true },
          { name: 'customer', description: 'Cliente', isSystem: true },
        ]
        for (const role of roleData) {
          await tenantDb.insert(roles).values({
            id: randomUUID(),
            tenantId,
            name: role.name,
            description: role.description,
            isSystem: role.isSystem,
          })
        }
      }

      const [existingUser] = await tenantDb.select().from(users).where(eq(users.platformUserId, platformUserId)).limit(1)
      if (!existingUser) {
        const [adminRole] = await tenantDb.select().from(roles).where(eq(roles.name, 'admin')).limit(1)
        const newUserId = randomUUID()
        await tenantDb.insert(users).values({
          id: newUserId,
          tenantId,
          platformUserId,
          email: platformUser?.email || '',
          name: platformUser?.name || '',
          status: 'active',
        })

        if (adminRole) {
          await tenantDb.insert(userRoles).values({
            id: randomUUID(),
            tenantId,
            userId: newUserId,
            roleId: adminRole.id,
          })
        }
      }
    })
  }

  async advanceJob(jobId: string, step: string, status: string, error?: string): Promise<void> {
    const platformDb = getPlatformDb()
    await platformDb
      .update(tenantProvisioningJobs)
      .set({
        step,
        status: status as any,
        errorDetail: error || null,
        updatedAt: new Date(),
        completedAt: ['succeeded', 'failed', 'compensated'].includes(status) ? new Date() : null,
      })
      .where(eq(tenantProvisioningJobs.id, jobId))
  }

  async activateTenant(tenantId: string): Promise<void> {
    const platformDb = getPlatformDb()
    const [tenant] = await platformDb.select().from(platformTenants).where(eq(platformTenants.id, tenantId)).limit(1)
    await platformDb
      .update(platformTenants)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(platformTenants.id, tenantId))
    if (tenant) {
      const [ownerMembership] = await platformDb
        .select({ userId: platformMemberships.userId, membershipId: platformMemberships.id })
        .from(platformMemberships)
        .where(eq(platformMemberships.tenantId, tenantId))
        .limit(1)
      if (ownerMembership) {
        await this.createTenantData(tenantId, tenant, ownerMembership.userId)
      }
    }
  }

  async getJob(jobId: string) {
    const platformDb = getPlatformDb()
    const [job] = await platformDb
      .select()
      .from(tenantProvisioningJobs)
      .where(eq(tenantProvisioningJobs.id, jobId))
      .limit(1)
    return job || null
  }

  async getTenantBySlug(slug: string) {
    const platformDb = getPlatformDb()
    const [tenant] = await platformDb
      .select()
      .from(platformTenants)
      .where(eq(platformTenants.slug, slug))
      .limit(1)
    return tenant || null
  }

  }
