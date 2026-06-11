'use client';

import { useState } from 'react';
import { Badge, Button, Card, CardContent } from '@edutech/ui';
import { Calendar, Clock, XCircle } from 'lucide-react';
import { CancelSessionDialog } from './CancelSessionDialog';

interface Session {
  id: number;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  sessionType: string;
  meetingLink: string | null;
}

interface SessionListProps {
  courseId: number | string;
  sessions: Session[];
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  live: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  ended: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function SessionList({ courseId, sessions }: SessionListProps) {
  const [cancelTarget, setCancelTarget] = useState<Session | null>(null);

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No sessions scheduled</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return (
    <>
      <div className="space-y-2">
        {sorted.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-2 w-24 shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(session.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2 w-16 shrink-0">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium truncate block">{session.title}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{session.durationMinutes} min</span>
                {session.sessionType === 'recurring' && (
                  <Badge variant="outline" className="text-xs">Recurring</Badge>
                )}
              </div>
            </div>
            <Badge className={`text-xs ${statusColors[session.status] || ''}`}>
              {session.status}
            </Badge>
            {session.status === 'scheduled' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                onClick={() => setCancelTarget(session)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <CancelSessionDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        courseId={courseId}
        session={cancelTarget}
      />
    </>
  );
}
