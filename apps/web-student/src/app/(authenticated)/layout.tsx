'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardShell, useAuth } from '@edutech/shared-components';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Clock,
  CreditCard,
  Award,
  MessageCircle,
  Bell,
  User,
} from 'lucide-react';
import { BottomTabBar } from '@/components/BottomTabBar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/courses', label: 'Course Catalog', icon: BookOpen },
  { href: '/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/submissions', label: 'My Submissions', icon: ClipboardList },
  { href: '/dashboard/history', label: 'Watch History', icon: Clock },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/community', label: 'Community', icon: MessageCircle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (!isLoading && user && user.onboardingCompleted === false) {
      const allowedPaths = ['/onboarding', '/auth/login', '/auth/logout'];
      if (!allowedPaths.includes(pathname)) {
        router.push('/onboarding');
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  const activeLabel = navItems.find((item) => pathname === item.href || pathname?.startsWith(item.href + '/'))?.label || 'Dashboard';

  return (
    <>
      <DashboardShell
        brand={{ name: 'EduTech' }}
        navItems={navItems}
        user={{ name: 'Student' }}
        headerTitle={activeLabel}
        onLogout={() => {
          logout();
          window.location.href = '/auth/login';
        }}
      >
        {children}
      </DashboardShell>
      <BottomTabBar />
    </>
  );
}