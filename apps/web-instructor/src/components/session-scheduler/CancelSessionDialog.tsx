'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button,
} from '@edutech/ui';
import { AlertTriangle } from 'lucide-react';
import { useCancelSession } from '@/hooks/useCourses';

interface CancelSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number | string;
  session: { id: number; title: string; scheduledAt: string } | null;
}

export function CancelSessionDialog({ open, onOpenChange, courseId, session }: CancelSessionDialogProps) {
  const cancelSession = useCancelSession();

  const handleCancel = async () => {
    if (!session) return;
    try {
      await cancelSession.mutateAsync({ courseId, sessionId: session.id });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to cancel session:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Session
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this session?
          </DialogDescription>
        </DialogHeader>

        {session && (
          <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
            <p className="font-medium text-sm">{session.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(session.scheduledAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Enrolled students will be notified about the cancellation. This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Session</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={cancelSession.isPending}>
            {cancelSession.isPending ? 'Cancelling...' : 'Cancel Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
