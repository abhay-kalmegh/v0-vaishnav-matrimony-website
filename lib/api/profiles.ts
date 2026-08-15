import apiClient from '../api';

export interface Profile {
  id: string;
  user: any;
  about_me: string;
  age: number;
  height_cm: number;
  marital_status: string;
  current_city: string;
  state: string;
  photos: any[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  education?: any;
  career?: any;
  family?: any;
  lifestyle?: any;
}

export interface ProfileUpdate {
  about_me?: string;
  height_cm?: number;
  marital_status?: string;
  current_city?: string;
  state?: string;
  country?: string;
}

const profilesAPI = {
  getMyProfile: async () => {
    const response = await apiClient.get<Profile>('/profile/me/');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdate) => {
    const response = await apiClient.patch<Profile>('/profile/me/', data);
    return response.data;
  },

  getProfile: async (id: string) => {
    const response = await apiClient.get<Profile>(`/profile/${id}/`);
    return response.data;
  },

  searchProfiles: async (filters: {
    min_age?: number;
    max_age?: number;
    gender?: string;
    sampraday?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get<{ count: number; results: Profile[] }>('/profile/search/', {
      params: filters,
    });
    return response.data;
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiClient.post(`/profile/photos/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePhoto: async (photoId: string) => {
    await apiClient.delete(`/profile/photos/`, { data: { photo_id: photoId } });
  },

  completeProfileSetup: async (data: any) => {
    const response = await apiClient.patch('/profile/me/', data);
    return response.data;
  },
};

export default profilesAPI;
