import { api, type ApiSuccessResponse } from './api';
import type {
  Challan,
  ChallanQueryFilters,
  CreateChallanInput,
} from '../types/challan.types';

export const challanService = {
  async getChallans(filters: ChallanQueryFilters = {}) {
    const response = await api.get<ApiSuccessResponse<Challan[]>>('/challans', {
      params: filters,
    });
    return response.data;
  },

  async getChallanById(id: number): Promise<Challan> {
    const response = await api.get<ApiSuccessResponse<Challan>>(`/challans/${id}`);
    return response.data.data;
  },

  async createChallan(data: CreateChallanInput): Promise<Challan> {
    const response = await api.post<ApiSuccessResponse<Challan>>('/challans', data);
    return response.data.data;
  },

  async confirmChallan(id: number): Promise<Challan> {
    const response = await api.post<ApiSuccessResponse<Challan>>(
      `/challans/${id}/confirm`
    );
    return response.data.data;
  },

  async cancelChallan(id: number): Promise<Challan> {
    const response = await api.post<ApiSuccessResponse<Challan>>(
      `/challans/${id}/cancel`
    );
    return response.data.data;
  },
};
