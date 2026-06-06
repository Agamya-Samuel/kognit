"use client"

import { ArrowRight, BookOpen, CheckCircle2, Clock, Award, Compass, ClipboardList, Medal } from "lucide-react"
import { Card, CardContent, Skeleton } from "@edutech/ui"
import { MetricCard, MetricCardGrid } from "./MetricCard"
import { ActivityList } from "./ActivityList"
import { QuickActions } from "./QuickActions"
import Link from "next/link"

interface StudentDashboardMetrics {
  enrolledCourses: number
  completedCourses: number
  watchTime: number
  certificates: number
}

interface StudentDashboardProps {
  metrics?: StudentDashboardMetrics
  metricsLoading?: boolean
  recentActivity?: Array<{
    id: string
    message: string
    time: string
    status?: "success" | "error" | "info"
  }>
  inProgressCourses?: Array<{
    id: string
    title: string
    instructor: string
    progress: number
    lastWatched: string
  }>
}

export function StudentDashboard({
  metrics,
  metricsLoading,
  recentActivity = [],
  inProgressCourses = [],
}: StudentDashboardProps) {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <MetricCardGrid>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </MetricCardGrid>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    )
  }

  const metricsData = metrics || {
    enrolledCourses: 0,
    completedCourses: 0,
    watchTime: 0,
    certificates: 0,
  }

  const metricsList = [
    {
      label: "Enrolled Courses",
      value: metricsData.enrolledCourses,
      icon: <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      iconClassName: "bg-blue-500/10",
    },
    {
      label: "Completed",
      value: metricsData.completedCourses,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      iconClassName: "bg-emerald-500/10",
    },
    {
      label: "Watch Time",
      value: formatDuration(metricsData.watchTime),
      icon: <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      iconClassName: "bg-purple-500/10",
    },
    {
      label: "Certificates",
      value: metricsData.certificates,
      icon: <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      iconClassName: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Welcome back!
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
          Here&apos;s an overview of your learning progress.
        </p>
      </div>

      {/* Metrics Grid */}
      <MetricCardGrid>
        {metricsList.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </MetricCardGrid>

      {/* Two-column: Activity + Continue Learning */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ActivityList activities={recentActivity} className="h-full" />
        </div>

        <div className="lg:col-span-3">
          {inProgressCourses.length > 0 ? (
            <Card className="h-full">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Continue Learning</h3>
                <div className="space-y-4">
                  {inProgressCourses.slice(0, 3).map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground line-clamp-1">{course.title}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{course.instructor}</p>
                          <p className="text-xs text-muted-foreground mt-1">Last watched {course.lastWatched}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          {course.progress}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">No courses in progress</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Start learning by enrolling in a course from the catalog.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions
        actions={[
          { label: "Browse Courses", href: "/courses", variant: "default", icon: Compass },
          { label: "My Assignments", href: "/assignments", variant: "outline", icon: ClipboardList },
          { label: "Certificates", href: "/certificates", variant: "outline", icon: Medal },
        ]}
      />
    </div>
  )
}
