'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@edutech/shared-components';
import { DashboardShell } from '@edutech/shared-components';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  Building2,
  Bell,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/institutions', label: 'Institutions', icon: Building2 },
  { href: '/dashboard/instructors', label: 'Instructors', icon: GraduationCap },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
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
      platform="Admin"
      platformColor="bg-blue-500"
      navItems={navItems}
      user={user ? { name: user.name, email: user.email } : { name: 'Admin' }}
      headerTitle={pageTitle}
      breadcrumb={{ items: getBreadcrumbItems() }}
      onLogout={() => {
        logout();
        router.push('/auth/login');
      }}
    >
      {children}
    </DashboardShell>
  );
}