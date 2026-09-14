import { z } from 'zod'

export const createBranchSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  operatingHours: z.record(z.any()).optional(),
})

export const updateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  operatingHours: z.record(z.any()).optional(),
})

export type CreateBranchInput = z.infer<typeof createBranchSchema>
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>
