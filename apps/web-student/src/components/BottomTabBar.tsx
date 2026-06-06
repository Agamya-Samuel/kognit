'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, MessageCircle, Bell, User } from 'lucide-react';
import { Badge } from '@edutech/ui';
import { useUnreadCount } from '@/hooks/useNotifications';

export interface TabItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function BottomTabBar() {
  const pathname = usePathname();
  const { data: unreadCount } = useUnreadCount();
  const unreadCountValue = (unreadCount as any)?.count || 0;

  const tabs: TabItem[] = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/my-courses', label: 'My Courses', icon: BookOpen },
    { href: '/community', label: 'Community', icon: MessageCircle },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCountValue },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors"
            aria-label={tab.label}
          >
            <div className="relative">
              <Icon
                className={`h-5 w-5 transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              {tab.badge && tab.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-4 min-w-[16px] rounded-full px-1 text-[10px] leading-none"
                >
                  {tab.badge > 9 ? '9+' : tab.badge}
                </Badge>
              )}
            </div>
            <span
              className={`transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}