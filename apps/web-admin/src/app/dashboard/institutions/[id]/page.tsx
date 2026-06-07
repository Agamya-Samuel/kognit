'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Spinner, Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Field, FieldGroup, FieldLabel, FieldDescription } from '@edutech/ui';
import { Building2, Mail, Calendar, ArrowLeft, Upload, FileText, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '@edutech/api-client';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

interface ImportError {
  row: number;
  email: string;
  reason: string;
}

interface ImportResult {
  successCount: number;
  failureCount: number;
  errors: ImportError[];
}

export default function InstitutionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CSV Import state
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const parseCSV = (text: string): { name: string; email: string }[] => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];

    // Skip header row if present
    const firstLine = lines[0].toLowerCase();
    const startIndex = (firstLine.includes('name') || firstLine.includes('email')) ? 1 : 0;

    const students: { name: string; email: string }[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Support both comma and tab separated
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        students.push({
          name: parts[0].trim().replace(/^["']|["']$/g, ''),
          email: parts[1].trim().replace(/^["']|["']$/g, ''),
        });
      }
    }
    return students;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setImportError('Please upload a .csv or .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setImportError('');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setImportError('Please upload a CSV file or paste student data.');
      return;
    }

    const students = parseCSV(csvText);
    if (students.length === 0) {
      setImportError('No valid student records found. Ensure the CSV has "name" and "email" columns.');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportResult(null);

    try {
      const result = await adminService.importStudents(id, students) as any;
      setImportResult({
        successCount: result.successCount ?? 0,
        failureCount: result.failureCount ?? 0,
        errors: result.errors ?? [],
      });
    } catch (err: any) {
      setImportError(err.response?.data?.message || 'Failed to import students. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const closeImportDialog = () => {
    setShowImportDialog(false);
    setCsvText('');
    setImportError('');
    setImportResult(null);
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
        <div className="flex gap-2">
          <Button onClick={() => setShowImportDialog(true)} size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import Students
          </Button>
          <Link href="/dashboard/institutions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
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
                <p className="text-sm text-muted-foreground">Seat Count</p>
                <Badge variant="secondary">{institution.seatCount ?? '-'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Active Until</p>
                <Badge variant="secondary">
                  {institution.activeUntil ? new Date(institution.activeUntil).toLocaleDateString() : '-'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <Badge variant="secondary">-</Badge>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Student and enrollment statistics will be available once students are enrolled in this institution.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CSV Import Dialog */}
      {showImportDialog && (
        <Dialog open onOpenChange={(open) => { if (!open) closeImportDialog(); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Import Students</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Import students to <span className="font-medium">{institution.institutionName}</span>. Upload a CSV file with <code className="rounded bg-muted px-1 py-0.5 text-xs">name</code> and <code className="rounded bg-muted px-1 py-0.5 text-xs">email</code> columns.
            </p>

            {importError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {importError}
              </div>
            )}

            {importResult ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-medium mb-3">Import Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">{importResult.successCount}</p>
                        <p className="text-xs text-muted-foreground">Successfully Imported</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="text-2xl font-bold text-destructive">{importResult.failureCount}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Error Details
                    </h4>
                    <div className="max-h-48 overflow-y-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {importResult.errors.map((err, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-muted-foreground">{err.row}</td>
                              <td className="px-3 py-2 text-muted-foreground">{err.email || '-'}</td>
                              <td className="px-3 py-2 text-destructive">{err.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Imported students will receive activation emails with a link to set their password and complete their profile.
                </p>
              </div>
            ) : (
              <FieldGroup>
                <Field>
                  <FieldLabel>Upload CSV File</FieldLabel>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} type="button">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      or paste CSV data below
                    </span>
                  </div>
                  <FieldDescription className="text-xs">
                    CSV format: <code>name,email</code> (header row optional). One student per line.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="csv-text">CSV Data</FieldLabel>
                  <textarea
                    id="csv-text"
                    value={csvText}
                    onChange={(e) => { setCsvText(e.target.value); setImportError(''); }}
                    placeholder={`name,email\nJohn Smith,john@example.com\nJane Doe,jane@example.com`}
                    className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={8}
                  />
                  {csvText.trim() && (
                    <FieldDescription className="text-xs">
                      {parseCSV(csvText).length} student(s) detected
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeImportDialog}>
                {importResult ? 'Close' : 'Cancel'}
              </Button>
              {!importResult && (
                <Button
                  onClick={handleImport}
                  disabled={!csvText.trim() || isImporting}
                  isLoading={isImporting}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Import Students
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
