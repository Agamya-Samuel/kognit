'use client';

import { useChannelMessages, useChannelMembers, useSendMessage, useChatSocket } from '@/hooks/useChat';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Avatar, AvatarFallback, ScrollArea } from '@edutech/ui';
import { Send, ArrowLeft, MoreHorizontal, Flag, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function ChatChannelPage() {
  const params = useParams();
  const channelId = parseInt(params.channelId as string);
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading } = useChannelMessages(channelId);
  const { data: members } = useChannelMembers(channelId);
  const sendMessage = useSendMessage();
  const { typingUsers, emitTyping } = useChatSocket(channelId);

  const handleSend = () => {
    if (messageInput.trim()) {
      sendMessage.mutate({ channelId, content: messageInput.trim() });
      setMessageInput('');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <Link href="/community">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {messages?.data?.[0]?.channelId && `Channel #${channelId}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {members?.length ?? 0} members online
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-4 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {messagesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-16 w-3/4 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !messages || messages.data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-muted-foreground">No messages yet.</p>
                  <p className="text-sm text-muted-foreground">Be the first to say hello!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.data.map((message) => {
                  const sender = members?.find((m) => m.userId === message.senderId);
                  const isMe = message.senderId === 1;

                  return (
                    <div key={message.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8" fallback={sender ? getInitials(sender.userId.toString()) : '?'}>
                        <AvatarFallback className="text-xs">
                          {sender ? getInitials(sender.userId.toString()) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${isMe ? 'text-right' : ''}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.senderName || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.createdAt.toString())}
                          </span>
                        </div>
                        <div
                          className={`inline-block rounded-lg px-4 py-2 max-w-md text-left ${
                            isMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {isMe && (
                            <>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                            <Flag className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {typingUsers.length > 0 && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8" fallback="...">
                      <AvatarFallback className="text-xs">...</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-sm text-muted-foreground ml-2">
                        {typingUsers.map((u) => u.email.split('@')[0]).join(', ')} typing...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                emitTyping(e.target.value.length > 0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" disabled={!messageInput.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}