'use client';

import { Button, Badge, Switch } from '@edutech/ui';
import { Edit, Trash2, Play, FileText, Eye } from 'lucide-react';
import type { Lecture } from '@edutech/types';
import { useDeleteLesson, useUpdateLesson } from '@/hooks/useContentBuilder';

interface LessonCardProps {
  courseId: number | string;
  sectionId: number;
  lecture: Lecture;
  index: number;
  onEdit: () => void;
}

export function LessonCard({ courseId, sectionId, lecture, index, onEdit }: LessonCardProps) {
  const deleteLesson = useDeleteLesson();
  const updateLesson = useUpdateLesson();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${lecture.title}"?`)) {
      deleteLesson.mutate({ courseId, sectionId, lectureId: lecture.id });
    }
  };

  const toggleFreePreview = (checked: boolean) => {
    updateLesson.mutate({
      courseId,
      sectionId,
      lectureId: lecture.id,
      dto: { isFreePreview: checked },
    });
  };

  const typeIcon = {
    video: <Play className="h-3.5 w-3.5" />,
    text: <FileText className="h-3.5 w-3.5" />,
    live: <Play className="h-3.5 w-3.5" />,
    quiz: <FileText className="h-3.5 w-3.5" />,
    assignment: <FileText className="h-3.5 w-3.5" />,
  }[lecture.type] || <FileText className="h-3.5 w-3.5" />;

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent/30 transition-colors">
      <span className="text-xs font-medium text-muted-foreground w-6 text-center">{index + 1}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Badge variant="outline" className="gap-1 text-xs shrink-0">
          {typeIcon}
          {lecture.type}
        </Badge>
        <span className="truncate text-sm font-medium">{lecture.title}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5" title="Free preview">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <Switch
            checked={lecture.isFreePreview}
            onCheckedChange={toggleFreePreview}
            disabled={updateLesson.isPending}
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deleteLesson.isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
