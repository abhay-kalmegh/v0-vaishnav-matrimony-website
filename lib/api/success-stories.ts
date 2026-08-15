import apiClient from '../api';

export interface SuccessStory {
  id: string;
  names: string;
  sampraday: string;
  image: string;
  quote: string;
  marriage_date: string;
  long_story: string;
  created_at: string;
}

const successStoriesAPI = {
  getStories: async () => {
    const response = await apiClient.get<SuccessStory[]>('/success-stories/');
    return response.data;
  },

  submitStory: async (data: any) => {
    const response = await apiClient.post('/success-stories/submit/', data);
    return response.data;
  },

  getStoryDetail: async (id: string) => {
    const response = await apiClient.get<SuccessStory>(`/success-stories/${id}/`);
    return response.data;
  },
};

export default successStoriesAPI;
