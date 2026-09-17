import { ICatalogRepository, CreateServiceCategoryData, UpdateServiceCategoryData, CreateServiceData, UpdateServiceData } from '../../application/ports/ICatalogRepository'
import { ServiceCategory } from '../../domain/entities/ServiceCategory'
import { Service } from '../../domain/entities/Service'
import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { services, serviceCategories, branchServices } from '@/shared/db/schema/catalog'
import { eq, and, isNull, ilike } from 'drizzle-orm'

export class DrizzleCatalogAdapter implements ICatalogRepository {
  async findCategoryById(id: string): Promise<ServiceCategory | null> {
    const row = await db.query.serviceCategories.findFirst({
      where: and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toCategoryDomain(row)
  }

  async createCategory(data: CreateServiceCategoryData): Promise<ServiceCategory> {
    const [row] = await db
      .insert(serviceCategories)
      .values({
        ...data,
        tenantId: getTenantId(),
        description: data.description ?? null,
        displayOrder: data.displayOrder ?? 0,
      })
      .returning()

    return this.toCategoryDomain(row)
  }

  async updateCategory(id: string, data: UpdateServiceCategoryData): Promise<ServiceCategory | null> {
    const updateData: any = { updatedAt: new Date() }
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
    if (data.active !== undefined) updateData.active = data.active

    const [row] = await db
      .update(serviceCategories)
      .set(updateData)
      .where(and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toCategoryDomain(row)
  }

  async deleteCategory(id: string): Promise<ServiceCategory | null> {
    const [row] = await db
      .update(serviceCategories)
      .set({ deletedAt: new Date(), active: false, updatedAt: new Date() })
      .where(and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toCategoryDomain(row)
  }

  async listCategories(): Promise<ServiceCategory[]> {
    const rows = await db.query.serviceCategories.findMany({
      where: and(isNull(serviceCategories.deletedAt), eq(serviceCategories.tenantId, getTenantId())),
      orderBy: [serviceCategories.displayOrder],
    })

    return rows.map((row) => this.toCategoryDomain(row))
  }

  async findServiceById(id: string): Promise<Service | null> {
    const row = await db.query.services.findFirst({
      where: and(eq(services.id, id), eq(services.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toServiceDomain(row)
  }

  async createService(data: CreateServiceData): Promise<Service> {
    const [row] = await db
      .insert(services)
      .values({
        ...data,
        tenantId: getTenantId(),
        description: data.description ?? null,
        currency: data.currency ?? 'MXN',
        paymentPolicy: data.paymentPolicy ?? 'none',
        depositType: data.depositType ?? null,
        depositValue: data.depositValue ?? null,
        cancellationMinutes: data.cancellationMinutes ?? null,
      })
      .returning()

    return this.toServiceDomain(row)
  }

  async updateService(id: string, data: UpdateServiceData): Promise<Service | null> {
    const updateData: any = { updatedAt: new Date() }
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes
    if (data.priceBase !== undefined) updateData.priceBase = data.priceBase
    if (data.paymentPolicy !== undefined) updateData.paymentPolicy = data.paymentPolicy
    if (data.depositType !== undefined) updateData.depositType = data.depositType
    if (data.depositValue !== undefined) updateData.depositValue = data.depositValue
    if (data.cancellationMinutes !== undefined) updateData.cancellationMinutes = data.cancellationMinutes
    if (data.active !== undefined) updateData.active = data.active

    const [row] = await db
      .update(services)
      .set(updateData)
      .where(and(eq(services.id, id), eq(services.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toServiceDomain(row)
  }

  async deleteService(id: string): Promise<Service | null> {
    const [row] = await db
      .update(services)
      .set({ deletedAt: new Date(), active: false, updatedAt: new Date() })
      .where(and(eq(services.id, id), eq(services.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toServiceDomain(row)
  }

  async listServices(categoryId?: string, search?: string): Promise<Service[]> {
    const conditions = [isNull(services.deletedAt), eq(services.active, true), eq(services.tenantId, getTenantId())]
    if (categoryId) {
      conditions.push(eq(services.categoryId, categoryId))
    }
    if (search) {
      conditions.push(ilike(services.name, `%${search}%`))
    }

    const rows = await db.query.services.findMany({
      where: and(...conditions),
      orderBy: [services.name],
    })

    return rows.map((row) => this.toServiceDomain(row))
  }

  async getBranchServices(branchId: string): Promise<any[]> {
    return db
      .select()
      .from(branchServices)
      .innerJoin(services, eq(branchServices.serviceId, services.id))
      .where(
        and(
          eq(branchServices.branchId, branchId),
          eq(branchServices.tenantId, getTenantId()),
          eq(branchServices.active, true)
        )
      )
  }

  private toCategoryDomain(row: any): ServiceCategory {
    return ServiceCategory.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? null,
      displayOrder: row.displayOrder,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    })
  }

  private toServiceDomain(row: any): Service {
    return Service.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description ?? null,
      durationMinutes: row.durationMinutes,
      priceBase: row.priceBase,
      currency: row.currency,
      paymentPolicy: row.paymentPolicy,
      depositType: row.depositType ?? null,
      depositValue: row.depositValue ?? null,
      cancellationMinutes: row.cancellationMinutes ?? null,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    })
  }
}