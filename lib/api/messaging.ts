import apiClient from '../api';

export interface Message {
  id: string;
  sender: any;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participants: any[];
  last_message: string;
  updated_at: string;
  other_participant?: any;
}

const messagingAPI = {
  getConversations: async () => {
    const response = await apiClient.get<Conversation[]>('/messages/');
    return response.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await apiClient.get<Message[]>(`/messages/${conversationId}/`);
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string) => {
    const response = await apiClient.post<Message>(`/messages/${conversationId}/send/`, {
      content,
    });
    return response.data;
  },
};

export default messagingAPI;
