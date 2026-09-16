import { IPurchasingRepository, CreateSupplierData, UpdateSupplierData } from '../../application/ports/IPurchasingRepository'
import { Supplier } from '../../domain/entities/Supplier'
import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { suppliers, purchaseOrders, purchaseOrderItems, goodsReceipts } from '@/shared/db/schema/purchasing'
import { products } from '@/shared/db/schema/inventory'
import { eq, and, desc, sql } from 'drizzle-orm'

export class DrizzlePurchasingAdapter implements IPurchasingRepository {
  async findSupplierById(id: string): Promise<Supplier | null> {
    const row = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.id, id), eq(suppliers.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toSupplierDomain(row)
  }

  async findSupplierByName(name: string): Promise<Supplier | null> {
    const row = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.name, name), eq(suppliers.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toSupplierDomain(row)
  }

  async listSuppliers(): Promise<Supplier[]> {
    const rows = await db.query.suppliers.findMany({
      where: and(eq(suppliers.tenantId, getTenantId())),
      orderBy: [desc(suppliers.createdAt)],
    })

    return rows.map((row) => this.toSupplierDomain(row))
  }

  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    const [row] = await db
      .insert(suppliers)
      .values({
        ...data,
        tenantId: getTenantId(),
        contactName: data.contactName ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,
      })
      .returning()

    return this.toSupplierDomain(row)
  }

  async updateSupplier(id: string, data: UpdateSupplierData): Promise<Supplier | null> {
    const updateData: any = { updatedAt: new Date() }
    if (data.name !== undefined) updateData.name = data.name
    if (data.contactName !== undefined) updateData.contactName = data.contactName
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.address !== undefined) updateData.address = data.address
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.active !== undefined) updateData.active = data.active

    const [row] = await db
      .update(suppliers)
      .set(updateData)
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toSupplierDomain(row)
  }

  async deactivateSupplier(id: string): Promise<Supplier | null> {
    const [row] = await db
      .update(suppliers)
      .set({ active: false, deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toSupplierDomain(row)
  }

  async findOrderById(id: string): Promise<any | null> {
    return db.query.purchaseOrders.findFirst({
      where: and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, getTenantId())),
    })
  }

  async listOrders(filters?: { status?: string; branchId?: string }): Promise<any[]> {
    const conditions = [eq(purchaseOrders.tenantId, getTenantId())]
    if (filters?.status) conditions.push(eq(purchaseOrders.status, filters.status as any))
    if (filters?.branchId) conditions.push(eq(purchaseOrders.branchId, filters.branchId))

    return db.query.purchaseOrders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(purchaseOrders.createdAt)],
    })
  }

  async createOrder(data: { supplierId: string; branchId: string; expectedDate?: string; notes?: string; items: { productId: string; quantityOrdered: number; unitCost: string }[] }): Promise<any> {
    const [order] = await db
      .insert(purchaseOrders)
      .values({
        supplierId: data.supplierId,
        branchId: data.branchId,
        tenantId: getTenantId(),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
        notes: data.notes ?? null,
        createdBy: getTenantId(),
      })
      .returning()

    if (data.items && data.items.length > 0) {
      await this.addOrderItems(order.id, data.items)
    }

    return order
  }

  async updateOrderStatus(id: string, status: string): Promise<any | null> {
    const [order] = await db
      .update(purchaseOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, getTenantId())))
      .returning()

    return order
  }

  async addOrderItems(orderId: string, items: { productId: string; quantityOrdered: number; unitCost: string }[]): Promise<any[]> {
    const values = items.map((item) => ({
      tenantId: getTenantId(),
      orderId,
      productId: item.productId,
      quantityOrdered: item.quantityOrdered,
      quantityReceived: 0,
      unitCost: item.unitCost,
    }))

    return db
      .insert(purchaseOrderItems)
      .values(values)
      .returning()
  }

  async getOrderItems(orderId: string): Promise<any[]> {
    return db
      .select({
        id: purchaseOrderItems.id,
        tenantId: purchaseOrderItems.tenantId,
        orderId: purchaseOrderItems.orderId,
        productId: purchaseOrderItems.productId,
        productName: products.name,
        quantityOrdered: purchaseOrderItems.quantityOrdered,
        quantityReceived: purchaseOrderItems.quantityReceived,
        unitCost: purchaseOrderItems.unitCost,
        totalCost: sql<string>`${purchaseOrderItems.quantityOrdered} * ${purchaseOrderItems.unitCost}`,
        createdAt: purchaseOrderItems.createdAt,
      })
      .from(purchaseOrderItems)
      .leftJoin(products, eq(purchaseOrderItems.productId, products.id))
      .where(and(
        eq(purchaseOrderItems.orderId, orderId),
        eq(purchaseOrderItems.tenantId, getTenantId()),
      ))
      .orderBy(desc(purchaseOrderItems.createdAt))
  }

  async receiveOrder(orderId: string, receivedBy: string): Promise<any | null> {
    const [order] = await db
      .update(purchaseOrders)
      .set({ status: 'received', updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.tenantId, getTenantId())))
      .returning()

    return order
  }

  async createReceipt(data: { orderId: string; receivedBy: string; items: { productId: string; quantityReceived: number }[]; notes?: string }): Promise<any> {
    const [receipt] = await db
      .insert(goodsReceipts)
      .values({
        tenantId: getTenantId(),
        orderId: data.orderId,
        receivedBy: data.receivedBy,
        notes: data.notes ?? null,
      })
      .returning()

    return receipt
  }

  private toSupplierDomain(row: any): Supplier {
    return Supplier.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      contactName: row.contactName ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      address: row.address ?? null,
      notes: row.notes ?? null,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    })
  }
}