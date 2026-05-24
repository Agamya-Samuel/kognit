"use client"

import * as React from "react"
import { Separator } from "@edutech/ui"
import { SidebarTrigger } from "@edutech/ui"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@edutech/ui"
import { UserMenu } from "./UserSection"

interface DashboardSiteHeaderProps {
  breadcrumb?: {
    items: Array<{ label: string; href?: string }>
  }
  user: {
    name: string
    email?: string
    avatarUrl?: string
  }
  onLogout: () => void
  onProfile?: () => void
  onSettings?: () => void
  children?: React.ReactNode
}

export function DashboardSiteHeader({
  breadcrumb,
  user,
  onLogout,
  onProfile,
  onSettings,
  children,
}: DashboardSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] duration-200 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {breadcrumb && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.items.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="ml-auto flex items-center gap-4 px-4">
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
