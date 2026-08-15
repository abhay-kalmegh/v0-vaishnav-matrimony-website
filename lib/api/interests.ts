import apiClient from '../api';

export interface Interest {
  id: string;
  sender: any;
  receiver: any;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
  responded_at?: string;
}

export interface Shortlist {
  id: string;
  shortlisted_profile: any;
  created_at: string;
}

const interestsAPI = {
  sendInterest: async (receiverProfileId: string, message: string = "") => {
    const response = await apiClient.post('/interests/send/', {
      receiver_id: receiverProfileId,
      message: message
    });
    return response.data;
  },

  respondToInterest: async (interestId: string, action: 'accepted' | 'rejected') => {
    const response = await apiClient.post(`/interests/respond/`, {
      interest_id: interestId,
      action: action
    });
    return response.data;
  },

  getReceivedInterests: async () => {
    const response = await apiClient.get<Interest[]>('/interests/received/');
    return response.data;
  },

  getSentInterests: async () => {
    const response = await apiClient.get<Interest[]>('/interests/sent/');
    return response.data;
  },

  addToShortlist: async (profileId: string) => {
    const response = await apiClient.post('/interests/shortlist/', { shortlisted_profile_id: profileId });
    return response.data;
  },

  removeFromShortlist: async (shortlistId: string) => {
    await apiClient.delete(`/interests/shortlist/${shortlistId}/`);
  },

  getShortlist: async () => {
    const response = await apiClient.get<Shortlist[]>('/interests/shortlist/');
    return response.data;
  },
};

export default interestsAPI;
