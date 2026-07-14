import apiClient from '../api';

export interface MatchSuggestion {
  id: number;
  profile: number;
  profile_data: {
    user: { first_name: string; last_name: string };
    age: number;
    city: string;
    occupation: string;
    sampraday: { name: string };
    bio: string;
  };
  compatibility_score: number;
  reasoning: string;
  created_at: string;
}

const matchesAPI = {
  getSuggestions: async (limit: number = 10, offset: number = 0) => {
    const response = await apiClient.get<{
      count: number;
      results: MatchSuggestion[];
    }>('/matches/suggestions/', {
      params: { limit, offset },
    });
    return response.data;
  },

  getMatchDetail: async (matchId: number) => {
    const response = await apiClient.get<MatchSuggestion>(`/matches/${matchId}/`);
    return response.data;
  },

  acceptMatch: async (matchId: number) => {
    const response = await apiClient.post(`/matches/${matchId}/accept/`);
    return response.data;
  },

  rejectMatch: async (matchId: number) => {
    const response = await apiClient.post(`/matches/${matchId}/reject/`);
    return response.data;
  },

  getCompatibilityDetails: async (profileId: number) => {
    const response = await apiClient.get(`/matches/compatibility/${profileId}/`);
    return response.data;
  },
};

export default matchesAPI;
