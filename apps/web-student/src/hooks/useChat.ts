'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: number;
  content: string;
  replyToId: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  moderationStatus: 'visible' | 'flagged' | 'hidden';
  createdAt: Date | string;
  updatedAt: Date | string;
  replies?: ChatMessage[];
  senderName?: string;
  senderAvatarUrl?: string | null;
  senderEmail?: string;
  senderRole?: string;
}

export interface ChatChannel {
  id: number;
  courseId: number | null;
  type: 'course' | 'general' | 'dm';
  name: string;
  createdAt: Date | string;
  memberCount?: number;
}

export interface ChatChannelMember {
  id: number;
  channelId: number;
  userId: number;
  joinedAt: Date | string;
  lastReadAt: Date | string | null;
}

export interface TypingUser {
  userId: number;
  email: string;
  channelId: number;
  startedAt: number;
}

// ─── Socket singleton ────────────────────────────────────────────────────────

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(`${SOCKET_URL}/chat`, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socketInstance;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaginatedMessages {
  data: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

// ─── useChannelMessages (REST) ────────────────────────────────────────────────

export function useChannelMessages(channelId: number | null, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['chat', 'messages', channelId, limit, offset],
    queryFn: async () => {
      const { data } = await api.get<PaginatedMessages>(
        `/chat/channels/${channelId}/messages`,
        { params: { limit, offset } },
      );
      return data;
    },
    enabled: !!channelId,
  });
}

// ─── useMessageReplies (REST) ─────────────────────────────────────────────────

export function useMessageReplies(messageId: number | null, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['chat', 'replies', messageId, limit, offset],
    queryFn: async () => {
      const { data } = await api.get<PaginatedMessages>(
        `/chat/messages/${messageId}/replies`,
        { params: { limit, offset } },
      );
      return data;
    },
    enabled: !!messageId,
  });
}

// ─── useChannels (REST) ──────────────────────────────────────────────────────

export function useChannels(options?: { courseId?: number; type?: string }) {
  return useQuery({
    queryKey: ['chat', 'channels', options],
    queryFn: async () => {
      const { data } = await api.get<ChatChannel[]>('/chat/channels', {
        params: options,
      });
      return data;
    },
  });
}

// ─── useMyChannels (REST) ────────────────────────────────────────────────────

export function useMyChannels() {
  return useQuery({
    queryKey: ['chat', 'my-channels'],
    queryFn: async () => {
      const { data } = await api.get<ChatChannel[]>('/chat/my-channels');
      return data;
    },
  });
}

// ─── useChannelMembers (REST) ────────────────────────────────────────────────

export function useChannelMembers(channelId: number | null) {
  return useQuery({
    queryKey: ['chat', 'members', channelId],
    queryFn: async () => {
      const { data } = await api.get<ChatChannelMember[]>(
        `/chat/channels/${channelId}/members`,
      );
      return data;
    },
    enabled: !!channelId,
  });
}

// ─── useCourseChannels (REST) ────────────────────────────────────────────────

export function useCourseChannels(courseId: number | null) {
  return useQuery({
    queryKey: ['chat', 'course-channels', courseId],
    queryFn: async () => {
      const { data } = await api.get<ChatChannel[]>(
        `/chat/courses/${courseId}/channels`,
      );
      return data;
    },
    enabled: !!courseId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { channelId: number; content: string; replyToId?: number }) => {
      const { data } = await api.post<ChatMessage>('/chat/messages', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.channelId] });
    },
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { messageId: number; content: string }) => {
      const { data } = await api.put<ChatMessage>(
        `/chat/messages/${payload.messageId}`,
        { content: payload.content },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: number) => {
      await api.delete(`/chat/messages/${messageId}`);
      return messageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
}

export function useFlagMessage() {
  return useMutation({
    mutationFn: async (messageId: number) => {
      const { data } = await api.post<ChatMessage>(
        `/chat/messages/${messageId}/flag`,
        {},
      );
      return data;
    },
  });
}

export function useModerateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { messageId: number; action: 'flag' | 'unflag' | 'hide' | 'delete' }) => {
      const { data } = await api.post<ChatMessage>(
        `/chat/messages/${payload.messageId}/moderate`,
        { action: payload.action },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
}

export function useJoinChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: number) => {
      const { data } = await api.post(`/chat/channels/${channelId}/join`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'channels'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'my-channels'] });
    },
  });
}

export function useLeaveChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: number) => {
      await api.post(`/chat/channels/${channelId}/leave`);
      return channelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'channels'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'my-channels'] });
    },
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: async (channelId: number) => {
      await api.post(`/chat/channels/${channelId}/read`);
      return channelId;
    },
  });
}

// ─── useChatSocket (real-time WebSocket) ──────────────────────────────────────

export function useChatSocket(channelId: number | null) {
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      socketInstance = null;
    }
    setConnected(false);
  }, []);

  // Join/leave channel room
  useEffect(() => {
    if (!channelId || !socketRef.current) return;

    const socket = socketRef.current;
    socket.emit('chat:join', { channelId });

    return () => {
      socket.emit('chat:leave', { channelId });
    };
  }, [channelId]);

  // Listen for real-time events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (message: ChatMessage) => {
      setNewMessages((prev) => [...prev, message]);
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    };

    const handleMessageEdited = (_data: { id: number; content: string; isEdited: boolean; updatedAt: string }) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    };

    const handleMessageDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    };

    const handleTyping = (data: { channelId: number; typingUsers: TypingUser[] }) => {
      if (data.channelId === channelId) {
        setTypingUsers(data.typingUsers);
      }
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:message_edited', handleMessageEdited);
    socket.on('chat:message_deleted', handleMessageDeleted);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:message_edited', handleMessageEdited);
      socket.off('chat:message_deleted', handleMessageDeleted);
      socket.off('chat:typing', handleTyping);
    };
  }, [channelId, queryClient]);

  // Emit typing
  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (channelId && socketRef.current) {
        socketRef.current.emit('chat:typing', { channelId, isTyping });
      }
    },
    [channelId],
  );

  // Emit send (via socket for real-time; also has REST mutation above)
  const emitSend = useCallback(
    (content: string, replyToId?: number) => {
      if (channelId && socketRef.current) {
        socketRef.current.emit('chat:send', { channelId, content, replyToId });
      }
    },
    [channelId],
  );

  // Emit edit
  const emitEdit = useCallback(
    (messageId: number, content: string) => {
      if (socketRef.current) {
        socketRef.current.emit('chat:edit', { messageId, content });
      }
    },
    [],
  );

  // Emit delete
  const emitDelete = useCallback(
    (messageId: number) => {
      if (socketRef.current) {
        socketRef.current.emit('chat:delete', { messageId });
      }
    },
    [],
  );

  // Clear new messages buffer
  const clearNewMessages = useCallback(() => setNewMessages([]), []);

  return {
    connected,
    typingUsers,
    newMessages,
    connect,
    disconnect,
    emitTyping,
    emitSend,
    emitEdit,
    emitDelete,
    clearNewMessages,
  };
}
