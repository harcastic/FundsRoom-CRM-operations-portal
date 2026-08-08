import { z } from 'zod';

export const adjustStockSchema = z.object({
  movementType: z.enum(['IN', 'OUT'], {
    required_error: 'movementType is required and must be either IN or OUT',
  }),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  reason: z.string().min(1, 'Reason for stock adjustment is required'),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
