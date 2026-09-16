import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
})

export const purchaseOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitCost: z.string(),
})

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  branchId: z.string().uuid(),
  expectedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
})

export const receivePurchaseOrderSchema = z.object({
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitCost: z.string(),
      })
    )
    .min(1),
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>
export type ReceivePurchaseOrderInput = z.infer<typeof receivePurchaseOrderSchema>
