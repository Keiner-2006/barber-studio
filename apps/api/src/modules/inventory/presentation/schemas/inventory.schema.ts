import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().default('pieza'),
  unitCost: z.string(),
  suggestedPrice: z.string().optional(),
  minQuantity: z.number().int().min(0).default(0),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  unitCost: z.string().optional(),
  suggestedPrice: z.string().optional(),
  minQuantity: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  branchId: z.string().uuid(),
  type: z.enum(['purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'consumption', 'return']),
  quantity: z.string(),
  unitCost: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export const inventoryTransferSchema = z.object({
  productId: z.string().uuid(),
  fromBranchId: z.string().uuid(),
  toBranchId: z.string().uuid(),
  quantity: z.string(),
  notes: z.string().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>
export type InventoryTransferInput = z.infer<typeof inventoryTransferSchema>
