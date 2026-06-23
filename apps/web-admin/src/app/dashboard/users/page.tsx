'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

interface UsersResponse {
  users: User[];
  total: number;
}

const ROLES = ['all', 'student', 'instructor', 'admin', 'institution_admin'];

const USERS_QUERY_KEY = (page: number, limit: number, role: string, search: string) =>
  ['admin', 'users', { page, limit, role, search }] as const;

export default function UsersPage() {
  const queryClient = useQueryClient();

  // UI state (filters, selection) — kept as local useState. Server data
  // is owned by TanStack Query.
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Server state via TanStack Query. Replaces the useState+useEffect+fetch
  // pattern; automatic caching, refetching, and revalidation on filter change.
  const { data, isLoading } = useQuery({
    queryKey: USERS_QUERY_KEY(page, limit, roleFilter, search),
    queryFn: async (): Promise<UsersResponse> => {
      const params: Record<string, string | number> = { page, limit };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const result = (await adminService.getUsers(params)) as UsersResponse | null;
      return {
        users: result?.users ?? [],
        total: result?.total ?? 0,
      };
    },
    placeholderData: (prev) => prev, // keep previous list visible during refetch
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Helper that invalidates the users list after any mutation.
  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const toggleActive = useMutation({
    mutationFn: (user: User) => adminService.toggleUserActive(user.id),
    onSuccess: (_data, user) => {
      invalidateUsers();
      if (drawerOpen && selectedUser?.id === user.id) {
        setSelectedUser({ ...user, isActive: !user.isActive });
      }
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: (_data, { userId, role }) => {
      invalidateUsers();
      if (drawerOpen && selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, role } : prev));
      }
    },
  });

  const deleteUser = useMutation({
    mutationFn: (userId: number) => adminService.deleteUser(userId),
    onSuccess: () => {
      setDrawerOpen(false);
      setSelectedUser(null);
      invalidateUsers();
    },
  });

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
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    roleFilter === role
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
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
          {isLoading && !data ? (
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
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
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
                              onClick={() => toggleActive.mutate(user)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDrawer(user)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              title="Edit user"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteUser.mutate(user.id)}
                              className="rounded p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
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
        onRoleChange={(role: string) => selectedUser && updateRole.mutate({ userId: selectedUser.id, role })}
        onToggleActive={() => selectedUser && toggleActive.mutate(selectedUser)}
        onDelete={() => selectedUser && deleteUser.mutate(selectedUser.id)}
      />
    </div>
  );
}
