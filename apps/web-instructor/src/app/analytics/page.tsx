'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface CourseAnalytics {
  courseId: number;
  courseTitle: string;
  enrollmentCount: number;
  completionRate: number;
  revenue: number;
  certificateCount: number;
}

interface InstructorAnalytics {
  totalEnrollments: number;
  totalCertificates: number;
  totalRevenue: number;
  averageCompletionRate: number;
  courseAnalytics: CourseAnalytics[];
}

function fetchInstructorAnalytics(courseId?: number): Promise<InstructorAnalytics> {
  const params = courseId ? { courseId } : {};
  return api.get('/analytics/instructor', { params }).then(res => res.data.data);
}

function formatRevenue(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: () => fetchInstructorAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <p className="text-red-500">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Total Enrollments</p>
          <p className="text-2xl font-bold mt-1">{data.totalEnrollments}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Certificates Issued</p>
          <p className="text-2xl font-bold mt-1">{data.totalCertificates}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatRevenue(data.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Avg Completion Rate</p>
          <p className="text-2xl font-bold mt-1">{data.averageCompletionRate}%</p>
        </div>
      </div>

      {/* Per-Course Breakdown */}
      {data.courseAnalytics.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Course Breakdown</h2>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Enrollments</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Completion</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Certificates</th>
                </tr>
              </thead>
              <tbody>
                {data.courseAnalytics.map((course) => (
                  <tr key={course.courseId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{course.courseTitle}</td>
                    <td className="px-4 py-3 text-right">{course.enrollmentCount}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        course.completionRate >= 50
                          ? 'bg-green-100 text-green-700'
                          : course.completionRate >= 25
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {course.completionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatRevenue(course.revenue)}</td>
                    <td className="px-4 py-3 text-right">{course.certificateCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
