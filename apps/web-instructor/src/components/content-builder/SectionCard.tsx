'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@edutech/ui';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import type { SectionWithLectures } from '@edutech/types';
import { useDeleteSection } from '@/hooks/useContentBuilder';
import { LessonCard } from './LessonCard';
import { AddLessonDialog } from './AddLessonDialog';

interface SectionCardProps {
  courseId: number | string;
  section: SectionWithLectures;
  index: number;
  onEdit: () => void;
}

export function SectionCard({ courseId, section, index, onEdit }: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const deleteSection = useDeleteSection();

  const lectures = section.lectures || [];

  const handleDelete = () => {
    if (confirm(`Delete "${section.title}" and all its lessons?`)) {
      deleteSection.mutate({ courseId, sectionId: section.id });
    }
  };

  return (
    <Card>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Section {index + 1}</span>
            <Badge variant="secondary" className="text-xs">{lectures.length} lessons</Badge>
          </div>
          <h4 className="font-medium truncate">{section.title}</h4>
          {section.description && (
            <p className="text-sm text-muted-foreground truncate">{section.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleteSection.isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {lectures.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No lessons in this section</p>
          ) : (
            <div className="space-y-2">
              {lectures.map((lecture, li) => (
                <LessonCard
                  key={lecture.id}
                  courseId={courseId}
                  sectionId={section.id}
                  lecture={lecture}
                  index={li}
                  onEdit={() => { setEditingLesson(lecture); setAddLessonOpen(true); }}
                />
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => { setEditingLesson(null); setAddLessonOpen(true); }}
          >
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
        </CardContent>
      )}

      <AddLessonDialog
        open={addLessonOpen}
        onOpenChange={setAddLessonOpen}
        courseId={courseId}
        sectionId={section.id}
        lecture={editingLesson}
      />
    </Card>
  );
}
