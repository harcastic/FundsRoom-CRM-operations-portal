export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  warehouse_location: string;
  created_at: string;
  updated_at: string;
}

export interface ProductQueryFilters {
  search?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock?: number;
  minimum_stock?: number;
  warehouse_location: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;
