"use client"

import { Clock, CheckCircle2, XCircle } from "lucide-react"
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
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status?: ActivityItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "info":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
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
              <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}