import apiClient, { unwrapList } from '../api';

export interface SuccessStory {
  id: string;
  names: string;
  sampraday: string;
  image: string;
  quote: string;
  marriage_date: string;
  long_story: string;
  created_at: string;
  [key: string]: any;
}

const adaptStory = (s: any): SuccessStory => ({
  ...s,
  names: [s.bride_name, s.groom_name].filter(Boolean).join(' & '),
  image: s.photo,
  quote: s.story_text,
  long_story: s.story_text,
});

const successStoriesAPI = {
  getStories: async () => {
    const response = await apiClient.get('/success-stories/');
    return unwrapList(response.data).map(adaptStory);
  },

  submitStory: async (data: { bride_name: string; groom_name: string; story_text: string; marriage_date?: string; sampraday?: string; location?: string }) => {
    const response = await apiClient.post('/success-stories/submit/', data);
    return response.data;
  },

  getStoryDetail: async (id: string) => {
    const response = await apiClient.get(`/success-stories/${id}/`);
    return adaptStory(response.data);
  },
};

export default successStoriesAPI;
