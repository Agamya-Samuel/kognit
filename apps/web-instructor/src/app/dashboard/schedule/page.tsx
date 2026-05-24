'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Spinner } from '@edutech/ui';
import { Plus, Calendar as CalendarIcon, Clock, Users, Video, Eye, Edit } from 'lucide-react';
import { useUpcomingClasses } from '@/hooks/useCourses';
import { useInstructorSchedule } from '@/hooks/useSchedule';

export default function SchedulePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: upcomingClasses, isLoading } = useUpcomingClasses();
  const { data: calendarEvents } = useInstructorSchedule();

  const scheduledClasses = upcomingClasses || [];
  const calendarData = calendarEvents || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your live class schedule and upcoming sessions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Class
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Calendar component coming soon
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{scheduledClasses.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrolled</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {scheduledClasses.reduce((acc, cls: any) => acc + (cls.enrolledCount || 0), 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {calendarData.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledClasses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No upcoming classes scheduled
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledClasses.map((cls: any) => (
                    <div
                      key={cls.id}
                      className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{cls.title}</h3>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(cls.time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(cls.time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{cls.enrolledCount || 0} enrolled</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:text-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-700">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Schedule Live Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Class Title</Label>
                <Input id="title" placeholder="Enter class title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a course</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" defaultValue={60} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button>Schedule Class</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}