import { uuid, text, timestamp, pgTable, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'

export const consentTypeEnum = pgEnum('consent_type', [
  'marketing',
  'privacy',
  'communications',
])

export const customerConsents = pgTable('customer_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  type: consentTypeEnum('type').notNull(),
  granted: boolean('granted').notNull(),
  source: text('source'),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})
