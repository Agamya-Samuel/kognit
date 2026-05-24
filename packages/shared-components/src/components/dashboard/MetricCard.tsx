"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

export function MetricCard({
  label,
  value,
  change,
  trend = "neutral",
  icon,
  className,
  ...props
}: MetricCardProps) {
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"

  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)} {...props}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {change && (
        <p className={cn("mt-1 text-xs", trendColor)}>
          {trend === "up" && "+"}{change} from last month
        </p>
      )}
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