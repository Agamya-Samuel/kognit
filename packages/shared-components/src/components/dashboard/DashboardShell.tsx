"use client"

import * as React from "react"
import type { ReactNode } from "lucide-react"
import { DashboardSidebar } from "./DashboardSidebar"
import { DashboardHeader } from "./DashboardHeader"
import { MobileSidebar } from "./MobileSidebar"
import type { NavItem } from "./NavSection"
import { cn } from "../../lib/utils"

export interface DashboardShellProps {
  brand: {
    name: string
    logo?: ReactNode
  }
  navItems: NavItem[]
  user: {
    name: string
    email?: string
    avatarUrl?: string
  }
  headerTitle: string
  onLogout: () => void
  onProfile?: () => void
  onSettings?: () => void
  headerActions?: ReactNode
  children: ReactNode
}

export function DashboardShell({
  brand,
  navItems,
  user,
  headerTitle,
  onLogout,
  onProfile,
  onSettings,
  headerActions,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        brand={brand}
        navItems={navItems}
        onLogout={onLogout}
      />

      <main className="lg:ml-[--sidebar-width]">
        <DashboardHeader
          title={headerTitle}
          user={user}
          onLogout={onLogout}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          onProfile={onProfile}
          onSettings={onSettings}
        >
          {headerActions}
        </DashboardHeader>
        <div className="p-6">{children}</div>
      </main>

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        brand={brand}
        navItems={navItems}
        onLogout={onLogout}
      />
    </div>
  )
}