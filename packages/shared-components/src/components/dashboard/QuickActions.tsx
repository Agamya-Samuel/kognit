"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@edutech/ui"
import { Button } from "@edutech/ui"

export interface QuickAction {
  label: string
  href: string
  variant?: "default" | "outline" | "ghost"
}

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
}

export function QuickActions({ actions, title = "Quick Actions" }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant={action.variant || "default"}>{action.label}</Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}