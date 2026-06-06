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

interface DashboardSiteHeaderProps {
  breadcrumb?: {
    items: Array<{ label: string; href?: string }>
  }
  children?: React.ReactNode
}

export function DashboardSiteHeader({
  breadcrumb,
  children,
}: DashboardSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 backdrop-blur-sm transition-[width,height] duration-200 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 hover:bg-accent/60 rounded-lg transition-colors" />
        <Separator orientation="vertical" className="mr-2 h-4 opacity-40" />
        {breadcrumb && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.items.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <BreadcrumbSeparator className="opacity-40" />}
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-sm font-medium text-foreground">
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="ml-auto flex items-center gap-3 px-4">
        {children}
      </div>
    </header>
  )
}
