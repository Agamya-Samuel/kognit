"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@edutech/ui"
import { cn } from "../../lib/utils"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string | number
  children?: NavItem[]
}

interface NavSectionProps {
  items: NavItem[]
}

export function NavSection({ items }: NavSectionProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1 px-3">
      {items.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="flex-1">{item.label}</span>
            {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
          </Link>
        )
      })}
    </nav>
  )
}