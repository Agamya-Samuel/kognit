"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@edutech/ui"
import { Button } from "@edutech/ui"
import { NavSection, type NavItem } from "./NavSection"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
  brand: {
    name: string
    logo?: React.ReactNode
  }
  navItems: NavItem[]
  onLogout: () => void
}

export function MobileSidebar({ open, onClose, brand, navItems, onLogout }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[--sidebar-width] p-0">
        <SheetHeader className="border-b px-6 py-4">
          {brand.logo ? (
            brand.logo
          ) : (
            <SheetTitle className="text-xl font-bold">{brand.name}</SheetTitle>
          )}
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  )
}