'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Progress } from '@edutech/ui';
import { Search, Mail, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { StatCard, StatsRow } from '@/components/StatsRow';
import { useInstructorStudents } from '@/hooks/useInstructorStudents';
import { useMyCourses } from '@/hooks/useCourses';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const { data: studentsResponse, isLoading: studentsLoading, error } = useInstructorStudents({
    search: searchTerm || undefined,
    courseId: selectedCourse !== 'all' ? selectedCourse : undefined,
  });

  const { data: coursesData, isLoading: coursesLoading } = useMyCourses();

  const students = studentsResponse?.students || [];
  const filteredStudents = students.filter(
    (student) =>
      (selectedCourse === 'all' || String(student.courseId) === selectedCourse) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isLoading = studentsLoading || coursesLoading;

  const totalStudents = filteredStudents.length;
  const averageProgress = filteredStudents.length > 0
    ? Math.round(filteredStudents.reduce((sum, s) => sum + s.progressPercentage, 0) / filteredStudents.length)
    : 0;
  const completedCount = filteredStudents.filter(s => s.progressPercentage === 100).length;

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (progress >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Failed to load students. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your students and track their progress
        </p>
      </div>

      <StatsRow>
        <StatCard
          title="Total Students"
          value={totalStudents.toString()}
          change={{ value: '+12%', trend: 'up' }}
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Average Progress"
          value={`${averageProgress}%`}
          change={{ value: '+5%', trend: 'up' }}
          icon={TrendingUp}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Completed Courses"
          value={completedCount.toString()}
          icon={CheckCircle}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </StatsRow>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Students</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Courses</option>
                {coursesData?.map(course => (
                  <option key={course.id} value={String(course.id)}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Enrolled</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-foreground">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{student.courseTitle}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(student.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={student.progressPercentage} className="flex-1" />
                          <span className={`text-sm font-medium w-12 text-right ${getProgressColor(student.progressPercentage)}`}>
                            {student.progressPercentage}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No students found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}