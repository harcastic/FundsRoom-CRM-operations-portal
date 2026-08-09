import { api, type ApiSuccessResponse } from './api';

export interface DashboardStats {
  customers: number;
  products: number;
  lowStockProducts: number;
  draftChallans: number;
  confirmedChallans: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<ApiSuccessResponse<DashboardStats>>(
      '/dashboard/stats'
    );
    return response.data.data;
  },
};
