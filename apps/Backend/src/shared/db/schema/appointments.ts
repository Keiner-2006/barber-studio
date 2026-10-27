import { uuid, text, timestamp, pgEnum, pgTable, integer, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'checked_in',
  'in_service',
  'completed',
  'cancelled',
  'no_show',
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'card_manual',
  'transfer_manual',
  'other',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'recorded',
  'refunded',
  'voided',
])

export const appointments = pgTable(
  'appointments',
  {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  customerId: uuid('customer_id').notNull(),
  staffId: uuid('staff_id').notNull(),
  serviceId: uuid('service_id').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  serviceNameSnapshot: text('service_name_snapshot').notNull(),
  serviceDurationSnapshot: integer('service_duration_snapshot').notNull(),
  priceSnapshot: numeric('price_snapshot', { precision: 12, scale: 2 }).notNull(),
  currencySnapshot: text('currency_snapshot').notNull(),
  status: appointmentStatusEnum('status').notNull().default('pending'),
  source: text('source'),
  notes: text('notes'),
  cancellationReason: text('cancellation_reason'),
  idempotencyKey: text('idempotency_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('appointments_tenant_idempotency_unique').on(table.tenantId, table.idempotencyKey),
    index('appointments_tenant_staff_starts_idx').on(table.tenantId, table.staffId, table.startsAt),
    index('appointments_tenant_branch_starts_idx').on(table.tenantId, table.branchId, table.startsAt),
    index('appointments_customer_idx').on(table.customerId),
  ]
)

export const appointmentPayments = pgTable('appointment_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull(),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  reference: text('reference'),
  recordedBy: uuid('recorded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
