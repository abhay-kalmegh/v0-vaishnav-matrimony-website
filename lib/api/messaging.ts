import apiClient from '../api';

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: number[];
  other_user: {
    id: number;
    first_name: string;
    last_name: string;
    profile: { photos: any[] };
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const messagingAPI = {
  getConversations: async () => {
    const response = await apiClient.get<Conversation[]>('/messaging/conversations/');
    return response.data;
  },

  getConversation: async (conversationId: number) => {
    const response = await apiClient.get<{
      id: number;
      messages: Message[];
      other_user: any;
    }>(`/messaging/conversations/${conversationId}/`);
    return response.data;
  },

  sendMessage: async (conversationId: number, content: string) => {
    const response = await apiClient.post<Message>('/messaging/messages/', {
      conversation: conversationId,
      content,
    });
    return response.data;
  },

  markAsRead: async (conversationId: number) => {
    const response = await apiClient.post(
      `/messaging/conversations/${conversationId}/mark-read/`
    );
    return response.data;
  },

  startConversation: async (userId: number) => {
    const response = await apiClient.post<Conversation>('/messaging/conversations/start/', {
      user: userId,
    });
    return response.data;
  },

  deleteConversation: async (conversationId: number) => {
    await apiClient.delete(`/messaging/conversations/${conversationId}/`);
  },
};

export default messagingAPI;
