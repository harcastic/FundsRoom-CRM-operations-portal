import { api, type ApiSuccessResponse } from './api';
import type {
  Product,
  ProductQueryFilters,
  CreateProductInput,
  UpdateProductInput,
} from '../types/product.types';

export const productService = {
  async getProducts(filters: ProductQueryFilters = {}) {
    const response = await api.get<ApiSuccessResponse<Product[]>>('/products', {
      params: filters,
    });
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await api.get<ApiSuccessResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: CreateProductInput): Promise<Product> {
    const response = await api.post<ApiSuccessResponse<Product>>('/products', data);
    return response.data.data;
  },

  async updateProduct(id: number, data: UpdateProductInput): Promise<Product> {
    const response = await api.put<ApiSuccessResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },
};
