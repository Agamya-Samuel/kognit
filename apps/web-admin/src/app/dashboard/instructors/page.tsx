'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner } from '@edutech/ui';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '@edutech/api-client';

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
      });
      setInstructors(result.instructors ?? []);
      setTotal(result.total ?? 0);
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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Instructor Approvals
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review and manage instructor applications
        </p>
      </div>

      {/* Status filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
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
            <p className="py-12 text-center text-gray-500">No instructor applications found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Name</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Email</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Expertise</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Applied</th>
                      <th className="pb-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {instructors.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 font-medium text-gray-900 dark:text-white">
                          {inst.userName}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {inst.userEmail}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {inst.expertise.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              >
                                {skill}
                              </span>
                            ))}
                            {inst.expertise.length > 3 && (
                              <span className="text-xs text-gray-400">+{inst.expertise.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor(inst.approvalStatus)}`}>
                            {inst.approvalStatus}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {new Date(inst.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          {inst.approvalStatus === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleApprove(inst.id)}
                                className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setRejectingId(inst.id); setRejectReason(''); }}
                                className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
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

      {/* Reject dialog */}
      {rejectingId !== null && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setRejectingId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Application</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please provide a reason for rejecting this instructor application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Reject
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
