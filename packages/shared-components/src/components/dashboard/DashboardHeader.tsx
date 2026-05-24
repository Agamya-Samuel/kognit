"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@edutech/ui"
import { UserMenu } from "./UserSection"
import { cn } from "../../lib/utils"

interface DashboardHeaderProps {
  title: string
  user: {
    name: string
    email?: string
    avatarUrl?: string
  }
  onLogout: () => void
  onMobileMenuToggle: () => void
  onProfile?: () => void
  onSettings?: () => void
  children?: React.ReactNode
}

export function DashboardHeader({
  title,
  user,
  onLogout,
  onMobileMenuToggle,
  onProfile,
  onSettings,
  children,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {children}
        <UserMenu
          user={user}
          onLogout={onLogout}
          onProfile={onProfile}
          onSettings={onSettings}
        />
      </div>
    </header>
  )
}