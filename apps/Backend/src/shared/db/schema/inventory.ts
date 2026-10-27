import { uuid, text, timestamp, pgEnum, pgTable, boolean, integer, numeric, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', [
  'purchase',
  'sale',
  'adjustment',
  'transfer_in',
  'transfer_out',
  'consumption',
  'return',
])

export const products = pgTable(
  'products',
  {
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
  },
  (table) => [
    // SKU is unique per tenant, not globally (tenants may share a database).
    uniqueIndex('products_tenant_sku_unique').on(table.tenantId, table.sku),
    index('products_tenant_active_idx').on(table.tenantId, table.active),
  ]
)

export const branchInventory = pgTable(
  'branch_inventory',
  {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull().default('0'),
  reserved: numeric('reserved', { precision: 12, scale: 3 }).notNull().default('0'),
  averageCost: numeric('average_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('branch_inventory_branch_product_unique').on(table.branchId, table.productId),
  ]
)

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
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
  },
  (table) => [
    index('inventory_movements_tenant_created_idx').on(table.tenantId, table.createdAt),
    index('inventory_movements_product_idx').on(table.productId),
    index('inventory_movements_branch_idx').on(table.branchId),
  ]
)
