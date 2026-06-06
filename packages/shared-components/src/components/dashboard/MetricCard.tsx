"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  iconClassName?: string
}

export function MetricCard({
  label,
  value,
  change,
  trend = "neutral",
  icon,
  iconClassName,
  className,
  ...props
}: MetricCardProps) {
  const trendColor = trend === "up" ? "text-emerald-600 dark:text-emerald-400" : trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"

  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md", className)} {...props}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <div className={cn("rounded-md p-2", iconClassName || "bg-muted")}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {change && (
          <p className={cn("mt-1 text-xs font-medium", trendColor)}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {change}
          </p>
        )}
      </div>
    </div>
  )
}

interface MetricCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function MetricCardGrid({ children, className, ...props }: MetricCardGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)} {...props}>
      {children}
    </div>
  )
}
