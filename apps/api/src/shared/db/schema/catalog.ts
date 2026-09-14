import { uuid, text, timestamp, pgEnum, pgTable, boolean, integer, numeric } from 'drizzle-orm/pg-core'
import { branches } from './branches'

export const paymentPolicyEnum = pgEnum('payment_policy', [
  'none',
  'deposit',
  'full',
])

export const depositTypeEnum = pgEnum('deposit_type', [
  'fixed',
  'percentage',
])

export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  categoryId: uuid('category_id').notNull().references(() => serviceCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceBase: numeric('price_base', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),
  paymentPolicy: paymentPolicyEnum('payment_policy').notNull().default('none'),
  depositType: depositTypeEnum('deposit_type'),
  depositValue: numeric('deposit_value', { precision: 12, scale: 2 }),
  cancellationMinutes: integer('cancellation_minutes'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const branchServices = pgTable('branch_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  priceOverride: numeric('price_override', { precision: 12, scale: 2 }),
  durationOverride: integer('duration_override'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
