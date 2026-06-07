'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Field, FieldGroup, FieldLabel } from '@edutech/ui';
import { ChevronLeft, ChevronRight, Building2, Plus } from 'lucide-react';
import { adminService } from '@edutech/api-client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  // Create institution dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    institutionName: '',
    contactEmail: '',
    seatCount: 100,
    activeUntil: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getInstitutions({
        page,
        limit,
      }) as any;
      setInstitutions(result?.institutions ?? []);
      setTotal(result?.total ?? 0);
    } catch {
      setInstitutions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const totalPages = Math.ceil(total / limit);

  const closeCreateDialog = () => {
    setShowCreateDialog(false);
    setCreateForm({ institutionName: '', contactEmail: '', seatCount: 100, activeUntil: '' });
    setCreateError('');
    setCreateSuccess('');
  };

  const handleCreateInstitution = async () => {
    if (!createForm.institutionName.trim() || !createForm.contactEmail.trim() || !createForm.activeUntil) return;
    setIsCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      await adminService.createInstitution({
        institutionName: createForm.institutionName.trim(),
        contactEmail: createForm.contactEmail.trim(),
        seatCount: createForm.seatCount,
        activeUntil: createForm.activeUntil,
      });
      setCreateSuccess('Institution created successfully!');
      fetchInstitutions();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create institution. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Institutions"
          description="Manage educational institutions"
        />
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Institution
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Institutions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : institutions.length === 0 ? (
            <EmptyState
              title="No institutions"
              description="There are no institutions registered yet."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact Email</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact Phone</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Address</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created</th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {institutions.map((inst) => (
                      <tr key={inst.id} className="hover:bg-accent/50 transition-colors">
                        <td className="py-3 text-muted-foreground">
                          {inst.id}
                        </td>
                        <td className="py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {inst.institutionName}
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {inst.contactEmail}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {inst.contactPhone || '-'}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {inst.address ? `${inst.address.substring(0, 30)}${inst.address.length > 30 ? '...' : ''}` : '-'}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(inst.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/dashboard/institutions/${inst.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {showCreateDialog && (
        <Dialog open onOpenChange={(open) => { if (!open) closeCreateDialog(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Institution</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Add a new educational institution to the platform.
            </p>

            {createError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
                {createSuccess}
              </div>
            )}

            {!createSuccess && (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="inst-name">Institution Name</FieldLabel>
                  <Input
                    id="inst-name"
                    type="text"
                    value={createForm.institutionName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, institutionName: e.target.value })}
                    placeholder="e.g., MIT, Stanford University"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="inst-email">Contact Email</FieldLabel>
                  <Input
                    id="inst-email"
                    type="email"
                    value={createForm.contactEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
                    placeholder="admin@institution.edu"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="inst-seats">Seat Count</FieldLabel>
                    <Input
                      id="inst-seats"
                      type="number"
                      value={createForm.seatCount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, seatCount: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="inst-active">Active Until</FieldLabel>
                    <Input
                      id="inst-active"
                      type="date"
                      value={createForm.activeUntil}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, activeUntil: e.target.value })}
                    />
                  </Field>
                </div>
              </FieldGroup>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeCreateDialog}>
                {createSuccess ? 'Close' : 'Cancel'}
              </Button>
              {!createSuccess && (
                <Button
                  onClick={handleCreateInstitution}
                  disabled={!createForm.institutionName.trim() || !createForm.contactEmail.trim() || !createForm.activeUntil || isCreating}
                  isLoading={isCreating}
                >
                  Create Institution
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}