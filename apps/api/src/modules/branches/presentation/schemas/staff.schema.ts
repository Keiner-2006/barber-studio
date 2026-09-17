import { z } from 'zod'

export const createStaffSchema = z.object({
  displayName: z.string().min(1),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  commissionRate: z.string().optional(),
  isBookable: z.boolean().optional(),
  email: z.string().email().optional(),
})

export const updateStaffSchema = z.object({
  displayName: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  commissionRate: z.string().optional(),
  isBookable: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  email: z.string().email().optional(),
})

export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>
