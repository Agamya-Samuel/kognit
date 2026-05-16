'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Spinner } from '@edutech/ui';
import { Search, ChevronLeft, ChevronRight, UserCog, Trash2, Shield } from 'lucide-react';
import api from '@/lib/api';
import { UserDetailDrawer } from '@/components/UserDetailDrawer';

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
  page: number;
  limit: number;
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

      const { data } = await api.get<{ success: boolean; data: UsersResponse }>(
        '/admin/users',
        { params },
      );
      const result = data.data ?? data;
      setUsers(result.users ?? []);
      setTotal(result.total ?? 0);
    } catch {
      // Use empty state on error
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
      await api.patch(`/admin/users/${user.id}/toggle-active`);
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
      await api.patch(`/admin/users/${userId}/role`, { role });
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
      await api.delete(`/admin/users/${userId}`);
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
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {total} total users
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    roleFilter === role
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
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
            <p className="py-12 text-center text-gray-500">No users found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Name</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Email</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Role</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="pb-3 text-left font-medium text-gray-600 dark:text-gray-400">Joined</th>
                      <th className="pb-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs ${
                            user.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(user)}
                              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDrawer(user)}
                              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Edit user"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
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
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500">
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
