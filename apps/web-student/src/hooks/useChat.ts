import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { chatService } from '@edutech/api-client';
import type { ChatMessage, ChatChannel, ChatChannelMember, TypingUser } from '@edutech/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
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

interface PaginatedMessages {
  data: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

export function useChannelMessages(channelId: number | null, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['chat', 'messages', channelId, limit, offset],
    queryFn: async () => {
      return chatService.getMessages(channelId!, limit, offset);
    },
    enabled: !!channelId,
  });
}

export function useMessageReplies(messageId: number | null, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['chat', 'replies', messageId, limit, offset],
    queryFn: async () => {
      return chatService.getMessageReplies(messageId!, limit, offset);
    },
    enabled: !!messageId,
  });
}

export function useChannels(options?: { courseId?: number; type?: string }) {
  return useQuery({
    queryKey: ['chat', 'channels', options],
    queryFn: async () => {
      return chatService.listChannels(options);
    },
  });
}

export function useMyChannels() {
  return useQuery({
    queryKey: ['chat', 'my-channels'],
    queryFn: async () => {
      return chatService.getMyChannels();
    },
  });
}

export function useChannelMembers(channelId: number | null) {
  return useQuery({
    queryKey: ['chat', 'members', channelId],
    queryFn: async () => {
      return chatService.getChannelMembers(channelId!);
    },
    enabled: !!channelId,
  });
}

export function useCourseChannels(courseId: number | null) {
  return useQuery({
    queryKey: ['chat', 'course-channels', courseId],
    queryFn: async () => {
      return chatService.getCourseChannels(courseId!);
    },
    enabled: !!courseId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { channelId: number; content: string; replyToId?: number }) => {
      return chatService.sendMessage(payload);
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
      return chatService.editMessage(payload.messageId, payload.content);
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
      await chatService.deleteMessage(messageId);
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
      return chatService.flagMessage(messageId);
    },
  });
}

export function useModerateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { messageId: number; action: 'flag' | 'unflag' | 'hide' | 'delete' }) => {
      return chatService.moderateMessage(payload.messageId, payload.action);
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
      await chatService.joinChannel(channelId);
      return channelId;
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
      await chatService.leaveChannel(channelId);
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
      await chatService.markAsRead(channelId);
      return channelId;
    },
  });
}

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

  useEffect(() => {
    if (!channelId || !socketRef.current) return;

    const socket = socketRef.current;
    socket.emit('chat:join', { channelId });

    return () => {
      socket.emit('chat:leave', { channelId });
    };
  }, [channelId]);

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

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (channelId && socketRef.current) {
        socketRef.current.emit('chat:typing', { channelId, isTyping });
      }
    },
    [channelId],
  );

  const emitSend = useCallback(
    (content: string, replyToId?: number) => {
      if (channelId && socketRef.current) {
        socketRef.current.emit('chat:send', { channelId, content, replyToId });
      }
    },
    [channelId],
  );

  const emitEdit = useCallback(
    (messageId: number, content: string) => {
      if (socketRef.current) {
        socketRef.current.emit('chat:edit', { messageId, content });
      }
    },
    [],
  );

  const emitDelete = useCallback(
    (messageId: number) => {
      if (socketRef.current) {
        socketRef.current.emit('chat:delete', { messageId });
      }
    },
    [],
  );

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