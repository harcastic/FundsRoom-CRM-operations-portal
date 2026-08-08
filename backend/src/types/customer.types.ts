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
  follow_up_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerFollowUp {
  id: number;
  customer_id: number;
  note: string;
  follow_up_date: Date | null;
  created_by: number;
  created_at: Date;
  creator_name?: string;
}

export interface CustomerQueryFilters {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
}
