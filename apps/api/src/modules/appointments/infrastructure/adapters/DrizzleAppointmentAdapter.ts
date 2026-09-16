import { IAppointmentRepository, CreateAppointmentData, AppointmentFilters } from '../../application/ports/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'
import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { appointments, appointmentPayments, paymentMethodEnum } from '@/shared/db/schema/appointments'
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm'

export class DrizzleAppointmentAdapter implements IAppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const row = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId())),
    })
    if (!row) return null
    return this.toDomain(row)
  }

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const startsAt = new Date(data.startsAt)
    const endsAt = new Date(startsAt.getTime() + data.serviceDurationSnapshot * 60000)

    const [row] = await db
      .insert(appointments)
      .values({
        ...data,
        tenantId: getTenantId(),
        startsAt,
        endsAt,
      })
      .returning()

    return this.toDomain(row)
  }

  async update(id: string, data: Partial<{ startsAt?: Date; notes?: string | null }>): Promise<Appointment | null> {
    const updateData: any = { updatedAt: new Date() }
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt
    if (data.notes !== undefined) updateData.notes = data.notes

    const [row] = await db
      .update(appointments)
      .set(updateData)
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toDomain(row)
  }

  async list(filters: AppointmentFilters): Promise<Appointment[]> {
    const conditions = [eq(appointments.tenantId, getTenantId())]
    if (filters.branchId) conditions.push(eq(appointments.branchId, filters.branchId))
    if (filters.staffId) conditions.push(eq(appointments.staffId, filters.staffId))
    if (filters.customerId) conditions.push(eq(appointments.customerId, filters.customerId))
    if (filters.status) conditions.push(eq(appointments.status, filters.status as any))
    if (filters.from) conditions.push(gte(appointments.startsAt, filters.from))
    if (filters.to) conditions.push(lte(appointments.startsAt, filters.to))
    if (filters.cursor) conditions.push(eq(appointments.id, filters.cursor))

    const rows = await db.query.appointments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(appointments.startsAt)],
      limit: filters.limit || 50,
    })

    return rows.map((row) => this.toDomain(row))
  }

  async findConflicting(staffId: string, startsAt: Date, endsAt: Date, excludeId?: string): Promise<Appointment[]> {
    const conditions = [
      eq(appointments.staffId, staffId),
      eq(appointments.tenantId, getTenantId()),
      lte(appointments.startsAt, endsAt),
      gte(appointments.endsAt, startsAt),
    ]

    if (excludeId) {
      conditions.push(eq(appointments.id, excludeId))
    }

    const rows = await db.query.appointments.findMany({
      where: and(...conditions),
    })

    return rows.map((row) => this.toDomain(row))
  }

  async updateStatus(id: string, status: string, reason?: string): Promise<Appointment | null> {
    const updateData: any = { status, updatedAt: new Date() }
    if (reason) updateData.cancellationReason = reason

    const [row] = await db
      .update(appointments)
      .set(updateData)
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId())))
      .returning()

    if (!row) return null
    return this.toDomain(row)
  }

  async getDailyAppointments(branchId: string, date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const rows = await db.query.appointments.findMany({
      where: and(
        eq(appointments.branchId, branchId),
        eq(appointments.tenantId, getTenantId()),
        gte(appointments.startsAt, startOfDay),
        lte(appointments.startsAt, endOfDay)
      ),
      orderBy: [appointments.startsAt],
    })

    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: any): Appointment {
    return Appointment.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      branchId: row.branchId,
      customerId: row.customerId,
      staffId: row.staffId,
      serviceId: row.serviceId,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      serviceNameSnapshot: row.serviceNameSnapshot,
      serviceDurationSnapshot: row.serviceDurationSnapshot,
      priceSnapshot: row.priceSnapshot,
      currencySnapshot: row.currencySnapshot,
      status: row.status,
      source: row.source ?? null,
      notes: row.notes ?? null,
      cancellationReason: row.cancellationReason ?? null,
      idempotencyKey: row.idempotencyKey ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}