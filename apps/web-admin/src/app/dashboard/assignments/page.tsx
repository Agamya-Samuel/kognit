'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Spinner, Select, SelectItem } from '@edutech/ui';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { adminService } from '@edutech/api-client';

interface Assignment {
  id: number;
  title: string;
  description: string;
  courseName: string;
  dueDate: string;
  totalMarks: number;
  submittedCount: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getAssignments({
        page,
        limit,
        search: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setAssignments(result.assignments ?? []);
      setTotal(result.total ?? 0);
    } catch {
      setAssignments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const totalPages = Math.ceil(total / limit);

  const handleView = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleEdit = (assignment: Assignment) => {
    // TODO: Implement edit functionality
    console.log('Edit assignment:', assignment);
  };

  const handleDelete = (assignment: Assignment) => {
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      // TODO: Implement delete functionality
      console.log('Delete assignment:', assignment);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export assignments');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Assignments Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor all course assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No assignments found.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Assignment
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Title</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Course</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Submissions</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="pb-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {assignment.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {assignment.description}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {assignment.courseName}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {assignment.submittedCount}
                            </span>
                            <span className="text-gray-500"> / {assignment.totalMarks}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(assignment)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(assignment)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(assignment)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSelectedAssignment(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedAssignment.title}
              </h3>
              <Button variant="ghost" onClick={() => setSelectedAssignment(null)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAssignment.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Course</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAssignment.courseName}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Due Date</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Total Marks</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAssignment.totalMarks}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Submissions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAssignment.submittedCount} / {selectedAssignment.totalMarks}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                  Close
                </Button>
                <Button onClick={() => handleEdit(selectedAssignment)}>
                  Edit Assignment
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}