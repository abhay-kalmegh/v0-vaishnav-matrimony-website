'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import messagingAPI, { Conversation, Message } from '@/lib/api/messaging';

export function MessagingContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingAPI.getConversations();
      setConversations(Array.isArray(data) ? data : []);
      if (data && data.length > 0) {
        setSelectedConversation(data[0].id);
      }
    } catch (err) {
      console.error('[v0] Error fetching conversations:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const data = await messagingAPI.getConversation(selectedConversation);
      setMessages(data.messages || []);
      await messagingAPI.markAsRead(selectedConversation);
    } catch (err) {
      console.error('[v0] Error fetching messages:', err);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const message = await messagingAPI.sendMessage(selectedConversation, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (err) {
      console.error('[v0] Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl h-[600px] flex rounded-lg border border-border overflow-hidden bg-card">
      {/* Conversations List */}
      <div className="w-full md:w-1/3 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-serif text-xl font-bold text-foreground">Messages</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b border-border text-left hover:bg-secondary transition ${
                  selectedConversation === conv.id ? 'bg-secondary' : ''
                }`}
              >
                <h3 className="font-medium text-foreground truncate">
                  {conv.other_user?.first_name} {conv.other_user?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground truncate mt-1">{conv.last_message}</p>
                <p className="text-xs text-muted-foreground mt-1">{conv.last_message_time}</p>
                {conv.unread_count > 0 && (
                  <div className="inline-block mt-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                    {conv.unread_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Area */}
      {selectedConversation ? (
        <div className="hidden md:flex flex-1 flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-serif text-lg font-bold text-foreground">
              {conversations.find((c) => c.id === selectedConversation)?.other_user?.first_name}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.is_mine
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-primary hover:bg-primary/90"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
