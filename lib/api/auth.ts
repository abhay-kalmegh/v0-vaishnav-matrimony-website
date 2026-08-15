import apiClient from '../api';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: string;
    mobile_number: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    is_verified: boolean;
    role: string;
  };
  is_new_user: boolean;
}

export interface RegisterRequest {
  mobile_number: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  role: string;
}

const authAPI = {
  sendOtp: async (data: SendOtpRequest) => {
    const response = await apiClient.post('/auth/send-otp/', {
      mobile_number: data.phone
    });
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp/', {
      mobile_number: data.phone,
      otp_code: data.otp
    });
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
    // Backend doesn't have a specific logout endpoint in urls.py yet,
    // but typically it's just client-side token removal or blacklisting.
    // If you add blacklisting later, this will be ready.
    try {
      await apiClient.post('/auth/logout/');
    } catch (e) {
      // Ignore if endpoint doesn't exist
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },
};

export default authAPI;
