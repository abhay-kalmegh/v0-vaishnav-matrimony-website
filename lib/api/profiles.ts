import apiClient from '../api';

export interface Profile {
  id: number;
  user: number;
  bio: string;
  age: number;
  height: string;
  caste: string;
  city: string;
  state: string;
  occupation: string;
  income_range: string;
  photos: any[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  bio?: string;
  height?: string;
  caste?: string;
  city?: string;
  state?: string;
  occupation?: string;
  income_range?: string;
}

const profilesAPI = {
  getMyProfile: async () => {
    const response = await apiClient.get<Profile>('/profiles/me/');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdate) => {
    const response = await apiClient.patch<Profile>('/profiles/me/', data);
    return response.data;
  },

  getProfile: async (id: number) => {
    const response = await apiClient.get<Profile>(`/profiles/${id}/`);
    return response.data;
  },

  searchProfiles: async (filters: {
    age_min?: number;
    age_max?: number;
    gender?: string;
    sampraday?: number;
    city?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get<{ count: number; results: Profile[] }>('/profiles/search/', {
      params: filters,
    });
    return response.data;
  },

  uploadPhoto: async (profileId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/profiles/${profileId}/upload-photo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePhoto: async (photoId: number) => {
    await apiClient.delete(`/profiles/photos/${photoId}/`);
  },

  completeProfileSetup: async (step: string, data: any) => {
    const response = await apiClient.post('/profiles/complete-setup/', {
      step,
      data,
    });
    return response.data;
  },
};

export default profilesAPI;
