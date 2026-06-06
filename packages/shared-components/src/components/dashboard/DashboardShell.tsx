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
  /** Short platform label shown in sidebar (e.g. "Admin", "Instructor", "Student") */
  platform?: string
  /** Platform accent color for the badge dot (e.g. "bg-blue-500", "bg-emerald-500") */
  platformColor?: string
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
  platform,
  platformColor,
  navItems,
  navGroups,
  footerLinks,
  user,
  headerTitle: _headerTitle,
  breadcrumb,
  onLogout,
  headerActions,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        brand={brand}
        platform={platform}
        platformColor={platformColor}
        navItems={navItems}
        navGroups={navGroups}
        footerLinks={footerLinks}
        user={user}
        onLogout={onLogout}
      />
      <SidebarInset>
        <DashboardSiteHeader breadcrumb={breadcrumb}>
          {headerActions}
        </DashboardSiteHeader>
        <div className="flex flex-1 flex-col px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <div className="@container/main flex flex-1 flex-col">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
