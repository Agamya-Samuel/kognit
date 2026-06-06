'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Spinner } from '@edutech/ui';
import { Search, ChevronLeft, ChevronRight, UserCog, Trash2, Shield } from 'lucide-react';
import { adminService } from '@edutech/api-client';
import { UserDetailDrawer } from '@/components/UserDetailDrawer';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
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
}

const ROLES = ['all', 'student', 'instructor', 'admin', 'institution_admin'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;

const result = await adminService.getUsers(params);
      setUsers(result?.users ?? []);
      setTotal(result?.total ?? 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(total / limit);

  const handleToggleActive = async (user: User) => {
    try {
      await adminService.toggleUserActive(user.id);
      fetchUsers();
      if (drawerOpen && selectedUser?.id === user.id) {
        setSelectedUser({ ...user, isActive: !user.isActive });
      }
    } catch {
      // Silently fail — UI stays consistent
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await adminService.updateUserRole(userId, role);
      fetchUsers();
      if (drawerOpen && selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser!, role });
      }
    } catch {
      // Silently fail
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await adminService.deleteUser(userId);
      setDrawerOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      // Silently fail
    }
  };

  const openDrawer = (user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
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
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description={`${total} total users`}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground")} />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => { setRoleFilter(role); setPage(1); }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    roleFilter === role
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {role === 'all' ? 'All' : role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="There are no users matching your filters."
              action={{ label: 'Clear Filters', onClick: () => { setSearch(''); setRoleFilter('all'); } }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Name</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Email</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Role</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Joined</th>
                      <th className="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                        <td className="py-3 font-medium text-foreground">
                          {user.name}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-3">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", roleColor(user.role))}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={cn("inline-flex items-center gap-1.5 text-xs",
                            user.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                          )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", user.isActive ? 'bg-emerald-500' : 'bg-destructive')} />
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(user)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-accent"
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDrawer(user)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-accent"
                              title="Edit user"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedUser(null); }}
        onRoleChange={(role: string) => selectedUser && handleUpdateRole(selectedUser.id, role)}
        onToggleActive={() => selectedUser && handleToggleActive(selectedUser)}
        onDelete={() => selectedUser && handleDelete(selectedUser.id)}
      />
    </div>
  );
}
