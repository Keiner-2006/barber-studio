import { z } from 'zod'

export const createAppointmentSchema = z.object({
  branchId: z.string().uuid(),
  customerId: z.string().uuid(),
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  notes: z.string().optional(),
  idempotencyKey: z.string().min(1),
})

export const updateAppointmentSchema = z.object({
  startsAt: z.string().datetime().optional(),
  notes: z.string().optional(),
})

export const appointmentQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const availabilityQuerySchema = z.object({
  branchId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  from: z.string().datetime(),
  to: z.string().datetime(),
})

export const appointmentActionSchema = z.object({
  reason: z.string().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>
