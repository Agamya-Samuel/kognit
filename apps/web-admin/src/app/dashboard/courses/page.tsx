'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@edutech/ui';
import { CheckCircle2, XCircle, PauseCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '@edutech/api-client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

interface Course {
  id: number;
  instructorId: number;
  instructorName: string;
  title: string;
  description: string | null;
  domain: string;
  pricingType: 'free' | 'paid';
  priceInr: number;
  isPublished: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

type PublishFilter = 'all' | 'published' | 'draft';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page, limit };
      if (publishFilter === 'published') params.isPublished = true;
      if (publishFilter === 'draft') params.isPublished = false;
      if (search) params.search = search;

      const result = await adminService.getCourses(params) as unknown as CoursesResponse;
      setCourses(result.courses ?? []);
      setTotal(result.total ?? 0);
    } catch {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, publishFilter, search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const totalPages = Math.ceil(total / limit);

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveCourse(id);
      fetchCourses();
    } catch {
      console.error('Failed to approve course:', id);
    }
  };

  const handleSuspend = async () => {
    if (!actionId) return;
    try {
      await adminService.suspendCourse(actionId, reason);
      setActionId(null);
      setActionType(null);
      fetchCourses();
    } catch {
      console.error('Failed to suspend course:', actionId);
    }
  };

  const handleReject = async () => {
    if (!actionId || !reason.trim()) return;
    try {
      await adminService.rejectCourse(actionId, reason);
      setActionId(null);
      setActionType(null);
      setReason('');
      fetchCourses();
    } catch {
      console.error('Failed to reject course:', actionId);
    }
  };

  const openAction = (id: number, type: 'reject' | 'suspend') => {
    setActionId(id);
    setActionType(type);
    setReason('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Moderation"
        description="Review and moderate platform courses"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground")} />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'published', 'draft'] as PublishFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setPublishFilter(filter); setPage(1); }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    publishFilter === filter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses found"
              description="There are no courses matching your filters."
              action={{ label: 'Clear Filters', onClick: () => { setSearch(''); setPublishFilter('all'); } }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Instructor</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Domain</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-accent/50 transition-colors">
                        <td className="py-3 font-medium text-foreground">
                          {course.title}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {course.instructorName}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {course.domain}
                        </td>
                        <td className="py-3">
                          {course.pricingType === 'free' ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                          ) : (
                            <span className="text-foreground">₹{course.priceInr.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            course.isPublished
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!course.isPublished && (
                              <button
                                onClick={() => handleApprove(course.id)}
                                className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                title="Approve (publish)"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                            {course.isPublished && (
                              <button
                                onClick={() => openAction(course.id, 'suspend')}
                                className="rounded p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                                title="Suspend (unpublish)"
                              >
                                <PauseCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openAction(course.id, 'reject')}
                              className="rounded p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
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

      {actionId !== null && actionType !== null && (
        <Dialog open onOpenChange={(open) => { if (!open) { setActionId(null); setActionType(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'reject' ? 'Reject Course' : 'Suspend Course'}
              </DialogTitle>
            </DialogHeader>
            {actionType === 'reject' ? (
              <>
                <p className="text-sm text-muted-foreground">
                  This will remove the course from the platform. Please provide a reason.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="mt-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                This will unpublish the course, hiding it from students.
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionId(null); setActionType(null); }}>Cancel</Button>
              {actionType === 'reject' ? (
                <Button variant="destructive" onClick={handleReject} disabled={!reason.trim()}>
                  Reject
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleSuspend}>
                  Suspend
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
