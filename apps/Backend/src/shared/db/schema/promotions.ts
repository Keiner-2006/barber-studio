import { uuid, text, timestamp, pgTable, boolean, integer, numeric } from 'drizzle-orm/pg-core'

export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  discountType: text('discount_type').notNull(),
  discountValue: numeric('discount_value', { precision: 12, scale: 2 }).notNull(),
  minPurchaseAmount: numeric('min_purchase_amount', { precision: 12, scale: 2 }),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const promotionServices = pgTable('promotion_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  promotionId: uuid('promotion_id').notNull().references(() => promotions.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const promotionBranches = pgTable('promotion_branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  promotionId: uuid('promotion_id').notNull().references(() => promotions.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const promotionRedemptions = pgTable('promotion_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  promotionId: uuid('promotion_id').notNull().references(() => promotions.id),
  appointmentId: uuid('appointment_id').notNull(),
  customerId: uuid('customer_id').notNull(),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
