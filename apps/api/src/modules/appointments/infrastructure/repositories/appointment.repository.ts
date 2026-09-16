import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { appointments, appointmentPayments, paymentMethodEnum } from '@/shared/db/schema/appointments'
import { eq, and, gte, lte, desc, isNull, asc } from 'drizzle-orm'
import type { CreateAppointmentInput } from '../../presentation/schemas/appointment.schema'

export const appointmentRepository = {
  async findById(id: string) {
    return db.query.appointments.findFirst({
      where: and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId())),
    })
  },

  async create(data: CreateAppointmentInput & {
    serviceNameSnapshot: string
    serviceDurationSnapshot: number
    priceSnapshot: string
    currencySnapshot: string
  }) {
    const startsAt = new Date(data.startsAt)
    const endsAt = new Date(startsAt.getTime() + data.serviceDurationSnapshot * 60000)

    const [appointment] = await db
      .insert(appointments)
      .values({
        ...data,
        tenantId: getTenantId(),
        startsAt,
        endsAt,
      })
      .returning()
    return appointment
  },

  async update(id: string, data: Partial<typeof appointments.$inferInsert>) {
    const [appointment] = await db
      .update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId())))
      .returning()
    return appointment
  },

  async list(filters: {
    branchId?: string
    staffId?: string
    customerId?: string
    status?: string
    from?: Date
    to?: Date
    cursor?: string
    limit?: number
  }) {
    const conditions = [eq(appointments.tenantId, getTenantId())]
    if (filters.branchId) conditions.push(eq(appointments.branchId, filters.branchId))
    if (filters.staffId) conditions.push(eq(appointments.staffId, filters.staffId))
    if (filters.customerId) conditions.push(eq(appointments.customerId, filters.customerId))
    if (filters.status) conditions.push(eq(appointments.status, filters.status as any))
    if (filters.from) conditions.push(gte(appointments.startsAt, filters.from))
    if (filters.to) conditions.push(lte(appointments.startsAt, filters.to))
    if (filters.cursor) conditions.push(eq(appointments.id, filters.cursor))

    return db.query.appointments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(appointments.startsAt)],
      limit: filters.limit || 50,
    })
  },

  async findConflicting(staffId: string, startsAt: Date, endsAt: Date, excludeId?: string) {
    const conditions = [
      eq(appointments.staffId, staffId),
      eq(appointments.tenantId, getTenantId()),
      lte(appointments.startsAt, endsAt),
      gte(appointments.endsAt, startsAt),
    ]

    if (excludeId) {
      conditions.push(eq(appointments.id, excludeId))
    }

    return db.query.appointments.findMany({
      where: and(...conditions),
    })
  },

  async updateStatus(id: string, status: string, reason?: string) {
    const updateData: any = { status, updatedAt: new Date() }
    if (reason) updateData.cancellationReason = reason

    const [appointment] = await db
      .update(appointments)
      .set(updateData)
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId())))
      .returning()
    return appointment
  },

  async getDailyAppointments(branchId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return db.query.appointments.findMany({
      where: and(
        eq(appointments.branchId, branchId),
        eq(appointments.tenantId, getTenantId()),
        gte(appointments.startsAt, startOfDay),
        lte(appointments.startsAt, endOfDay)
      ),
      orderBy: [appointments.startsAt],
    })
  },

  async createPayment(data: {
    appointmentId: string
    amount: string
    currency: string
    method: (typeof paymentMethodEnum.enumValues)[number]
    reference?: string
    recordedBy?: string
  }) {
    const [payment] = await db
      .insert(appointmentPayments)
      .values({
        ...data,
        tenantId: getTenantId(),
        status: 'recorded',
      })
      .returning()
    return payment
  },

  async getPaymentsForAppointment(appointmentId: string) {
    return db
      .select()
      .from(appointmentPayments)
      .where(
        and(
          eq(appointmentPayments.appointmentId, appointmentId),
          eq(appointmentPayments.tenantId, getTenantId())
        )
      )
      .orderBy(asc(appointmentPayments.createdAt))
  },
}
