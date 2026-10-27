import apiClient, { getStorageValue } from '../api';

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
    profile_completed?: boolean;
    is_profile_complete?: boolean;
  };
  is_new_user: boolean;
}

/** Account details saved right after the phone is verified (POST /auth/register/ needs a signed-in session). */
export interface RegisterRequest {
  first_name: string;
  last_name?: string;
  gender: string;
  role?: string;
  email?: string;
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
    const response = await apiClient.post<{ message: string; user: AuthResponse['user'] }>('/auth/register/', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  logout: async () => {
    // Server blacklists the refresh token; failure must never block a local logout.
    try {
      const refresh = await getStorageValue('refresh_token');
      await apiClient.post('/auth/logout/', { refresh });
    } catch (e) {
      // ignore - the caller clears local tokens regardless
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },
};

export default authAPI;
