import { api, type ApiSuccessResponse } from './api';
import type {
  Customer,
  CustomerFollowUp,
  CustomerQueryFilters,
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateFollowUpInput,
} from '../types/customer.types';

export const customerService = {
  async getCustomers(filters: CustomerQueryFilters = {}) {
    const response = await api.get<ApiSuccessResponse<Customer[]>>('/customers', {
      params: filters,
    });
    return response.data;
  },

  async getCustomerById(id: number): Promise<Customer> {
    const response = await api.get<ApiSuccessResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    const response = await api.post<ApiSuccessResponse<Customer>>('/customers', data);
    return response.data.data;
  },

  async updateCustomer(id: number, data: UpdateCustomerInput): Promise<Customer> {
    const response = await api.put<ApiSuccessResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data;
  },

  async getFollowUps(customerId: number): Promise<CustomerFollowUp[]> {
    const response = await api.get<ApiSuccessResponse<CustomerFollowUp[]>>(
      `/customers/${customerId}/followups`
    );
    return response.data.data;
  },

  async createFollowUp(
    customerId: number,
    data: CreateFollowUpInput
  ): Promise<CustomerFollowUp> {
    const response = await api.post<ApiSuccessResponse<CustomerFollowUp>>(
      `/customers/${customerId}/followups`,
      data
    );
    return response.data.data;
  },
};
