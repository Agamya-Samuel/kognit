'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@edutech/ui';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '@edutech/api-client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = ['pending', 'approved', 'rejected'];

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getInstructors({
        page,
        limit,
        status: statusFilter,
      }) as any;
      setInstructors(result?.instructors ?? []);
      setTotal(result?.total ?? 0);
    } catch {
      setInstructors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const totalPages = Math.ceil(total / limit);

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveInstructor(id);
      fetchInstructors();
    } catch {
      console.error('Failed to approve instructor:', id);
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    try {
      await adminService.rejectInstructor(rejectingId, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      fetchInstructors();
    } catch {
      console.error('Failed to reject instructor:', rejectingId);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'rejected':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructor Approvals"
        description="Review and manage instructor applications"
      />

      {/* Status filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {status} {status === 'pending' ? `(${total})` : ''}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructors table */}
      <Card>
        <CardHeader>
          <CardTitle>Instructor Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : instructors.length === 0 ? (
            <EmptyState
              title="No instructor applications"
              description="There are no instructor applications matching your filters."
              action={{ label: 'Clear Filters', onClick: () => { setStatusFilter('pending'); } }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Name</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Email</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Expertise</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Applied</th>
                      <th className="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {instructors.map((inst) => (
                      <tr key={inst.id} className="hover:bg-accent/50 transition-colors">
                        <td className="py-3 font-medium text-foreground">
                          {inst.userName}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {inst.userEmail}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {inst.expertise.slice(0, 3).map((skill: string) => (
                              <span
                                key={skill}
                                className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                              >
                                {skill}
                              </span>
                            ))}
                            {inst.expertise.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{inst.expertise.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", statusColor(inst.approvalStatus))}>
                            {inst.approvalStatus}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(inst.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          {inst.approvalStatus === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleApprove(inst.id)}
                                className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setRejectingId(inst.id); setRejectReason(''); }}
                                className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {rejectingId !== null && (
        <Dialog open onOpenChange={(open) => { if (!open) setRejectingId(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this instructor application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="mt-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
