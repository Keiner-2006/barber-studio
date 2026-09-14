import { uuid, text, timestamp, pgEnum, pgTable, boolean, integer, numeric } from 'drizzle-orm/pg-core'

export const cashTransactionTypeEnum = pgEnum('cash_transaction_type', [
  'sale',
  'appointment',
  'expense',
  'refund',
  'adjustment',
])

export const cashPaymentMethodEnum = pgEnum('cash_payment_method', [
  'cash',
  'card_manual',
  'transfer_manual',
  'other',
])

export const cashRegisters = pgTable('cash_registers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'),
  initialBalance: numeric('initial_balance', { precision: 12, scale: 2 }).notNull().default('0'),
  openedBy: uuid('opened_by'),
  closedBy: uuid('closed_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cashSessions = pgTable('cash_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  cashRegisterId: uuid('cash_register_id').notNull().references(() => cashRegisters.id),
  userId: uuid('user_id').notNull(),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  initialBalance: numeric('initial_balance', { precision: 12, scale: 2 }).notNull(),
  expectedBalance: numeric('expected_balance', { precision: 12, scale: 2 }),
  countedBalance: numeric('counted_balance', { precision: 12, scale: 2 }),
  difference: numeric('difference', { precision: 12, scale: 2 }),
  currency: text('currency').notNull().default('MXN'),
  isOpen: boolean('is_open').notNull().default(true),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cashTransactions = pgTable('cash_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  sessionId: uuid('session_id').notNull().references(() => cashSessions.id),
  type: cashTransactionTypeEnum('type').notNull(),
  method: cashPaymentMethodEnum('method').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),
  reference: text('reference'),
  notes: text('notes'),
  actorId: uuid('actor_id').notNull(),
  reconciled: boolean('reconciled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
