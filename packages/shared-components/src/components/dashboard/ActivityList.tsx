"use client"

import { Clock, CheckCircle2, XCircle, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@edutech/ui"

export interface ActivityItem {
  id: string
  message: string
  time: string
  status?: "success" | "error" | "info"
}

interface ActivityListProps {
  activities: ActivityItem[]
  title?: string
  className?: string
}

export function ActivityList({ activities, title = "Recent Activity", className }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">Your activity will appear here once you get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status?: ActivityItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
      case "info":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBg = (status?: ActivityItem["status"]) => {
    switch (status) {
      case "success":
        return "bg-emerald-500/10"
      case "error":
        return "bg-rose-500/10"
      default:
        return "bg-muted"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className={`rounded-full p-1.5 mt-0.5 ${getStatusBg(activity.status)}`}>
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
