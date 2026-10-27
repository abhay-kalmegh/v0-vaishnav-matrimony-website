import apiClient, { unwrapList } from '../api';
import { adaptProfile } from './profiles';

export interface Interest {
  id: string;
  sender: any;
  receiver: any;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
  responded_at?: string;
  // UI aliases
  from_profile_data?: any;
  /** The *other* person: the receiver for sent interests, the sender for received ones. */
  to_profile_data?: any;
  [key: string]: any;
}

export interface Shortlist {
  id: string;
  shortlisted_profile: any;
  created_at: string;
}

const adaptInterest = (i: any, direction: 'sent' | 'received'): Interest => ({
  ...i,
  created_at: i.sent_at,
  from_profile_data: adaptProfile(i.sender_profile),
  to_profile_data: adaptProfile(direction === 'sent' ? i.receiver_profile : i.sender_profile),
});

const interestsAPI = {
  sendInterest: async (receiverProfileId: string, message: string = '') => {
    const response = await apiClient.post('/interests/send/', {
      receiver_id: receiverProfileId,
      message,
    });
    return response.data;
  },

  respondToInterest: async (interestId: string, action: 'accepted' | 'rejected') => {
    const response = await apiClient.post(`/interests/respond/`, {
      interest_id: interestId,
      action,
    });
    return response.data;
  },

  getReceivedInterests: async (status?: Interest['status']) => {
    const response = await apiClient.get('/interests/received/');
    const list = unwrapList(response.data).map((i) => adaptInterest(i, 'received'));
    return status ? list.filter((i) => i.status === status) : list;
  },

  getSentInterests: async () => {
    const response = await apiClient.get('/interests/sent/');
    return unwrapList(response.data).map((i) => adaptInterest(i, 'sent'));
  },

  addToShortlist: async (profileId: string) => {
    // serializer field is `shortlisted_profile` (a profile id)
    const response = await apiClient.post('/interests/shortlist/', { shortlisted_profile: profileId });
    return response.data;
  },

  removeFromShortlist: async (shortlistId: string) => {
    await apiClient.delete(`/interests/shortlist/${shortlistId}/`);
  },

  getShortlist: async () => {
    const response = await apiClient.get('/interests/shortlist/');
    return unwrapList(response.data).map((s) => ({
      ...s,
      shortlisted_profile: adaptProfile(s.shortlisted),
      shortlisted_profile_id: s.shortlisted_profile,
    }));
  },
};

export default interestsAPI;
