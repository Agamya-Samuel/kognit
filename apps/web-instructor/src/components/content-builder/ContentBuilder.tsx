'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Skeleton } from '@edutech/ui';
import { Plus, BookOpen } from 'lucide-react';
import type { SectionWithLectures } from '@edutech/types';
import { useSections } from '@/hooks/useContentBuilder';
import { SectionCard } from './SectionCard';
import { AddSectionDialog } from './AddSectionDialog';

interface ContentBuilderProps {
  courseId: number | string;
}

export function ContentBuilder({ courseId }: ContentBuilderProps) {
  const { data: sections, isLoading } = useSections(courseId);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionWithLectures | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const sectionList = (sections || []) as SectionWithLectures[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Content</h3>
          <p className="text-sm text-muted-foreground">
            {sectionList.length} section{sectionList.length !== 1 ? 's' : ''} •{' '}
            {sectionList.reduce((acc, s) => acc + (s.lectures?.length || 0), 0)} lessons
          </p>
        </div>
        <Button onClick={() => { setEditingSection(null); setAddDialogOpen(true); }} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sectionList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No sections yet</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Add sections to organize your course content
            </p>
            <Button variant="outline" onClick={() => { setEditingSection(null); setAddDialogOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sectionList.map((section, index) => (
            <SectionCard
              key={section.id}
              courseId={courseId}
              section={section}
              index={index}
              onEdit={() => { setEditingSection(section); setAddDialogOpen(true); }}
            />
          ))}
        </div>
      )}

      <AddSectionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        courseId={courseId}
        section={editingSection}
      />
    </div>
  );
}
