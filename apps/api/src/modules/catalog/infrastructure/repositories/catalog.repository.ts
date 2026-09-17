import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { services, serviceCategories, branchServices } from '@/shared/db/schema/catalog'
import { eq, and, isNull, ilike } from 'drizzle-orm'
import type { CreateServiceInput, CreateServiceCategoryInput, UpdateServiceInput, UpdateServiceCategoryInput } from '../../presentation/schemas/catalog.schema'

export const catalogRepository = {
  async findCategoryById(id: string) {
    return db.query.serviceCategories.findFirst({
      where: and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, getTenantId())),
    })
  },

  async createCategory(data: CreateServiceCategoryInput) {
    const [category] = await db
      .insert(serviceCategories)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return category
  },

  async updateCategory(id: string, data: UpdateServiceCategoryInput) {
    const [category] = await db
      .update(serviceCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, getTenantId())))
      .returning()
    return category
  },

  deleteCategory(id: string) {
    return db
      .update(serviceCategories)
      .set({ deletedAt: new Date(), active: false, updatedAt: new Date() })
      .where(and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, getTenantId())))
      .returning()
  },

  async listCategories() {
    return db.query.serviceCategories.findMany({
      where: and(isNull(serviceCategories.deletedAt), eq(serviceCategories.tenantId, getTenantId())),
      orderBy: [serviceCategories.displayOrder],
    })
  },

  async findServiceById(id: string) {
    return db.query.services.findFirst({
      where: and(eq(services.id, id), eq(services.tenantId, getTenantId())),
      with: {
        // category: true, // TODO: add relation
      },
    })
  },

  async createService(data: CreateServiceInput) {
    const [service] = await db
      .insert(services)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return service
  },

  async updateService(id: string, data: UpdateServiceInput) {
    const [service] = await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(services.id, id), eq(services.tenantId, getTenantId())))
      .returning()
    return service
  },

  deleteService(id: string) {
    return db
      .update(services)
      .set({ deletedAt: new Date(), active: false, updatedAt: new Date() })
      .where(and(eq(services.id, id), eq(services.tenantId, getTenantId())))
      .returning()
  },

  async listServices(categoryId?: string, search?: string) {
    const conditions = [isNull(services.deletedAt), eq(services.active, true)]
    if (categoryId) {
      conditions.push(eq(services.categoryId, categoryId))
    }
    if (search) {
      conditions.push(ilike(services.name, `%${search}%`))
    }

    return db.query.services.findMany({
      where: and(...conditions, eq(services.tenantId, getTenantId())),
      orderBy: [services.name],
    })
  },

  async getBranchServices(branchId: string) {
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
  },
}
