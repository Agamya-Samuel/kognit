'use client';

import { Button, Separator } from '@edutech/ui';
import { X, Shield, Trash2, Mail, Calendar, CheckCircle2 } from 'lucide-react';

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
}

interface UserDetailDrawerProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onRoleChange: (role: string) => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

const ROLES = ['student', 'instructor', 'admin', 'institution_admin'];

export function UserDetailDrawer({ user, open, onClose, onRoleChange, onToggleActive, onDelete }: UserDetailDrawerProps) {
  if (!open || !user) return null;

  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'instructor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'institution_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-96 overflow-y-auto border-l border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
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
              <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
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
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Role selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    user.role === role
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
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
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
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
