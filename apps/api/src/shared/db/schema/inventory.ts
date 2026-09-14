import { uuid, text, timestamp, pgEnum, pgTable, boolean, integer, numeric } from 'drizzle-orm/pg-core'

export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', [
  'purchase',
  'sale',
  'adjustment',
  'transfer_in',
  'transfer_out',
  'consumption',
  'return',
])

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  description: text('description'),
  category: text('category'),
  unit: text('unit').default('pieza'),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull(),
  suggestedPrice: numeric('suggested_price', { precision: 12, scale: 2 }),
  minQuantity: integer('min_quantity').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const branchInventory = pgTable('branch_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull().default('0'),
  reserved: numeric('reserved', { precision: 12, scale: 3 }).notNull().default('0'),
  averageCost: numeric('average_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  productId: uuid('product_id').notNull().references(() => products.id),
  branchId: uuid('branch_id').notNull(),
  type: inventoryMovementTypeEnum('type').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }),
  reference: text('reference'),
  actorId: uuid('actor_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
