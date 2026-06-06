"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon?: LucideIcon
  iconClassName?: string
  className?: string
}

export function StatCard({ title, value, change, icon: Icon, iconClassName, className }: StatCardProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-emerald-600 dark:text-emerald-400"
      case "down":
        return "text-rose-600 dark:text-rose-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↑"
      case "down":
        return "↓"
      default:
        return "→"
    }
  }

  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className={cn("rounded-md bg-primary/10 p-2", iconClassName)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {change && (
          <p className={cn("mt-1 text-xs font-medium", getTrendColor(change.trend))}>
            {getTrendIcon(change.trend)} {change.value}
          </p>
        )}
      </div>
    </div>
  )
}

interface StatsRowProps {
  children: React.ReactNode
  className?: string
}

export function StatsRow({ children, className }: StatsRowProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  )
}
