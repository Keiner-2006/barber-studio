import { getPlatformDb } from '@/shared/db'
import { platformTenants, platformUsers, platformMemberships, tenantProvisioningJobs } from '@/shared/db/schema/platform-schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { AppError } from '@/shared/errors/app-error'

export interface CreateTenantInput {
  legalName: string
  tradeName: string
  slug: string
  businessType: 'barberia' | 'peluqueria' | 'grooming' | 'otro'
  email: string
  password: string
  phone?: string
  ownerName: string
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
    const userId = randomUUID()
    const jobId = randomUUID()
    const membershipId = randomUUID()

    const passwordHash = await this.hashPassword(input.password)

    await platformDb.insert(platformUsers).values({
      id: userId,
      email: input.email,
      name: input.ownerName,
      passwordHash,
      status: 'active',
    })

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

    await platformDb.insert(tenantProvisioningJobs).values({
      id: jobId,
      tenantId,
      idempotencyKey: `onboarding_${tenantId}`,
      status: 'queued',
      step: 'tenant_created',
    })

    return { jobId, tenantId, status: 'queued' }
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
    await platformDb
      .update(platformTenants)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(platformTenants.id, tenantId))
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

  private async hashPassword(password: string): Promise<string> {
    const crypto = await import('node:crypto')
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
    return `${salt}:${hash}`
  }
}
