"use client"

import * as React from "react"
import { ArrowRight, BookOpen, CheckCircle2, Clock, Award } from "lucide-react"
import { Card, CardContent } from "@edutech/ui"
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
          <Skeleton className="h-4 w-96" />
        </div>
        <MetricCardGrid>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg border bg-muted animate-pulse" />
          ))}
        </MetricCardGrid>
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
    { label: "Enrolled Courses", value: metricsData.enrolledCourses, icon: BookOpen, trend: "neutral" as const },
    { label: "Completed", value: metricsData.completedCourses, icon: CheckCircle2, trend: "neutral" as const },
    { label: "Watch Time", value: formatDuration(metricsData.watchTime), icon: Clock, trend: "neutral" as const },
    { label: "Certificates", value: metricsData.certificates, icon: Award, trend: "neutral" as const },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="mt-2 text-muted-foreground">Here's an overview of your learning progress.</p>
      </div>

      <MetricCardGrid>
        {metricsList.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </MetricCardGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityList activities={recentActivity} />

        {inProgressCourses.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Continue Learning</h3>
              <div className="space-y-4">
                {inProgressCourses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block hover:bg-accent rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                        <p className="text-xs text-muted-foreground mt-1">Last watched {course.lastWatched}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <QuickActions
        actions={[
          { label: "Browse Courses", href: "/courses", variant: "default" },
          { label: "My Assignments", href: "/assignments", variant: "outline" },
          { label: "Certificates", href: "/certificates", variant: "outline" },
        ]}
      />
    </div>
  )
}