'use client';

import { useState } from 'react';
import { Button, Input, Label, Badge, Skeleton } from '@edutech/ui';
import { Plus, Trash2, FileText, Paperclip, ExternalLink } from 'lucide-react';
import { useAttachments, useAddAttachment, useDeleteAttachment } from '@/hooks/useCourses';
import type { LessonAttachment } from '@edutech/types';

interface AttachmentListProps {
  lectureId: number;
}

export function AttachmentList({ lectureId }: AttachmentListProps) {
  const { data: attachments, isLoading } = useAttachments(lectureId);
  const addAttachment = useAddAttachment();
  const deleteAttachment = useDeleteAttachment();
  const [showAdd, setShowAdd] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleAdd = () => {
    if (!fileName.trim() || !fileUrl.trim()) return;
    addAttachment.mutate(
      {
        lectureId,
        dto: { fileName: fileName.trim(), fileUrl: fileUrl.trim(), contentType: 'application/octet-stream', fileSize: 0 },
      },
      {
        onSuccess: () => {
          setFileName('');
          setFileUrl('');
          setShowAdd(false);
        },
      }
    );
  };

  const handleDelete = (attachmentId: number) => {
    if (confirm('Remove this attachment?')) {
      deleteAttachment.mutate({ lectureId, attachmentId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const list = (attachments || []) as LessonAttachment[];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{list.length} attachment{list.length !== 1 ? 's' : ''}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">File Name</Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="slides.pdf"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">File URL</Label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={addAttachment.isPending || !fileName.trim() || !fileUrl.trim()}>
              {addAttachment.isPending ? 'Adding...' : 'Add'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No attachments yet</p>
      ) : (
        <div className="space-y-1">
          {list.map((att) => (
            <div key={att.id} className="flex items-center gap-3 p-2 rounded-md border bg-background hover:bg-accent/30 transition-colors">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{att.fileName}</span>
                {att.contentType && (
                  <Badge variant="outline" className="text-xs mt-0.5">{att.contentType}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {att.fileUrl && (
                  <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(att.id)}
                  disabled={deleteAttachment.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
