import apiClient from '../api';

export interface Interest {
  id: number;
  from_user: number;
  to_user: number;
  to_profile_data: {
    user: { first_name: string; last_name: string };
    age: number;
    city: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Shortlist {
  id: number;
  profile: number;
  profile_data: any;
  created_at: string;
}

const interestsAPI = {
  sendInterest: async (toUserId: number) => {
    const response = await apiClient.post('/interests/send/', {
      to_user: toUserId,
    });
    return response.data;
  },

  respondToInterest: async (interestId: number, status: 'accepted' | 'rejected') => {
    const response = await apiClient.post(`/interests/${interestId}/respond/`, { status });
    return response.data;
  },

  getReceivedInterests: async (status?: string) => {
    const response = await apiClient.get<Interest[]>('/interests/received/', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  getSentInterests: async (status?: string) => {
    const response = await apiClient.get<Interest[]>('/interests/sent/', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  addToShortlist: async (profileId: number) => {
    const response = await apiClient.post('/shortlist/add/', { profile: profileId });
    return response.data;
  },

  removeFromShortlist: async (shortlistId: number) => {
    const response = await apiClient.delete(`/shortlist/${shortlistId}/`);
  },

  getShortlist: async () => {
    const response = await apiClient.get<Shortlist[]>('/shortlist/');
    return response.data;
  },
};

export default interestsAPI;
