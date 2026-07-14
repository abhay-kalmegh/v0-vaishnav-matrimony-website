import apiClient from '../api';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    phone: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    is_verified: boolean;
    profile_completed: boolean;
  };
}

export interface RegisterRequest {
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  sampraday: number;
}

const authAPI = {
  sendOtp: async (data: SendOtpRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/send-otp/', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp/', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout/');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },
};

export default authAPI;
