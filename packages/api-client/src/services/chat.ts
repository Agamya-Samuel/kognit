import { getApiClient } from '../index';
import type { ChatMessage, ChatChannel, ChatChannelMember, SendMessagePayload } from '@edutech/types';

export const chatService = {
  async listChannels(options?: Record<string, unknown>) {
    return getApiClient().get<ChatChannel[]>('/chat/channels', options);
  },

  async getMyChannels() {
    return getApiClient().get<ChatChannel[]>('/chat/my-channels');
  },

  async getCourseChannels(courseId: number) {
    return getApiClient().get<ChatChannel[]>(`/chat/courses/${courseId}/channels`);
  },

  async getChannelMembers(channelId: number) {
    return getApiClient().get<ChatChannelMember[]>(`/chat/channels/${channelId}/members`);
  },

  async getMessages(channelId: number, limit = 50, offset = 0) {
    return getApiClient().get<{ data: ChatMessage[]; total: number; limit: number; offset: number }>(
      `/chat/channels/${channelId}/messages`,
      { limit, offset },
    );
  },

  async getMessageReplies(messageId: number, limit = 50, offset = 0) {
    return getApiClient().get<{ data: ChatMessage[]; total: number; limit: number; offset: number }>(
      `/chat/messages/${messageId}/replies`,
      { limit, offset },
    );
  },

  async sendMessage(payload: SendMessagePayload) {
    return getApiClient().post<ChatMessage>('/chat/messages', payload);
  },

  async editMessage(messageId: number, content: string) {
    return getApiClient().put<ChatMessage>(`/chat/messages/${messageId}`, { content });
  },

  async deleteMessage(messageId: number) {
    return getApiClient().delete<void>(`/chat/messages/${messageId}`);
  },

  async flagMessage(messageId: number) {
    return getApiClient().post<ChatMessage>(`/chat/messages/${messageId}/flag`);
  },

  async moderateMessage(messageId: number, action: 'flag' | 'unflag' | 'hide' | 'delete') {
    return getApiClient().post<ChatMessage>(`/chat/messages/${messageId}/moderate`, { action });
  },

  async joinChannel(channelId: number) {
    return getApiClient().post<void>(`/chat/channels/${channelId}/join`);
  },

  async leaveChannel(channelId: number) {
    return getApiClient().post<void>(`/chat/channels/${channelId}/leave`);
  },

  async markAsRead(channelId: number) {
    return getApiClient().post<void>(`/chat/channels/${channelId}/read`);
  },
};