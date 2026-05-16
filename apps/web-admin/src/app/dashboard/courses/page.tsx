'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Spinner } from '@edutech/ui';
import { CheckCircle2, XCircle, PauseCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

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

      const { data } = await api.get<{ success: boolean; data: CoursesResponse }>(
        '/admin/courses',
        { params },
      );
      const result = data.data ?? data;
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
      await api.patch(`/admin/courses/${id}/approve`);
      fetchCourses();
    } catch {
      // Silently fail
    }
  };

  const handleSuspend = async () => {
    if (!actionId) return;
    try {
      await api.patch(`/admin/courses/${actionId}/suspend`);
      setActionId(null);
      setActionType(null);
      fetchCourses();
    } catch {
      // Silently fail
    }
  };

  const handleReject = async () => {
    if (!actionId || !reason.trim()) return;
    try {
      await api.patch(`/admin/courses/${actionId}/reject`, { reason });
      setActionId(null);
      setActionType(null);
      setReason('');
      fetchCourses();
    } catch {
      // Silently fail
    }
  };

  const openAction = (id: number, type: 'reject' | 'suspend') => {
    setActionId(id);
    setActionType(type);
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Course Moderation
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review and moderate platform courses
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    publishFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
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
            <p className="py-12 text-center text-gray-500">No courses found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Title</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Instructor</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Domain</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Price</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="pb-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {course.instructorName}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {course.domain}
                        </td>
                        <td className="py-3">
                          {course.pricingType === 'free' ? (
                            <span className="text-green-600 dark:text-green-400">Free</span>
                          ) : (
                            <span className="text-gray-900 dark:text-white">&#8377;{course.priceInr.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            course.isPublished
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!course.isPublished && (
                              <button
                                onClick={() => handleApprove(course.id)}
                                className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Approve (publish)"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                            {course.isPublished && (
                              <button
                                onClick={() => openAction(course.id, 'suspend')}
                                className="rounded p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                title="Suspend (unpublish)"
                              >
                                <PauseCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openAction(course.id, 'reject')}
                              className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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

      {/* Action dialog (reject/suspend) */}
      {actionId !== null && actionType !== null && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => { setActionId(null); setActionType(null); }} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {actionType === 'reject' ? 'Reject Course' : 'Suspend Course'}
            </h3>
            {actionType === 'reject' ? (
              <>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  This will remove the course from the platform. Please provide a reason.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  rows={3}
                />
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This will unpublish the course, hiding it from students.
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
