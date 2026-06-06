"use client"

import * as React from "react"
import { LogOut, ExternalLink, ChevronsUpDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Avatar,
} from "@edutech/ui"
import { NavSection, type NavItem, type NavGroup, type FooterLink } from "./NavSection"
import Link from "next/link"
import { cn } from "../../lib/utils"

interface AppSidebarProps {
  brand: {
    name: string
    logo?: React.ReactNode
  }
  /** Short platform label shown in sidebar (e.g. "Admin", "Instructor", "Student") */
  platform?: string
  /** Platform accent color for the badge dot (e.g. "bg-blue-500", "bg-emerald-500") */
  platformColor?: string
  navItems?: NavItem[]
  navGroups?: NavGroup[]
  footerLinks?: FooterLink[]
  user?: {
    name: string
    email?: string
    avatarUrl?: string
    role?: string
  }
  onLogout: () => void
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export function AppSidebar({
  brand,
  platform,
  platformColor,
  navItems,
  navGroups,
  footerLinks,
  user,
  onLogout,
  variant = "inset",
  collapsible = "icon",
}: AppSidebarProps) {
  return (
    <Sidebar variant={variant} collapsible={collapsible}>
      {/* Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border/60 pb-3 pt-3 px-3 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:pb-2 group-data-[collapsible=icon]:pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip={platform ? `${brand.name} – ${platform}` : brand.name}
            >
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                {/* Logo */}
                {brand.logo ? (
                  brand.logo
                ) : (
                  <div className="relative flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20 transition-transform duration-200 group-hover:scale-105 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg">
                    <span className="text-sm font-bold tracking-tight">
                      {brand.name.charAt(0)}
                    </span>
                    {/* Platform dot indicator — always visible */}
                    {platformColor && (
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-sidebar",
                          platformColor
                        )}
                      />
                    )}
                  </div>
                )}
                {/* Brand text — hidden when collapsed */}
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-bold tracking-tight text-sidebar-foreground">
                    {brand.name}
                  </span>
                  {platform && (
                    <span className="truncate text-[11px] font-medium text-sidebar-foreground/50">
                      {platform}
                    </span>
                  )}
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-2 pt-2 group-data-[collapsible=icon]:px-1">
        <NavSection items={navItems || []} groups={navGroups} />

        {footerLinks && footerLinks.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Links
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {footerLinks.map((link, idx) => (
                  <SidebarMenuItem key={idx}>
                    <SidebarMenuButton asChild tooltip={link.label}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{link.label}</span>
                        {link.external && <ExternalLink className="size-3.5 opacity-50" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: User Avatar with Dropdown */}
      <SidebarFooter className="border-t border-sidebar-border/60 px-2 pt-3 pb-2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pt-2">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="gap-3 rounded-xl p-2.5 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
                    tooltip={user.name}
                  >
                    {/* Avatar — shows image when available, falls back to initials */}
                    <Avatar
                      src={user.avatarUrl ?? null}
                      alt={user.name}
                      fallback={user.name}
                      size="sm"
                      className="size-9 shrink-0 shadow-sm group-data-[collapsible=icon]:size-8"
                    />
                    {/* User info */}
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-sidebar-foreground">
                        {user.name}
                      </span>
                      <span className="truncate text-[11px] text-sidebar-foreground/50">
                        {user.role || "Student"}
                      </span>
                    </div>
                    {/* Expand/collapse indicator (like shadcn reference) */}
                    <ChevronsUpDown className="size-4 text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user.name}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                      {user.role && (
                        <p className="text-xs text-muted-foreground/70">{user.role}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
