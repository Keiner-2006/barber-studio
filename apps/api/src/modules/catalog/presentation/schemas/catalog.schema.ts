import { z } from 'zod'

export const createServiceCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
})

export const updateServiceCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
})

export const createServiceSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  priceBase: z.string(),
  currency: z.string().default('MXN'),
  paymentPolicy: z.enum(['none', 'deposit', 'full']).default('none'),
  depositType: z.enum(['fixed', 'percentage']).optional(),
  depositValue: z.string().optional(),
  cancellationMinutes: z.number().int().optional(),
})

export const updateServiceSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  priceBase: z.string().optional(),
  paymentPolicy: z.enum(['none', 'deposit', 'full']).optional(),
  depositType: z.enum(['fixed', 'percentage']).optional(),
  depositValue: z.string().optional(),
  cancellationMinutes: z.number().int().optional(),
  active: z.boolean().optional(),
})

export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
