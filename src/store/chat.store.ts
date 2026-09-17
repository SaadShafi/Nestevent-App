import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CONVERSATIONS, MESSAGES, NOTIFICATIONS } from '@/data/mock';
import type { Attachment, Conversation, Message, Notification } from '@/data/types';
import { uid } from '@/lib/format';
import { zustandStorage } from '@/lib/storage';

type ChatState = {
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];

  sendMessage: (conversationId: string, text: string, attachment?: Attachment) => void;
  markRead: (conversationId: string) => void;
  openConversationWith: (userId: string) => string;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  unreadCount: () => number;
};

const REPLIES = ["Sounds good!", "Let me check and get back to you.", "Haha yes 😄", "See you there!", "Can't wait 🔥"];

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: CONVERSATIONS,
      messages: MESSAGES,
      notifications: NOTIFICATIONS,

      sendMessage: (conversationId, text, attachment) => {
        const now = new Date().toISOString();
        const m: Message = { id: uid('m'), conversationId, senderId: 'me', text, at: now, read: true, attachment };
        const preview = attachment
          ? attachment.kind === 'image'
            ? '📷 Photo'
            : attachment.kind === 'video'
              ? '🎥 Video'
              : `📎 ${attachment.name ?? 'File'}`
          : text;
        set((s) => ({
          messages: [...s.messages, m],
          conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, lastMessage: preview, lastAt: now } : c)),
        }));
        // Simulated reply so the chat feels alive.
        const conv = get().conversations.find((c) => c.id === conversationId);
        if (conv) {
          setTimeout(() => {
            const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
            const at = new Date().toISOString();
            set((s) => ({
              messages: [...s.messages, { id: uid('m'), conversationId, senderId: conv.participantId, text: reply, at, read: true }],
              conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, lastMessage: reply, lastAt: at } : c)),
            }));
          }, 1200);
        }
      },
      markRead: (conversationId) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)) })),
      openConversationWith: (userId) => {
        const existing = get().conversations.find((c) => c.participantId === userId);
        if (existing) return existing.id;
        const id = uid('cv');
        set((s) => ({
          conversations: [{ id, participantId: userId, lastMessage: '', lastAt: new Date().toISOString(), unread: 0 }, ...s.conversations],
        }));
        return id;
      },
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'nest.chat', storage: zustandStorage },
  ),
);
