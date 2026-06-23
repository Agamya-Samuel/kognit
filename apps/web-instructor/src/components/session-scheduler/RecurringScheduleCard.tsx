'use client';

import { useState } from 'react';
import { Card, CardContent, Badge, Button } from '@edutech/ui';
import { ChevronDown, ChevronRight, Repeat, Trash2, Clock, Calendar } from 'lucide-react';
import { useDeleteRecurringSchedule } from '@/hooks/useCourses';

interface RecurringSchedule {
  id: number;
  title: string;
  daysOfWeek: string;
  startTime: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  meetingLink: string | null;
}

interface RecurringScheduleCardProps {
  courseId: number | string;
  schedule: RecurringSchedule;
}

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

export function RecurringScheduleCard({ courseId, schedule }: RecurringScheduleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const deleteSchedule = useDeleteRecurringSchedule();

  let days: string[];
  try {
    const parsed = JSON.parse(schedule.daysOfWeek);
    days = Array.isArray(parsed) ? parsed : [];
  } catch {
    days = schedule.daysOfWeek.split(',').map(d => d.trim());
  }

  const handleDelete = () => {
    if (confirm(`Delete "${schedule.title}" and cancel all future sessions?`)) {
      deleteSchedule.mutate({ courseId, scheduleId: schedule.id });
    }
  };

  return (
    <Card>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <Repeat className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{schedule.title}</h4>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <div className="flex gap-1">
              {days.map(d => (
                <Badge key={d} variant="secondary" className="text-xs">{DAY_LABELS[d] || d}</Badge>
              ))}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {schedule.startTime} • {schedule.durationMinutes} min
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          disabled={deleteSchedule.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <CardContent className="pt-0 space-y-2">
          <div className="rounded-lg border p-3 bg-muted/20 text-sm space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(schedule.startDate).toLocaleDateString('en-IN')} — {new Date(schedule.endDate).toLocaleDateString('en-IN')}
              </span>
            </div>
            {schedule.meetingLink && (
              <p className="text-muted-foreground">
                Meeting link: <a href={schedule.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">{schedule.meetingLink}</a>
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
