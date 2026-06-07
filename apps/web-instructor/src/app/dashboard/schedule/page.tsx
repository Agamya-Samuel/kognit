'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@edutech/ui';
import { Plus, Calendar as CalendarIcon, Clock, Users, Video, Eye, Edit, AlertCircle } from 'lucide-react';
import { useUpcomingClasses, useMyCourses } from '@/hooks/useCourses';
import { useInstructorSchedule } from '@/hooks/useSchedule';
import { StatCard, StatsRow } from '@/components/StatsRow';

export default function SchedulePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: upcomingClasses, isLoading } = useUpcomingClasses();
  const { data: calendarEvents } = useInstructorSchedule();
  const { data: myCourses } = useMyCourses();

  const scheduledClasses = upcomingClasses || [];
  const calendarData = calendarEvents || [];
  const courses = Array.isArray(myCourses) ? myCourses : [];

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

  const thisWeekCount = calendarData.filter((event: any) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= weekFromNow;
  }).length;

  const totalEnrolled = scheduledClasses.reduce((acc, cls: any) => acc + (cls.enrolledCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your live class schedule and upcoming sessions
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Live Class</DialogTitle>
              <DialogDescription>Create a new live class session for your students.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Class Title</Label>
                <Input id="title" placeholder="Enter class title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select>
                  <SelectTrigger id="course">
                    <SelectValue placeholder={courses.length > 0 ? 'Select a course' : 'No courses available'} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length > 0 ? (
                      courses.map((course: any) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          No courses found. Create a course first.
                        </div>
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {courses.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Note: Scheduling requires a live lecture to be set up in the course curriculum.
                  </p>
                )}
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
                <Button onClick={() => setShowCreateModal(false)}>Schedule Class</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <StatsRow>
        <StatCard
          title="Total Scheduled"
          value={scheduledClasses.length.toString()}
          icon={CalendarIcon}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Total Enrolled"
          value={totalEnrolled.toString()}
          icon={Users}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="This Week"
          value={thisWeekCount.toString()}
          icon={Video}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </StatsRow>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          </CardContent>
        </Card>
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
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  Calendar component coming soon
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mb-2" />
                    <p>No upcoming classes scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledClasses.slice(0, 5).map((cls: any) => (
                      <div
                        key={cls.id}
                        className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                      >
                        <h3 className="font-medium text-foreground">{cls.title}</h3>
                        <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>{formatDate(cls.time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatTime(cls.time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{cls.enrolledCount || 0} enrolled</span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Scheduled Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mb-2" />
                  <p>No upcoming classes scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledClasses.map((cls: any) => (
                    <div
                      key={cls.id}
                      className="flex items-start justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{cls.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}