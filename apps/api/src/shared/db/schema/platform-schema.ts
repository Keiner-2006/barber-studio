import { uuid, text, timestamp, pgEnum, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'

export const tenantStatusEnum = pgEnum('tenant_status', [
  'provisioning',
  'active',
  'suspended',
  'deleting',
  'deleted',
])

export const platformTenants = pgTable('platform_tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalName: text('legal_name').notNull(),
  tradeName: text('trade_name').notNull(),
  slug: text('slug').notNull().unique(),
  status: tenantStatusEnum('status').notNull().default('provisioning'),
  countryCode: text('country_code').notNull(),
  timezone: text('timezone').notNull(),
  currencyCode: text('currency_code').notNull(),
  locale: text('locale').notNull().default('es'),
  databaseHost: text('database_host'),
  databaseName: text('database_name'),
  databaseSecretRef: text('database_secret_ref'),
  schemaVersion: text('schema_version'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const platformUserStatusEnum = pgEnum('platform_user_status', [
  'invited',
  'active',
  'blocked',
])

export const platformUsers = pgTable('platform_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  status: platformUserStatusEnum('status').notNull().default('active'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const platformMembershipRoleEnum = pgEnum('platform_membership_role', [
  'owner',
  'platform_support',
])

export const platformMemberships = pgTable('platform_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => platformTenants.id),
  userId: uuid('user_id').notNull().references(() => platformUsers.id),
  role: platformMembershipRoleEnum('role').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('platform_memberships_tenant_user_unique').on(table.tenantId, table.userId),
])

export const provisioningJobStatusEnum = pgEnum('provisioning_job_status', [
  'queued',
  'running',
  'succeeded',
  'failed',
  'compensated',
])

export const tenantProvisioningJobs = pgTable('tenant_provisioning_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => platformTenants.id),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  status: provisioningJobStatusEnum('status').notNull().default('queued'),
  step: text('step'),
  errorCode: text('error_code'),
  errorDetail: text('error_detail'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const platformSessions = pgTable('platform_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => platformUsers.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

export const platformAuditEvents = pgTable('platform_audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => platformUsers.id),
  tenantId: uuid('tenant_id').references(() => platformTenants.id),
  action: text('action').notNull(),
  resource: text('resource'),
  resourceId: text('resource_id'),
  result: text('result'),
  metadata: text('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
