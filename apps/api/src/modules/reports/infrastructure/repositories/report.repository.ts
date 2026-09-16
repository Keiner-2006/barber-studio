import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { appointments, appointmentPayments, services, products, branchInventory, cashSessions, cashRegisters, cashTransactions } from '@/shared/db/schema'
import { eq, and, sum, count, gte, lte, sql } from 'drizzle-orm'

export const reportRepository = {
  async getSales(filters: { from?: string; to?: string; branchId?: string } = {}) {
    const tenantId = getTenantId()
    const conditions = [eq(appointments.tenantId, tenantId)]
    if (filters.from) conditions.push(gte(appointments.startsAt, new Date(filters.from)))
    if (filters.to) conditions.push(lte(appointments.startsAt, new Date(filters.to)))
    if (filters.branchId) conditions.push(eq(appointments.branchId, filters.branchId))

    const results = await db
      .select({
        date: sql<string>`to_char(${appointments.startsAt}, 'YYYY-MM-DD')`,
        totalSales: sql<string>`coalesce(sum(case when ${appointmentPayments.status} = 'recorded' then ${appointmentPayments.amount} else 0 end), 0)`,
        totalOrders: count(appointments.id),
        averageTicket: sql<string>`coalesce(avg(${appointmentPayments.amount}), 0)`,
        currency: sql<string>`'MXN'`,
      })
      .from(appointments)
      .innerJoin(appointmentPayments, eq(appointmentPayments.appointmentId, appointments.id))
      .where(and(...conditions))
      .groupBy(sql`to_char(${appointments.startsAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${appointments.startsAt}, 'YYYY-MM-DD')`)

    return results.map((r) => ({
      date: r.date,
      totalSales: r.totalSales,
      totalOrders: Number(r.totalOrders),
      averageTicket: r.averageTicket,
      currency: r.currency,
    }))
  },

  async getOccupancy(filters: { from?: string; to?: string; branchId?: string } = {}) {
    const tenantId = getTenantId()
    const conditions = [eq(appointments.tenantId, tenantId)]
    if (filters.from) conditions.push(gte(appointments.startsAt, new Date(filters.from)))
    if (filters.to) conditions.push(lte(appointments.startsAt, new Date(filters.to)))
    if (filters.branchId) conditions.push(eq(appointments.branchId, filters.branchId))

    const results = await db
      .select({
        date: sql<string>`to_char(${appointments.startsAt}, 'YYYY-MM-DD')`,
        occupiedSlots: count(appointments.id),
      })
      .from(appointments)
      .where(and(...conditions))
      .groupBy(sql`to_char(${appointments.startsAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${appointments.startsAt}, 'YYYY-MM-DD')`)

    return results.map((r) => ({
      date: r.date,
      totalSlots: Math.max(Number(r.occupiedSlots), 1),
      occupiedSlots: Number(r.occupiedSlots),
      occupancyRate: 1,
    }))
  },

  async getServices(filters: { from?: string; to?: string; branchId?: string } = {}) {
    const tenantId = getTenantId()
    const conditions = [eq(appointments.tenantId, tenantId)]
    if (filters.from) conditions.push(gte(appointments.startsAt, new Date(filters.from)))
    if (filters.to) conditions.push(lte(appointments.startsAt, new Date(filters.to)))
    if (filters.branchId) conditions.push(eq(appointments.branchId, filters.branchId))

    const results = await db
      .select({
        id: services.id,
        name: services.name,
        totalSales: sql<string>`coalesce(sum(case when ${appointmentPayments.status} = 'recorded' then ${appointmentPayments.amount} else 0 end), 0)`,
        quantity: count(appointments.id),
        currency: sql<string>`'MXN'`,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(appointmentPayments, eq(appointmentPayments.appointmentId, appointments.id))
      .where(and(...conditions))
      .groupBy(services.id, services.name)
      .orderBy(sql`sum(${appointmentPayments.amount}) desc`)

    return results.map((r) => ({
      id: r.id,
      name: r.name,
      totalSales: r.totalSales,
      quantity: Number(r.quantity),
      currency: r.currency,
    }))
  },

  async getInventory(filters: { branchId?: string } = {}) {
    const tenantId = getTenantId()
    const conditions = [eq(products.tenantId, tenantId), eq(products.active, true)]
    if (filters.branchId) conditions.push(eq(branchInventory.branchId, filters.branchId))

    const results = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        currentStock: sql<number>`coalesce(sum(${branchInventory.quantity}), 0)`,
        minStock: products.minQuantity,
        unitCost: products.unitCost,
        totalValue: sql<string>`coalesce(sum(${branchInventory.quantity} * ${products.unitCost}), 0)::text`,
        currency: sql<string>`'MXN'`,
      })
      .from(products)
      .leftJoin(branchInventory, and(eq(branchInventory.productId, products.id), eq(branchInventory.tenantId, tenantId)))
      .where(and(...conditions))
      .groupBy(products.id, products.name, products.sku, products.minQuantity, products.unitCost)
      .orderBy(products.name)

    return results.map((r) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      currentStock: Number(r.currentStock),
      minStock: Number(r.minStock),
      unitCost: r.unitCost,
      totalValue: r.totalValue,
      currency: r.currency,
    }))
  },

  async getCash(filters: { from?: string; to?: string; branchId?: string } = {}) {
    const tenantId = getTenantId()
    const conditions = [eq(cashSessions.tenantId, tenantId), eq(cashSessions.isOpen, false)]
    if (filters.from) conditions.push(gte(cashSessions.closedAt!, new Date(filters.from)))
    if (filters.to) conditions.push(lte(cashSessions.closedAt!, new Date(filters.to)))
    if (filters.branchId) conditions.push(eq(cashRegisters.branchId, filters.branchId))

    const results = await db
      .select({
        date: sql<string>`to_char(${cashSessions.closedAt}, 'YYYY-MM-DD')`,
        sales: sql<string>`coalesce(sum(case when ${cashTransactions.type} = 'sale' then ${cashTransactions.amount} else 0 end), 0)`,
        expenses: sql<string>`coalesce(sum(case when ${cashTransactions.type} = 'expense' then ${cashTransactions.amount} else 0 end), 0)`,
        refunds: sql<string>`coalesce(sum(case when ${cashTransactions.type} = 'refund' then ${cashTransactions.amount} else 0 end), 0)`,
        net: sql<string>`coalesce(sum(case when ${cashTransactions.type} = 'sale' then ${cashTransactions.amount} when ${cashTransactions.type} = 'expense' then -${cashTransactions.amount} when ${cashTransactions.type} = 'refund' then -${cashTransactions.amount} else 0 end), 0)::text`,
        currency: sql<string>`'MXN'`,
      })
      .from(cashSessions)
      .innerJoin(cashRegisters, eq(cashSessions.cashRegisterId, cashRegisters.id))
      .leftJoin(cashTransactions, eq(cashTransactions.sessionId, cashSessions.id))
      .where(and(...conditions))
      .groupBy(sql`to_char(${cashSessions.closedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${cashSessions.closedAt}, 'YYYY-MM-DD')`)

    return results.map((r) => ({
      date: r.date,
      sales: r.sales,
      expenses: r.expenses,
      refunds: r.refunds,
      net: r.net,
      currency: r.currency,
    }))
  },
}
