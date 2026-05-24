'use client';

import type { ReactNode } from 'react';
import { DashboardShell } from '@edutech/shared-components';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Clock,
  CreditCard,
  Award,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/history', label: 'Watch History', icon: Clock },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/certificates', label: 'Certificates', icon: Award },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      brand={{ name: 'EduTech' }}
      navItems={navItems}
      user={{ name: 'Student' }}
      headerTitle="Student Dashboard"
      onLogout={() => {
        // TODO: Implement logout
      }}
    >
      {children}
    </DashboardShell>
  );
}