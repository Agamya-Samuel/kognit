'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Spinner, Badge, Button } from '@edutech/ui';
import { Building2, Mail, Phone, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { adminService } from '@edutech/api-client';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export default function InstitutionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInstitution();
    }
  }, [id]);

  const fetchInstitution = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getInstitution(id) as any;
      setInstitution(data);
    } catch {
      setError('Failed to load institution');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Institution Details"
          description={error || 'Institution not found'}
        />
        <Link href="/dashboard/institutions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={institution.institutionName}
          description={`Institution ID: ${institution.id}`}
        />
        <Link href="/dashboard/institutions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Institution Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Institution Name</p>
                <p className="text-sm text-muted-foreground">{institution.institutionName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Contact Email</p>
                <p className="text-sm text-muted-foreground">{institution.contactEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Contact Phone</p>
                <p className="text-sm text-muted-foreground">{institution.contactPhone || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{institution.address || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {institution.createdAt ? new Date(institution.createdAt).toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <Badge variant="secondary">-</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Active Enrollments</p>
                <Badge variant="secondary">-</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Courses Assigned</p>
                <Badge variant="secondary">-</Badge>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Student and enrollment statistics will be available once students are enrolled in this institution.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}