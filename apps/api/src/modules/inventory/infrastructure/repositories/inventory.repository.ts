import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { products, branchInventory, inventoryMovements, inventoryMovementTypeEnum } from '@/shared/db/schema/inventory'
import { eq, and, isNull, desc } from 'drizzle-orm'
import type { CreateProductInput } from '../../presentation/schemas/inventory.schema'

export const inventoryRepository = {
  async findProductById(id: string) {
    return db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.tenantId, getTenantId())),
    })
  },

  async findProductBySku(sku: string) {
    return db.query.products.findFirst({
      where: and(eq(products.sku, sku), eq(products.tenantId, getTenantId())),
    })
  },

  async createProduct(data: CreateProductInput) {
    const [product] = await db
      .insert(products)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return product
  },

  async updateProduct(id: string, data: Partial<typeof products.$inferInsert>) {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, getTenantId())))
      .returning()
    return product
  },

  async listProducts() {
    return db.query.products.findMany({
      where: and(isNull(products.deletedAt), eq(products.tenantId, getTenantId())),
      orderBy: [products.name],
    })
  },

  async getBranchInventory(branchId: string) {
    return db
      .select()
      .from(branchInventory)
      .innerJoin(products, eq(branchInventory.productId, products.id))
      .where(and(eq(branchInventory.branchId, branchId), eq(branchInventory.tenantId, getTenantId()), eq(products.tenantId, getTenantId())))
  },

  async getLowStockItems(branchId: string) {
    return db
      .select()
      .from(branchInventory)
      .innerJoin(products, eq(branchInventory.productId, products.id))
      .where(
        and(
          eq(branchInventory.branchId, branchId),
          eq(branchInventory.tenantId, getTenantId()),
          eq(products.tenantId, getTenantId()),
          eq(products.active, true)
        )
      )
  },

  async createMovement(data: {
    productId: string
    branchId: string
    type: (typeof inventoryMovementTypeEnum.enumValues)[number]
    quantity: string
    unitCost?: string
    reference?: string
    actorId?: string
    notes?: string
  }) {
    const [movement] = await db
      .insert(inventoryMovements)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return movement
  },

  async updateStock(branchId: string, productId: string, quantityChange: string) {
    const existing = await db
      .select()
      .from(branchInventory)
      .where(
        and(
          eq(branchInventory.branchId, branchId),
          eq(branchInventory.productId, productId)
        )
      )
      .limit(1)

    if (existing.length === 0) {
      return db
        .insert(branchInventory)
        .values({
          tenantId: getTenantId(),
          branchId,
          productId,
          quantity: quantityChange,
        })
        .returning()
    }

    return db
      .update(branchInventory)
      .set({
        quantity: quantityChange,
        updatedAt: new Date(),
      })
      .where(and(
        eq(branchInventory.branchId, branchId),
        eq(branchInventory.productId, productId),
        eq(branchInventory.tenantId, getTenantId())
      ))
      .returning()
  },
}
