export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: number;
  challan_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  status: ChallanStatus;
  total_quantity: number;
  created_by: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  items?: ChallanItem[];
}

export interface ChallanQueryFilters {
  status?: ChallanStatus;
  customerId?: number;
  page?: number;
  limit?: number;
}

export interface CreateChallanInput {
  customerId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
}
