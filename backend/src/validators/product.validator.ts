import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unit_price: z.number().min(0, 'Unit price must be a non-negative number'),
  current_stock: z.number().int().min(0, 'Current stock must be a non-negative integer').default(0),
  minimum_stock: z.number().int().min(0, 'Minimum stock must be a non-negative integer').default(0),
  warehouse_location: z.string().min(1, 'Warehouse location is required'),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
