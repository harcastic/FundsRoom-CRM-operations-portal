import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Invalid email address format'),
  business_name: z.string().min(1, 'Business name is required'),
  gst_number: z.string().optional().nullable(),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'], {
    required_error: 'Customer type is required',
  }),
  address: z.string().min(1, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  follow_up_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z.string().min(1, 'Follow-up note is required'),
  follow_up_date: z.string().optional().nullable(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
