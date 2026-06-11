'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from '@edutech/ui';
import { Save, X } from 'lucide-react';
import { useCreateSession } from '@/hooks/useCourses';

interface OneTimeSessionFormProps {
  courseId: number | string;
  onCancel: () => void;
}

export function OneTimeSessionForm({ courseId, onCancel }: OneTimeSessionFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');
  const createSession = useCreateSession();

  const handleSubmit = async () => {
    if (!title.trim() || !scheduledAt) return;
    try {
      await createSession.mutateAsync({
        courseId,
        dto: {
          title: title.trim(),
          description: description.trim() || undefined,
          scheduledAt,
          durationMinutes,
          meetingLink: meetingLink.trim() || undefined,
        },
      });
      onCancel();
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Schedule One-Time Session</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="session-title">Title</Label>
          <Input
            id="session-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Week 1 Live Lecture"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-desc">Description (optional)</Label>
          <Textarea
            id="session-desc"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="What will be covered in this session?"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="session-datetime">Date & Time</Label>
            <Input
              id="session-datetime"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-duration">Duration (minutes)</Label>
            <Input
              id="session-duration"
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-link">Meeting Link (optional)</Label>
          <Input
            id="session-link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="Leave blank for auto-generated LiveKit room"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={createSession.isPending || !title.trim() || !scheduledAt} className="gap-2">
            <Save className="h-4 w-4" />
            {createSession.isPending ? 'Creating...' : 'Create Session'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
