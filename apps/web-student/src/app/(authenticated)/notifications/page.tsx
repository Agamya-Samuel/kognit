'use client';

import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, Avatar, AvatarFallback } from '@edutech/ui';
import { Bell, CheckCircle2, CheckCircle, FileText, Award, Clock, Star, Trash2, CheckCheck } from 'lucide-react';
import { EmptyState } from '@edutech/shared-components';

const notificationIcons: Record<string, React.ReactNode> = {
  assignment_due: <Clock className="h-5 w-5 text-amber-500" />,
  'assignment graded': <CheckCircle2 className="h-5 w-5 text-green-500" />,
  live_class_soon: <Star className="h-5 w-5 text-blue-500" />,
  live_class_started: <Star className="h-5 w-5 text-purple-500" />,
  certificate_issued: <Award className="h-5 w-5 text-amber-500" />,
  payment_success: <CheckCircle className="h-5 w-5 text-green-500" />,
  course_enrolled: <FileText className="h-5 w-5 text-primary" />,
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('unread');
  const { data: notifications, isLoading } = useNotifications(activeTab === 'unread');
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notificationsToDisplay = activeTab === 'unread'
    ? notifications?.filter((n) => !n.read) ?? []
    : notifications ?? [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your learning progress
              {unreadCount && unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>
          {unreadCount && unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead.mutate()} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')} className="mb-6">
          <TabsList>
            <TabsTrigger value="unread">
              Unread {unreadCount && unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notificationsToDisplay.length === 0 ? (
          <EmptyState
            title={activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            description={activeTab === 'unread' ? 'You\'re all caught up!' : 'Check back later for updates.'}
          />
        ) : (
          <div className="space-y-3">
            {notificationsToDisplay.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {notificationIcons[notification.type] || <Bell className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Badge variant="default" className="shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}