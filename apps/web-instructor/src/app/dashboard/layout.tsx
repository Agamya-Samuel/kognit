'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@edutech/shared-components';
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
import { Toaster } from 'sonner';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
      { href: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
      { href: '/dashboard/students', label: 'Students', icon: Users },
      { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: DollarSign },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const REQUIRED_ROLE = 'instructor';

const footerLinks = [
  { label: 'Help', href: '/help' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Documentation', href: '/docs', external: true },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    // Enforce role-based access: only instructor users may access the instructor portal
    if (!isLoading && user && user.role !== REQUIRED_ROLE) {
      logout();
      router.push(`/auth/login?error=${encodeURIComponent('Access denied. This portal is for instructors only.')}`);
    }
  }, [isAuthenticated, isLoading, user, router, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-muted-foreground" aria-hidden="true">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== REQUIRED_ROLE) {
    return null;
  }

  const getBreadcrumbItems = () => {
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'dashboard' && pathParts.length === 1) {
      return [{ label: 'Overview' }];
    }
    if (pathParts[0] === 'dashboard') {
      const section = pathParts[1]?.charAt(0).toUpperCase() + pathParts[1]?.slice(1) || 'Dashboard';
      return [
        { label: 'Overview', href: '/dashboard' },
        { label: section }
      ];
    }
    return pathParts.map((part, idx) => {
      const href = '/' + pathParts.slice(0, idx + 1).join('/');
      const isLast = idx === pathParts.length - 1;
      return {
        label: part.charAt(0).toUpperCase() + part.slice(1),
        href: isLast ? undefined : href,
      };
    });
  };

  const lastSegment = pathname.split('/').pop() || 'Dashboard'
  const pageTitle = pathname === '/dashboard' 
    ? 'Overview' 
    : lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

  return (
    <DashboardShell
      brand={{ name: 'EduTech' }}
      platform="Instructor"
      platformColor="bg-emerald-500"
      navGroups={navGroups}
      footerLinks={footerLinks}
      user={user ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl, role: user.role || 'Instructor' } : { name: 'Instructor', role: 'Instructor' }}
      headerTitle={pageTitle}
      breadcrumb={{ items: getBreadcrumbItems() }}
      onLogout={() => {
        logout();
        router.push('/auth/login');
      }}
    >
      {children}
      <Toaster richColors position="top-right" />
    </DashboardShell>
  );
}