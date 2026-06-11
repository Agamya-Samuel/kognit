'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from '@edutech/ui';
import { Plus, Calendar, Repeat } from 'lucide-react';
import { useCourseSessions, useRecurringSchedules } from '@/hooks/useCourses';
import { SessionList } from './SessionList';
import { RecurringScheduleCard } from './RecurringScheduleCard';
import { OneTimeSessionForm } from './OneTimeSessionForm';
import { RecurringScheduleForm } from './RecurringScheduleForm';

interface SessionSchedulerProps {
  courseId: number | string;
}

export function SessionScheduler({ courseId }: SessionSchedulerProps) {
  const { data: sessionsData, isLoading: sessionsLoading } = useCourseSessions(courseId);
  const { data: schedules, isLoading: schedulesLoading } = useRecurringSchedules(courseId);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  const sessions = (sessionsData as any)?.data || sessionsData || [];

  if (sessionsLoading || schedulesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sessions">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="h-4 w-4" />
              Sessions ({Array.isArray(sessions) ? sessions.length : 0})
            </TabsTrigger>
            <TabsTrigger value="recurring" className="gap-2">
              <Repeat className="h-4 w-4" />
              Recurring ({Array.isArray(schedules) ? schedules.length : 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sessions" className="space-y-4">
          {!showAddSession ? (
            <Button onClick={() => setShowAddSession(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Session
            </Button>
          ) : (
            <OneTimeSessionForm courseId={courseId} onCancel={() => setShowAddSession(false)} />
          )}
          <SessionList courseId={courseId} sessions={Array.isArray(sessions) ? sessions : []} />
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          {!showAddSchedule ? (
            <Button onClick={() => setShowAddSchedule(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Recurring Schedule
            </Button>
          ) : (
            <RecurringScheduleForm courseId={courseId} onCancel={() => setShowAddSchedule(false)} />
          )}
          {Array.isArray(schedules) && schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules.map((schedule: any) => (
                <RecurringScheduleCard key={schedule.id} courseId={courseId} schedule={schedule} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Repeat className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No recurring schedules yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
