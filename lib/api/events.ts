import apiClient from '../api';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  event_type: string;
  capacity: number;
  registered_count: number;
  is_registered: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: number;
  event: number;
  user: number;
  status: string;
  created_at: string;
}

const eventsAPI = {
  getUpcomingEvents: async () => {
    const response = await apiClient.get<Event[]>('/events/upcoming/');
    return response.data;
  },

  getEventDetail: async (eventId: number) => {
    const response = await apiClient.get<Event>(`/events/${eventId}/`);
    return response.data;
  },

  registerForEvent: async (eventId: number) => {
    const response = await apiClient.post<EventRegistration>('/events/register/', {
      event: eventId,
    });
    return response.data;
  },

  unregisterFromEvent: async (eventId: number) => {
    const response = await apiClient.post(`/events/${eventId}/unregister/`);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await apiClient.get<EventRegistration[]>('/events/my-registrations/');
    return response.data;
  },
};

export default eventsAPI;
