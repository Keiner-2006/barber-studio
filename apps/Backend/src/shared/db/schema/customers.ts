import { uuid, text, timestamp, pgTable, jsonb, index, boolean } from 'drizzle-orm/pg-core'

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  document: text('document'),
  birthDate: timestamp('birth_date', { withTimezone: true }),
  notes: text('notes'),
  preferences: jsonb('preferences'),
  consents: jsonb('consents'),
  marketingConsent: boolean('marketing_consent').notNull().default(false),
  totalVisits: text('total_visits').notNull().default('0'),
  totalSpent: text('total_spent').notNull().default('0'),
  currency: text('currency').notNull().default('COP'),
  lastVisitAt: timestamp('last_visit_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('customers_tenant_created_idx').on(table.tenantId, table.createdAt),
  index('customers_tenant_phone_idx').on(table.tenantId, table.phone),
  index('customers_tenant_email_idx').on(table.tenantId, table.email),
])
