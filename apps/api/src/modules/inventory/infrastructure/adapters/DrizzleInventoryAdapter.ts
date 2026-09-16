import { IInventoryRepository, CreateProductData, UpdateProductData, InventoryAdjustmentData } from '../../application/ports/IInventoryRepository'
import { Product } from '../../domain/entities/Product'
import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { products, branchInventory, inventoryMovements, inventoryMovementTypeEnum } from '@/shared/db/schema/inventory'
import { eq, and, isNull } from 'drizzle-orm'

export class DrizzleInventoryAdapter implements IInventoryRepository {
  async findProductById(id: string): Promise<Product | null> {
    const row = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toDomain(row)
  }

  async findProductBySku(sku: string): Promise<Product | null> {
    const row = await db.query.products.findFirst({
      where: and(eq(products.sku, sku), eq(products.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toDomain(row)
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    const [row] = await db
      .insert(products)
      .values({
        ...data,
        tenantId: getTenantId(),
        description: data.description ?? null,
        category: data.category ?? null,
        unit: data.unit ?? 'pieza',
        suggestedPrice: data.suggestedPrice ?? null,
        minQuantity: data.minQuantity ?? 0,
      })
      .returning()

    return this.toDomain(row)
  }

  async updateProduct(id: string, data: UpdateProductData): Promise<Product | null> {
    const updateData: any = { updatedAt: new Date() }
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.unitCost !== undefined) updateData.unitCost = data.unitCost
    if (data.suggestedPrice !== undefined) updateData.suggestedPrice = data.suggestedPrice
    if (data.minQuantity !== undefined) updateData.minQuantity = data.minQuantity
    if (data.active !== undefined) updateData.active = data.active

    const [row] = await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, id), eq(products.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toDomain(row)
  }

  async deleteProduct(id: string): Promise<Product | null> {
    const [row] = await db
      .update(products)
      .set({ deletedAt: new Date(), active: false, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toDomain(row)
  }

  async listProducts(): Promise<Product[]> {
    const rows = await db.query.products.findMany({
      where: and(isNull(products.deletedAt), eq(products.tenantId, getTenantId())),
      orderBy: [products.name],
    })

    return rows.map((row) => this.toDomain(row))
  }

  async getBranchInventory(branchId: string): Promise<any[]> {
    return db
      .select()
      .from(branchInventory)
      .innerJoin(products, eq(branchInventory.productId, products.id))
      .where(and(eq(branchInventory.branchId, branchId), eq(branchInventory.tenantId, getTenantId()), eq(products.tenantId, getTenantId())))
  }

  async getLowStockItems(branchId: string): Promise<any[]> {
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
  }

  async createMovement(data: InventoryAdjustmentData): Promise<any> {
    const [movement] = await db
      .insert(inventoryMovements)
      .values({
        ...data,
        tenantId: getTenantId(),
        unitCost: data.unitCost ?? null,
        reference: data.reference ?? null,
        notes: data.notes ?? null,
      })
      .returning()

    return movement
  }

  async updateStock(branchId: string, productId: string, quantityChange: string): Promise<any> {
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
  }

  private toDomain(row: any): Product {
    return Product.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      sku: row.sku,
      description: row.description ?? null,
      category: row.category ?? null,
      unit: row.unit,
      unitCost: row.unitCost,
      suggestedPrice: row.suggestedPrice ?? null,
      minQuantity: row.minQuantity,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    })
  }
}