'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Input, Label, Textarea,
} from '@edutech/ui';
import type { Section } from '@edutech/types';
import { useCreateSection, useUpdateSection } from '@/hooks/useContentBuilder';

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number | string;
  section: Section | null;
}

export function AddSectionDialog({ open, onOpenChange, courseId, section }: AddSectionDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const isEditing = !!section;

  useEffect(() => {
    if (section) {
      setTitle(section.title);
      setDescription(section.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [section, open]);

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      if (isEditing && section) {
        await updateSection.mutateAsync({
          courseId,
          sectionId: section.id,
          dto: { title: title.trim(), description: description.trim() || undefined },
        });
      } else {
        await createSection.mutateAsync({
          courseId,
          dto: { title: title.trim(), description: description.trim() || undefined },
        });
      }
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save section:', err);
    }
  };

  const isPending = createSection.isPending || updateSection.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Section' : 'Add Section'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update section details' : 'Add a new section to organize your course content'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction, Getting Started"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-desc">Description (optional)</Label>
            <Textarea
              id="section-desc"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Brief description of what this section covers"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Update' : 'Add Section'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
