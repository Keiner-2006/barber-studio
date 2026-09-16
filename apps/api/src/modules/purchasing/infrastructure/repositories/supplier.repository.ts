import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { suppliers } from '@/shared/db/schema/purchasing'
import { eq, and, or, like, isNull, desc } from 'drizzle-orm'

export const supplierRepository = {
  async findById(id: string) {
    return db.query.suppliers.findFirst({
      where: and(eq(suppliers.id, id), eq(suppliers.tenantId, getTenantId())),
    })
  },

  async findByName(name: string, tenantId: string) {
    return db.query.suppliers.findFirst({
      where: and(eq(suppliers.name, name), eq(suppliers.tenantId, tenantId)),
    })
  },

  async list(tenantId: string) {
    return db.query.suppliers.findMany({
      where: and(eq(suppliers.tenantId, tenantId), isNull(suppliers.deletedAt)),
      orderBy: [desc(suppliers.createdAt)],
    })
  },

  async create(data: { name: string; contactName?: string | null; email?: string | null; phone?: string | null; address?: string | null; notes?: string | null }) {
    const [supplier] = await db
      .insert(suppliers)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return supplier
  },

  async update(id: string, data: Partial<{ name: string; contactName: string | null; email: string | null; phone: string | null; address: string | null; notes: string | null }>) {
    const [supplier] = await db
      .update(suppliers)
      .set(data)
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, getTenantId())))
      .returning()
    return supplier
  },

  async deactivate(id: string) {
    const [supplier] = await db
      .update(suppliers)
      .set({ active: false, deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, getTenantId())))
      .returning()
    return supplier
  },
}
