import apiClient from '../api';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

const eventsAPI = {
  getEvents: async () => {
    const response = await apiClient.get<Event[]>('/events/');
    return response.data;
  },

  getEventDetail: async (id: string) => {
    const response = await apiClient.get<Event>(`/events/${id}/`);
    return response.data;
  },

  registerForEvent: async (eventId: string) => {
    const response = await apiClient.post(`/events/${eventId}/register/`);
    return response.data;
  },
};

export default eventsAPI;
