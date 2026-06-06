"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@edutech/ui"
import { cn } from "../../lib/utils"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string | number
  children?: NavItem[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface NavSectionProps {
  items: NavItem[]
  groups?: NavGroup[]
}

export function NavSection({ items, groups }: NavSectionProps) {
  const pathname = usePathname()

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.label}
          className={cn(
            "relative rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out",
            "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
            // Collapsed mode: center icon, remove horizontal padding
            "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:justify-center",
            isActive && [
              "bg-sidebar-accent text-sidebar-accent-foreground",
              "after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-5 after:w-[3px] after:rounded-r-full after:bg-sidebar-primary",
              // In collapsed mode, change active indicator to a bottom dot or ring
              "group-data-[collapsible=icon]:after:left-1/2 group-data-[collapsible=icon]:after:top-auto group-data-[collapsible=icon]:after:bottom-0 group-data-[collapsible=icon]:after:-translate-x-1/2 group-data-[collapsible=icon]:after:translate-y-0 group-data-[collapsible=icon]:after:h-1.5 group-data-[collapsible=icon]:after:w-1.5 group-data-[collapsible=icon]:after:rounded-full",
              "hover:bg-sidebar-accent",
              "[&>svg]:text-sidebar-primary",
            ],
            !isActive && "text-sidebar-foreground/65 hover:text-sidebar-foreground"
          )}
        >
          <Link
            href={item.href}
            className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0 transition-colors duration-150",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/50"
              )}
            />
            <span className="truncate group-data-[collapsible=icon]:hidden">
              {item.label}
            </span>
          </Link>
        </SidebarMenuButton>
        {/* Badge — hidden in collapsed mode */}
        {item.badge && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary/10 px-1.5 text-[10px] font-semibold text-sidebar-primary tabular-nums group-data-[collapsible=icon]:hidden">
            {item.badge}
          </span>
        )}
      </SidebarMenuItem>
    )
  }

  if (groups) {
    return (
      <>
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="px-0">
            <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:text-center group-data-[collapsible=icon]:justify-center">
              {/* In collapsed mode, show first letter only */}
              <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
              <span className="hidden group-data-[collapsible=icon]:inline text-[10px]">
                {group.label.charAt(0)}
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map(renderNavItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </>
    )
  }

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map(renderNavItem)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
