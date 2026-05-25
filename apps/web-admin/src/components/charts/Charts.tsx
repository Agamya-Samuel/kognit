"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; costs: number }>
  className?: string
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350} className={cn(className)}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} />
            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs text-muted-foreground" />
        <YAxis className="text-xs text-muted-foreground" />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          fill="url(#revenueGradient)"
          fillOpacity={1}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="costs"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          name="Costs"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface EnrollmentChartProps {
  data: Array<{ month: string; enrolled: number; completed: number }>
  className?: string
}

export function EnrollmentChart({ data, className }: EnrollmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350} className={cn(className)}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs text-muted-foreground" />
        <YAxis className="text-xs text-muted-foreground" />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Bar dataKey="enrolled" fill="hsl(var(--primary))" name="Enrolled" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" fill="hsl(var(--success))" name="Completed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface EngagementChartProps {
  data: Array<{ date: string; views: number; interactions: number }>
  className?: string
}

export function EngagementChart({ data, className }: EngagementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350} className={cn(className)}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs text-muted-foreground" />
        <YAxis className="text-xs text-muted-foreground" />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="views"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Views"
          dot={{ fill: "hsl(var(--primary))" }}
        />
        <Line
          type="monotone"
          dataKey="interactions"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          name="Interactions"
          dot={{ fill: "hsl(var(--accent))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface ProgressChartProps {
  data: Array<{ name: string; value: number }>
  className?: string
}

export function ProgressChart({ data, className }: ProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350} className={cn(className)}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" className="text-xs text-muted-foreground" />
        <YAxis dataKey="name" type="category" className="text-xs text-muted-foreground" width={100} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="value" fill="hsl(var(--primary))" name="Progress" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}