'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@edutech/shared-components';
import { DashboardShell } from '@edutech/shared-components';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/instructors', label: 'Instructors', icon: GraduationCap },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();

  return (
    <DashboardShell
      brand={{ name: 'EduTech Admin' }}
      navItems={navItems}
      user={{ name: 'Admin' }}
      headerTitle="Admin Dashboard"
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}