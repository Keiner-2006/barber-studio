import { z } from 'zod'

export const openCashSessionSchema = z.object({
  cashRegisterId: z.string().uuid(),
  initialBalance: z.string(),
})

export const closeCashSessionSchema = z.object({
  countedBalance: z.string(),
})

export const cashTransactionSchema = z.object({
  type: z.enum(['sale', 'appointment', 'expense', 'refund', 'adjustment']),
  method: z.enum(['cash', 'card_manual', 'transfer_manual', 'other']),
  amount: z.string(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export type OpenCashSessionInput = z.infer<typeof openCashSessionSchema>
export type CloseCashSessionInput = z.infer<typeof closeCashSessionSchema>
export type CashTransactionInput = z.infer<typeof cashTransactionSchema>
