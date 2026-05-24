"use client"

import * as React from "react"
import { Badge } from "@edutech/ui"
import { cn } from "../../lib/utils"

export type StatusVariant = "success" | "warning" | "error" | "info" | "neutral"

interface StatusBadgeProps {
  status: string | StatusVariant
  label?: string
  className?: string
}

const statusConfig: Record<StatusVariant, { color: string; label?: string }> = {
  success: { color: "bg-success/10 text-success border-success/20", label: "Active" },
  warning: { color: "bg-warning/10 text-warning border-warning/20", label: "Warning" },
  error: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Error" },
  info: { color: "bg-info/10 text-info border-info/20", label: "Info" },
  neutral: { color: "bg-muted text-muted-foreground border-border", label: "Neutral" },
}

const variantMapping: Record<string, StatusVariant> = {
  active: "success",
  completed: "success",
  verified: "success",
  paid: "success",
  pending: "warning",
  warning: "warning",
  failed: "error",
  error: "error",
  rejected: "error",
  cancelled: "error",
  inactive: "error",
  unverified: "error",
  info: "info",
  neutral: "neutral",
  draft: "neutral",
  archived: "neutral",
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant: StatusVariant = variantMapping[status.toLowerCase()] || "neutral"
  const config = statusConfig[variant]
  const displayLabel = label || config.label || status

  return (
    <Badge className={cn(config.color, className)}>{displayLabel}</Badge>
  )
}