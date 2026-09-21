import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { customers } from '@/shared/db/schema/customers'
import { eq, like, or, and, isNull, desc } from 'drizzle-orm'
import type { CreateCustomerInput } from '../../presentation/schemas/customer.schema'

function parseDate(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value
  return new Date(value)
}

export const customerRepository = {
  async findById(id: string) {
    return db.query.customers.findFirst({
      where: and(eq(customers.id, id), eq(customers.tenantId, getTenantId())),
    })
  },

  async create(data: CreateCustomerInput) {
    const [customer] = await db
      .insert(customers)
      .values({
        ...data,
        tenantId: getTenantId(),
        fullName: data.fullName,
        birthDate: parseDate(data.birthDate),
      })
      .returning()
    return customer
  },

  async update(id: string, data: Partial<CreateCustomerInput>) {
    const updateData: any = { ...data, updatedAt: new Date() }
    if (updateData.birthDate !== undefined && !(updateData.birthDate instanceof Date)) {
      updateData.birthDate = parseDate(updateData.birthDate as string)
    }
    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(and(eq(customers.id, id), eq(customers.tenantId, getTenantId())))
      .returning()
    return customer
  },

  async delete(id: string) {
    const [customer] = await db
      .update(customers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.tenantId, getTenantId())))
      .returning()
    return customer
  },

  async search(query?: string, cursor?: string, limit = 50) {
    const conditions = [isNull(customers.deletedAt), eq(customers.tenantId, getTenantId())]
    if (query) {
      conditions.push(
        or(
          like(customers.firstName, `%${query}%`),
          like(customers.lastName, `%${query}%`),
          like(customers.fullName, `%${query}%`),
          like(customers.email, `%${query}%`),
          like(customers.phone, `%${query}%`)
        )!
      )
    }
    if (cursor) {
      conditions.push(eq(customers.id, cursor))
    }

    return db.query.customers.findMany({
      where: and(...conditions),
      orderBy: [desc(customers.createdAt)],
      limit,
    })
  },
}
