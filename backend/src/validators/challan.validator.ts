import { z } from 'zod';

export const challanItemSchema = z.object({
  productId: z.number().int().positive('productId must be a positive integer'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
});

export const createChallanSchema = z.object({
  customerId: z.number().int().positive('customerId must be a positive integer'),
  items: z
    .array(challanItemSchema)
    .min(1, 'Challan must contain at least one product item'),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
