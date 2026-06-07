'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner } from '@edutech/ui';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutions"
        description="Manage educational institutions"
      />

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
    </div>
  );
}