import apiClient from '../api';

export interface MatchSuggestion {
  id: string;
  profile: string;
  profile_data: any;
  compatibility_score: number;
  reasoning: string;
  created_at: string;
}

const matchesAPI = {
  getSuggestions: async (page: number = 1) => {
    const response = await apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: MatchSuggestion[];
    }>('/matches/', {
      params: { page },
    });
    return response.data;
  },

  generateMatches: async () => {
    const response = await apiClient.post('/matches/generate/');
    return response.data;
  },
};

export default matchesAPI;
