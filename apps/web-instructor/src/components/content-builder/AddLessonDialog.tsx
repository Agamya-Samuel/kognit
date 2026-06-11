'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Input, Label, Textarea, Switch,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@edutech/ui';
import type { Lecture } from '@edutech/types';
import { useCreateLesson, useUpdateLesson } from '@/hooks/useContentBuilder';

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number | string;
  sectionId: number;
  lecture: Lecture | null;
}

export function AddLessonDialog({ open, onOpenChange, courseId, sectionId, lecture }: AddLessonDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('video');
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const isEditing = !!lecture;

  useEffect(() => {
    if (lecture) {
      setTitle(lecture.title);
      setDescription(lecture.description || '');
      setType(lecture.type);
      setExternalVideoUrl(lecture.externalVideoUrl || '');
      setIsFreePreview(lecture.isFreePreview);
    } else {
      setTitle('');
      setDescription('');
      setType('video');
      setExternalVideoUrl('');
      setIsFreePreview(false);
    }
  }, [lecture, open]);

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      const dto = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        externalVideoUrl: externalVideoUrl.trim() || undefined,
        isFreePreview,
      };

      if (isEditing && lecture) {
        await updateLesson.mutateAsync({
          courseId,
          sectionId,
          lectureId: lecture.id,
          dto,
        });
      } else {
        await createLesson.mutateAsync({ courseId, sectionId, dto });
      }
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save lesson:', err);
    }
  };

  const isPending = createLesson.isPending || updateLesson.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update lesson details' : 'Add a new lesson to this section'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to React Hooks"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="lesson-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch id="free-preview" checked={isFreePreview} onCheckedChange={setIsFreePreview} />
              <Label htmlFor="free-preview" className="text-sm">Free Preview</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-desc">Description (optional)</Label>
            <Textarea
              id="lesson-desc"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Brief description of this lesson"
              rows={3}
            />
          </div>
          {type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="video-url">External Video URL (optional)</Label>
              <Input
                id="video-url"
                value={externalVideoUrl}
                onChange={(e) => setExternalVideoUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                You can also upload a video file after creating the lesson.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Update' : 'Add Lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
