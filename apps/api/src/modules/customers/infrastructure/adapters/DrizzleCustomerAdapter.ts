import { ICustomerRepository, CreateCustomerData, UpdateCustomerData, SearchCustomerFilters } from '../../application/ports/ICustomerRepository'
import { Customer } from '../../domain/entities/Customer'
import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { customers } from '@/shared/db/schema/customers'
import { eq, and, like, or, isNull, desc } from 'drizzle-orm'

export class DrizzleCustomerAdapter implements ICustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const row = await db.query.customers.findFirst({
      where: and(eq(customers.id, id), eq(customers.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toDomain(row)
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    const [row] = await db
      .insert(customers)
      .values({
        ...data,
        tenantId: getTenantId(),
        email: data.email ?? null,
        phone: data.phone ?? null,
        document: data.document ?? null,
        notes: data.notes ?? null,
      })
      .returning()

    return this.toDomain(row)
  }

  async update(id: string, data: UpdateCustomerData): Promise<Customer | null> {
    const updateData: any = { updatedAt: new Date() }
    if (data.firstName !== undefined) updateData.firstName = data.firstName
    if (data.lastName !== undefined) updateData.lastName = data.lastName
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.document !== undefined) updateData.document = data.document
    if (data.notes !== undefined) updateData.notes = data.notes

    const [row] = await db
      .update(customers)
      .set(updateData)
      .where(and(eq(customers.id, id), eq(customers.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toDomain(row)
  }

  async delete(id: string): Promise<Customer | null> {
    const [row] = await db
      .update(customers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toDomain(row)
  }

  async search(filters: SearchCustomerFilters): Promise<Customer[]> {
    const conditions = [isNull(customers.deletedAt), eq(customers.tenantId, getTenantId())]
    if (filters.query) {
      conditions.push(
        or(
          like(customers.firstName, `%${filters.query}%`),
          like(customers.lastName, `%${filters.query}%`),
          like(customers.email, `%${filters.query}%`),
          like(customers.phone, `%${filters.query}%`)
        )!
      )
    }
    if (filters.cursor) {
      conditions.push(eq(customers.id, filters.cursor))
    }

    const rows = await db.query.customers.findMany({
      where: and(...conditions),
      orderBy: [desc(customers.createdAt)],
      limit: filters.limit || 50,
    })

    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: any): Customer {
    return Customer.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email ?? null,
      phone: row.phone ?? null,
      document: row.document ?? null,
      notes: row.notes ?? null,
      preferences: row.preferences ?? null,
      consents: row.consents ?? null,
      totalVisits: row.totalVisits,
      totalSpent: row.totalSpent,
      currency: row.currency,
      lastVisitAt: row.lastVisitAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    })
  }
}