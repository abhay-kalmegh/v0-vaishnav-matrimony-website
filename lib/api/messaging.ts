import apiClient, { getStorageValue, unwrapList } from '../api';

export interface Message {
  id: string;
  sender: any;
  content: string;
  timestamp: string;
  created_at: string;
  is_read: boolean;
  is_mine?: boolean;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  participants: any[];
  last_message: string;
  last_message_time?: string;
  updated_at: string;
  other_participant?: any;
  other_user?: any;
  unread_count: number;
  [key: string]: any;
}

// Cached per access token so logging in as a different user never reuses a stale id.
let cached: { token: string | null; id: string } | null = null;
const getMyProfileId = async (): Promise<string | null> => {
  const token = await getStorageValue('access_token');
  if (cached && cached.token === token) return cached.id;
  try {
    const id = (await apiClient.get('/profile/me/')).data.id;
    cached = { token: (await getStorageValue('access_token')) ?? token, id };
    return id;
  } catch {
    return null;
  }
};

const adaptMessage = (m: any, me: string | null): Message => ({
  ...m,
  content: m.text,
  timestamp: m.sent_at,
  created_at: m.sent_at,
  is_mine: !!me && m.sender === me,
});

const adaptConversation = (c: any): Conversation => ({
  ...c,
  participants: [c.other_profile],
  other_participant: c.other_profile,
  other_user: c.other_profile?.user,
  last_message: c.last_message?.text ?? '',
  last_message_time: c.last_message?.sent_at
    ? new Date(c.last_message.sent_at).toLocaleString()
    : '',
});

const messagingAPI = {
  getConversations: async () => {
    const response = await apiClient.get('/messages/');
    return unwrapList(response.data).map(adaptConversation);
  },

  getMessages: async (conversationId: string) => {
    const me = await getMyProfileId();
    const response = await apiClient.get(`/messages/${conversationId}/`);
    // server returns newest-first or oldest-first per model ordering; show oldest first
    return unwrapList(response.data)
      .map((m) => adaptMessage(m, me))
      .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  },

  /** Screen expects { messages }. Fetching also marks the other side's messages read (server-side). */
  getConversation: async (conversationId: string) => {
    return { id: conversationId, messages: await messagingAPI.getMessages(conversationId) };
  },

  /** No-op: GET /messages/<id>/ already marks messages as read on the server. */
  markAsRead: async (_conversationId: string) => {},

  sendMessage: async (conversationId: string, content: string) => {
    const me = await getMyProfileId();
    const response = await apiClient.post(`/messages/${conversationId}/send/`, { text: content });
    return adaptMessage(response.data, me);
  },
};

export default messagingAPI;
