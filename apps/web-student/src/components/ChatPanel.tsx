'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useChannelMessages,
  useChatSocket,
  useSendMessage,
  useDeleteMessage,
  useFlagMessage,
  useEditMessage,
  useMarkAsRead,
} from '@/hooks/useChat';
import type { ChatMessage, TypingUser } from '@edutech/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ChatPanelProps {
  channelId: number;
  currentUserId: number;
  currentUserRole?: string;
  channelName?: string;
}

// ─── Main ChatPanel ──────────────────────────────────────────────────────────

export function ChatPanel({
  channelId,
  currentUserId,
  currentUserRole = 'student',
  channelName,
}: ChatPanelProps) {
  const [messageInput, setMessageInput] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Data hooks
  const { data: messagesData, isLoading: messagesLoading } = useChannelMessages(channelId);
  const {
    connected,
    typingUsers,
    connect,
    emitTyping,
    emitSend,
    emitEdit,
    emitDelete,
    clearNewMessages,
  } = useChatSocket(channelId);
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();
  const flagMessage = useFlagMessage();
  const editMessage = useEditMessage();
  const markAsRead = useMarkAsRead();

  // Connect socket on mount
  useEffect(() => {
    connect();
    return () => {
      clearNewMessages();
    };
  }, [connect, clearNewMessages]);

  // Mark as read when messages change
  useEffect(() => {
    if (channelId) {
      markAsRead.mutate(channelId);
    }
  }, [channelId, messagesData, markAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (value: string) => {
      setMessageInput(value);

      // Emit typing indicator
      emitTyping(true);

      // Debounce: stop typing after 3 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
      }, 3000);
    },
    [emitTyping],
  );

  const handleSend = useCallback(() => {
    const content = messageInput.trim();
    if (!content) return;

    if (editingMessage) {
      // Edit existing message
      editMessage.mutate(
        { messageId: editingMessage.id, content },
        {
          onSuccess: () => {
            emitEdit(editingMessage.id, content);
            setEditingMessage(null);
            setMessageInput('');
            emitTyping(false);
          },
        },
      );
    } else {
      // Send new message
      sendMessage.mutate(
        { channelId, content, replyToId: replyTo?.id },
        {
          onSuccess: () => {
            emitSend(content, replyTo?.id);
            setReplyTo(null);
            setMessageInput('');
            emitTyping(false);
          },
        },
      );
    }
  }, [messageInput, editingMessage, replyTo, channelId, sendMessage, editMessage, emitSend, emitEdit, emitTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === 'Escape') {
        setReplyTo(null);
        setEditingMessage(null);
        setMessageInput('');
      }
    },
    [handleSend],
  );

  const handleDelete = useCallback(
    (messageId: number) => {
      deleteMessage.mutate(messageId, {
        onSuccess: () => emitDelete(messageId),
      });
    },
    [deleteMessage, emitDelete],
  );

  const handleFlag = useCallback(
    (messageId: number) => {
      flagMessage.mutate(messageId);
    },
    [flagMessage],
  );

  const handleReply = useCallback((message: ChatMessage) => {
    setReplyTo(message);
    setEditingMessage(null);
  }, []);

  const handleEdit = useCallback((message: ChatMessage) => {
    setEditingMessage(message);
    setReplyTo(null);
    setMessageInput(message.content);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyTo(null);
    setEditingMessage(null);
    setMessageInput('');
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  const messages = messagesData?.data ?? [];
  const isInstructorOrAdmin = currentUserRole === 'instructor' || currentUserRole === 'admin';

  return (
    <div className="flex h-full flex-col border rounded-lg bg-card">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-card-foreground">
            {channelName ?? `Channel #${channelId}`}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-success' : 'bg-destructive'}`} />
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
            {typingUsers.length > 0 && (
              <span className="ml-2 italic">
                {formatTypingUsers(typingUsers, currentUserId)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Messages ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              isInstructorOrAdmin={isInstructorOrAdmin}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onFlag={handleFlag}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Reply/Edit Banner ──────────────────────────────────────────────── */}
      {(replyTo || editingMessage) && (
        <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {editingMessage
              ? `Editing message: "${truncate(editingMessage.content, 40)}"`
              : `Replying to: "${truncate(replyTo!.content, 40)}"`}
          </span>
          <button
            onClick={cancelReply}
            className="text-xs text-destructive hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ─── Input ───────────────────────────────────────────────────────────── */}
      <div className="border-t px-4 py-3">
        <div className="flex gap-2">
          <textarea
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? `Reply to message...` : editingMessage ? `Edit message...` : `Type a message...`}
            aria-label={replyTo ? 'Reply to message' : editingMessage ? 'Edit message' : 'Type a message'}
            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!messageInput.trim() || sendMessage.isPending || editMessage.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingMessage ? 'Save' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MessageBubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: number;
  isInstructorOrAdmin: boolean;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: number) => void;
  onFlag: (messageId: number) => void;
}

function MessageBubble({
  message,
  currentUserId,
  isInstructorOrAdmin,
  onReply,
  onEdit,
  onDelete,
  onFlag,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const isOwn = message.senderId === currentUserId;
  const isFlagged = message.moderationStatus === 'flagged';
  const isHidden = message.moderationStatus === 'hidden';

  if (isHidden) {
    return (
      <div className="py-1 text-center text-xs text-muted-foreground italic">
        This message has been hidden by a moderator.
      </div>
    );
  }

  if (message.isDeleted) {
    return (
      <div className="py-1 text-center text-xs text-muted-foreground italic">
        Message deleted
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-lg px-3 py-2 hover:bg-muted/50 ${isFlagged ? 'border border-destructive/50' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Sender info */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {message.senderName?.charAt(0)?.toUpperCase() ?? message.senderEmail?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-card-foreground">
              {message.senderName ?? message.senderEmail ?? `User ${message.senderId}`}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {isFlagged && (
              <span className="text-xs text-destructive font-medium">[flagged]</span>
            )}
          </div>
          <p className="text-sm text-card-foreground break-words whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="absolute right-2 top-1 flex gap-1">
          <ActionButton onClick={() => onReply(message)} label="Reply" />
          {isOwn && (
            <>
              <ActionButton onClick={() => onEdit(message)} label="Edit" />
              <ActionButton onClick={() => onDelete(message.id)} label="Delete" variant="destructive" />
            </>
          )}
          {!isOwn && (
            <ActionButton onClick={() => onFlag(message.id)} label="Flag" variant="destructive" />
          )}
          {isInstructorOrAdmin && !isOwn && (
            <ActionButton onClick={() => onDelete(message.id)} label="Delete" variant="destructive" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── ActionButton ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'default' | 'destructive';
}

function ActionButton({ onClick, label, variant = 'default' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-0.5 text-xs ${
        variant === 'destructive'
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

function formatTypingUsers(users: TypingUser[], currentUserId: number): string {
  const others = users.filter((u) => u.userId !== currentUserId);
  if (others.length === 0) return '';
  if (others.length === 1) return `${others[0].email} is typing...`;
  if (others.length === 2) return `${others[0].email} and ${others[1].email} are typing...`;
  return `${others.length} people are typing...`;
}
