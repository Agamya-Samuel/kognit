"use client"

import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "@edutech/ui"
import { AppSidebar } from "./AppSidebar"
import { DashboardSiteHeader } from "./DashboardSiteHeader"
import type { NavItem, NavGroup, FooterLink } from "./NavSection"

export interface DashboardShellProps {
  brand: {
    name: string
    logo?: ReactNode
  }
  navItems?: NavItem[]
  navGroups?: NavGroup[]
  footerLinks?: FooterLink[]
  user: {
    name: string
    email?: string
    avatarUrl?: string
  }
  headerTitle: string
  breadcrumb?: {
    items: Array<{ label: string; href?: string }>
  }
  onLogout: () => void
  onProfile?: () => void
  onSettings?: () => void
  headerActions?: ReactNode
  children: ReactNode
}

export function DashboardShell({
  brand,
  navItems,
  navGroups,
  footerLinks,
  user,
  headerTitle: _headerTitle,
  breadcrumb,
  onLogout,
  onProfile,
  onSettings,
  headerActions,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        brand={brand}
        navItems={navItems}
        navGroups={navGroups}
        footerLinks={footerLinks}
        user={user}
        onLogout={onLogout}
      />
      <SidebarInset>
        <DashboardSiteHeader
          breadcrumb={breadcrumb}
          user={user}
          onLogout={onLogout}
          onProfile={onProfile}
          onSettings={onSettings}
        >
          {headerActions}
        </DashboardSiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}