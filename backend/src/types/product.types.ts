export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  warehouse_location: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductQueryFilters {
  search?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}
