import apiClient, { unwrapList } from '../api';
import { adaptProfile } from './profiles';

export interface MatchSuggestion {
  id: string;
  profile: string;
  profile_data: any;
  compatibility_score: number;
  reasoning: string;
  created_at: string;
  [key: string]: any;
}

const adaptMatch = (m: any): MatchSuggestion => {
  const profile = adaptProfile(m.matched_profile);
  return {
    ...m,
    profile: profile?.id,
    profile_data: profile,
    reasoning: m.reasoning ?? '',
    created_at: m.generated_at,
  };
};

const matchesAPI = {
  /** One page (20) of suggestions, best match first. */
  getSuggestions: async (page: number = 1) => {
    const response = await apiClient.get('/matches/', { params: { page } });
    return {
      count: response.data.count ?? 0,
      next: response.data.next ?? null,
      previous: response.data.previous ?? null,
      results: unwrapList(response.data).map(adaptMatch),
    };
  },

  /**
   * Flat list of suggestions shaped like a profile card
   * (what the swipe-style suggestions screen renders).
   */
  getMatchSuggestions: async () => {
    const { results } = await matchesAPI.getSuggestions(1);
    return results.map((m) => ({
      ...m.profile_data,
      id: m.profile_data?.id,
      suggestion_id: m.id,
      compatibility: Math.round(m.compatibility_score),
    }));
  },

  generateMatches: async () => {
    const response = await apiClient.post('/matches/generate/');
    return response.data;
  },
};

export default matchesAPI;
