"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { Button } from "@edutech/ui"
import { NavSection, type NavItem } from "./NavSection"
import { cn } from "../../lib/utils"

interface DashboardSidebarProps {
  brand: {
    name: string
    logo?: React.ReactNode
  }
  navItems: NavItem[]
  onLogout: () => void
}

export function DashboardSidebar({ brand, navItems, onLogout }: DashboardSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[--sidebar-width] border-r bg-card lg:block">
      <div className="flex h-16 items-center justify-between border-b px-6">
        {brand.logo ? (
          brand.logo
        ) : (
          <h1 className="text-xl font-bold text-foreground">{brand.name}</h1>
        )}
      </div>

      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          <NavSection items={navItems} />
        </div>

        <div className="border-t p-4">
          <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}