'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { DashboardShell } from '@edutech/shared-components';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  Settings,
  ClipboardList,
  Calendar,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: DollarSign },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardShell
      brand={{ name: 'EduTech' }}
      navItems={navItems}
      user={user ? { name: user.name, email: user.email } : { name: 'Instructor' }}
      headerTitle="Instructor Dashboard"
      onLogout={() => {
        logout();
        router.push('/auth/login');
      }}
    >
      {children}
    </DashboardShell>
  );
}