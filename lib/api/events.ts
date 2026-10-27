import apiClient, { unwrapList } from '../api';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  // UI aliases
  start_date?: string;
  attendees?: number;
  capacity?: number;
  is_registered?: boolean;
  [key: string]: any;
}

const adaptEvent = (e: any): Event => ({
  ...e,
  image: e.banner_image,
  start_date: e.event_date,
  attendees: e.registration_count,
  capacity: e.max_participants,
});

const eventsAPI = {
  getEvents: async () => {
    const response = await apiClient.get('/events/');
    return unwrapList(response.data).map(adaptEvent);
  },
  listEvents: async () => eventsAPI.getEvents(),

  getEventDetail: async (id: string) => {
    const response = await apiClient.get(`/events/${id}/`);
    return adaptEvent(response.data);
  },

  registerForEvent: async (eventId: string) => {
    const response = await apiClient.post(`/events/${eventId}/register/`);
    return response.data;
  },
  registerEvent: async (eventId: string) => eventsAPI.registerForEvent(eventId),

  /** There is no "my registrations" endpoint; each event carries `is_registered` for the caller. */
  getMyEventRegistrations: async () => {
    const events = await eventsAPI.getEvents();
    return events.filter((e) => e.is_registered);
  },
};

export default eventsAPI;
