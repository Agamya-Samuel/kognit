'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@edutech/ui';
import { Save, X } from 'lucide-react';
import { useCreateRecurringSchedule } from '@/hooks/useCourses';

interface RecurringScheduleFormProps {
  courseId: number | string;
  onCancel: () => void;
}

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export function RecurringScheduleForm({ courseId, onCancel }: RecurringScheduleFormProps) {
  const [title, setTitle] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const createSchedule = useCreateRecurringSchedule();

  const toggleDay = (day: string) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || daysOfWeek.length === 0 || !startDate || !endDate) return;
    try {
      await createSchedule.mutateAsync({
        courseId,
        dto: {
          title: title.trim(),
          daysOfWeek,
          startTime,
          durationMinutes,
          startDate,
          endDate,
          meetingLink: meetingLink.trim() || undefined,
        },
      });
      onCancel();
    } catch (err) {
      console.error('Failed to create schedule:', err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Add Recurring Schedule</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sched-title">Schedule Title</Label>
          <Input
            id="sched-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Monday/Wednesday Live Classes"
          />
        </div>

        <div className="space-y-2">
          <Label>Days of Week</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  daysOfWeek.includes(day.key)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-accent border-input'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sched-time">Start Time</Label>
            <Input
              id="sched-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched-duration">Duration (minutes)</Label>
            <Input
              id="sched-duration"
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sched-start">Start Date</Label>
            <Input
              id="sched-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched-end">End Date</Label>
            <Input
              id="sched-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sched-link">Meeting Link (optional)</Label>
          <Input
            id="sched-link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="Leave blank for auto-generated rooms"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={createSchedule.isPending || !title.trim() || daysOfWeek.length === 0 || !startDate || !endDate}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {createSchedule.isPending ? 'Creating...' : 'Create Schedule'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
