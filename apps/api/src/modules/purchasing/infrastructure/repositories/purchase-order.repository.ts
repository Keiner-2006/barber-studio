import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { purchaseOrders, purchaseOrderItems, goodsReceipts } from '@/shared/db/schema'
import { products } from '@/shared/db/schema/inventory'
import { eq, and, desc, sql } from 'drizzle-orm'

export const purchaseOrderRepository = {
  async findById(id: string) {
    return db.query.purchaseOrders.findFirst({
      where: and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, getTenantId())),
    })
  },

  async list(tenantId: string, filters?: { status?: string; branchId?: string }) {
    const conditions = [eq(purchaseOrders.tenantId, tenantId)]
    if (filters?.status) conditions.push(eq(purchaseOrders.status, filters.status as any))
    if (filters?.branchId) conditions.push(eq(purchaseOrders.branchId, filters.branchId))

    return db.query.purchaseOrders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(purchaseOrders.createdAt)],
    })
  },

  async create(data: { supplierId: string; branchId: string; expectedDate?: string; notes?: string; items: { productId: string; quantityOrdered: number; unitCost: string }[] }) {
    const [order] = await db
      .insert(purchaseOrders)
      .values({
        ...data,
        tenantId: getTenantId(),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
        createdBy: getTenantId(),
      })
      .returning()
    return order
  },

  async updateStatus(id: string, status: string) {
    const [order] = await db
      .update(purchaseOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, getTenantId())))
      .returning()
    return order
  },

  async addItems(orderId: string, items: { productId: string; quantityOrdered: number; unitCost: string }[]) {
    const values = items.map((item) => ({
      tenantId: getTenantId(),
      orderId,
      productId: item.productId,
      quantityOrdered: item.quantityOrdered,
      quantityReceived: 0,
      unitCost: item.unitCost,
    }))
    const inserted = await db
      .insert(purchaseOrderItems)
      .values(values)
      .returning()
    return inserted
  },

  async getItems(orderId: string) {
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
  },

  async receiveOrder(orderId: string, receivedBy: string) {
    const [order] = await db
      .update(purchaseOrders)
      .set({ status: 'received', updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.tenantId, getTenantId())))
      .returning()
    return order
  },

  async createReceipt(data: { orderId: string; receivedBy: string; items: { productId: string; quantityReceived: number }[]; notes?: string }) {
    const [receipt] = await db
      .insert(goodsReceipts)
      .values({
        tenantId: getTenantId(),
        orderId: data.orderId,
        receivedBy: data.receivedBy,
        notes: data.notes,
      })
      .returning()
    return receipt
  },
}
