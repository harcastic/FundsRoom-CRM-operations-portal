export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  business_name: string;
  gst_number: string | null;
  customer_type: CustomerType;
  address: string;
  status: CustomerStatus;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFollowUp {
  id: number;
  customer_id: number;
  note: string;
  follow_up_date: string | null;
  created_by: number;
  created_at: string;
  creator_name?: string;
}

export interface CustomerQueryFilters {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
}

export interface CreateCustomerInput {
  name: string;
  mobile: string;
  email: string;
  business_name: string;
  gst_number?: string | null;
  customer_type: CustomerType;
  address: string;
  status?: CustomerStatus;
  follow_up_date?: string | null;
  notes?: string | null;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface CreateFollowUpInput {
  note: string;
  follow_up_date?: string | null;
}
