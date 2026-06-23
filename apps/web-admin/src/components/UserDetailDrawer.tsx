'use client';

import { useState, useEffect } from 'react';

import { Button, Separator } from '@edutech/ui';
import { PhoneInput } from '@edutech/ui';
import { X, Shield, Trash2, Mail, Calendar, CheckCircle2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  mobile?: string | null;
  approvalStatus?: string;
  onboardingCompleted?: boolean;
  affiliatedInstituteId?: number | null;
  studentProfile?: {
    affiliatedInstituteId?: number | null;
  };
}

interface UserDetailDrawerProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onRoleChange: (role: string) => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onMobileChange?: (mobile: string) => void;
}

const ROLES = ['student', 'instructor', 'admin', 'institution_admin'];

export function UserDetailDrawer({ user, open, onClose, onRoleChange, onToggleActive, onDelete, onMobileChange }: UserDetailDrawerProps) {
  if (!open || !user) return null;

  const [mobile, setMobile] = useState('');

  useEffect(() => {
    if (user) {
      setMobile(user.mobile || '');
    }
  }, [user]);

  const handleMobileChange = (value?: string) => {
    const mobileValue = value || '';
    setMobile(mobileValue);
    onMobileChange?.(mobileValue);
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'instructor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'institution_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 h-full w-96 overflow-y-auto border-l border-border bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="User details"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            User Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close user details"
            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${roleColor(user.role)}`}>
              {user.role.replace('_', ' ')}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              user.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            {user.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
            {user.role === 'student' && user.approvalStatus && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                user.approvalStatus === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  : user.approvalStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {user.approvalStatus}
              </span>
            )}
            {user.role === 'student' && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                user.onboardingCompleted
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              }`}>
                {user.onboardingCompleted ? 'Onboarding Done' : 'Onboarding Pending'}
              </span>
            )}
            {(user.affiliatedInstituteId || user.studentProfile?.affiliatedInstituteId) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Inst #{user.affiliatedInstituteId || user.studentProfile?.affiliatedInstituteId}
              </span>
            )}
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {user.mobile || 'No mobile number'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Role selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Role
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    user.role === role
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Mobile Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Mobile Number
            </label>
            <PhoneInput
              value={mobile}
              onChange={handleMobileChange}
              placeholder="Enter phone number"
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={onToggleActive}
            >
              <Shield className="mr-2 h-4 w-4" />
              {user.isActive ? 'Deactivate User' : 'Activate User'}
            </Button>

            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
