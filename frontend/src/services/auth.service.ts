import { api, type ApiSuccessResponse } from './api';
import type { LoginCredentials, LoginResult, User } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await api.post<ApiSuccessResponse<LoginResult>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiSuccessResponse<{ user: User }>>(
      '/auth/me'
    );
    return response.data.data.user;
  },
};
