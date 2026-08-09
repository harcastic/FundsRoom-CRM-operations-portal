import { api, type ApiSuccessResponse } from './api';
import type { StockMovement, AdjustStockInput } from '../types/inventory.types';

export const inventoryService = {
  async adjustStock(productId: number, data: AdjustStockInput): Promise<StockMovement> {
    const response = await api.post<ApiSuccessResponse<StockMovement>>(
      `/inventory/${productId}/adjust`,
      data
    );
    return response.data.data;
  },

  async getStockMovements(productId: number): Promise<StockMovement[]> {
    const response = await api.get<ApiSuccessResponse<StockMovement[]>>(
      `/inventory/${productId}/movements`
    );
    return response.data.data;
  },
};
