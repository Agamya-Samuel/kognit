'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Textarea } from '@edutech/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useAssignment } from '@/hooks/useAssignments';
import { useUpdateAssignment } from '@/hooks/useAssignments';
import { Spinner } from '@edutech/ui';
import { toast } from 'sonner';

export default function EditAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: assignment, isLoading } = useAssignment(params.id);
  const { update, isPending: isUpdating } = useUpdateAssignment();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: 100,
    dueAt: '',
    lateWindowHours: 0,
    latePenaltyPercent: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Assignment not found</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await update(Number(params.id), formData);
    if (result.success) {
      toast.success('Assignment updated successfully!');
      router.push('/assignments');
    } else {
      toast.error(result.error || 'Failed to update assignment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Assignment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Assignment ID: {params.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Assignment title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the assignment..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxScore">Max Score *</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="1"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueAt">Due Date *</Label>
                <Input
                  id="dueAt"
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lateWindowHours">Late Window (hours)</Label>
                <Input
                  id="lateWindowHours"
                  type="number"
                  min="0"
                  value={formData.lateWindowHours}
                  onChange={(e) => setFormData({ ...formData, lateWindowHours: Number(e.target.value) })}
                  placeholder="0 for no late submissions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latePenaltyPercent">Late Penalty (%)</Label>
                <Input
                  id="latePenaltyPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.latePenaltyPercent}
                  onChange={(e) => setFormData({ ...formData, latePenaltyPercent: Number(e.target.value) })}
                  placeholder="Percentage to deduct"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="h-4 w-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}