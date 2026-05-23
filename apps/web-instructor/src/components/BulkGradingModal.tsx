'use client';

import { useState } from 'react';
import { useGrading } from '@/hooks/useGrading';
import { toast } from 'sonner';

interface BulkGradingModalProps {
  submissions: Array<{ id: number; studentName: string; maxScore: number }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkGradingModal({ submissions, isOpen, onClose, onSuccess }: BulkGradingModalProps) {
  const { bulkGrade, isLoading } = useGrading();
  const [grades, setGrades] = useState<Record<number, { score: number; feedback: string }>>({});
  const [selectAll, setSelectAll] = useState(false);

  const selectedSubmissionIds = Object.keys(grades).map(Number);

  const handleSelectAll = () => {
    if (selectAll) {
      setGrades({});
    } else {
      setGrades(
        submissions.reduce((acc, sub) => {
          acc[sub.id] = { score: sub.maxScore, feedback: '' };
          return acc;
        }, {} as Record<number, { score: number; feedback: string }>)
      );
    }
    setSelectAll(!selectAll);
  };

  const handleGradeChange = (submissionId: number, score: number) => {
    setGrades((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], score },
    }));
  };

  const handleFeedbackChange = (submissionId: number, feedback: string) => {
    setGrades((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], feedback },
    }));
  };

  const handleSubmit = async () => {
    const bulkGradeData = {
      grades: selectedSubmissionIds.map((id) => ({
        submissionId: id,
        score: grades[id].score,
        feedback: grades[id].feedback || undefined,
      })),
    };

    const result = await bulkGrade(bulkGradeData);
    if (result.success) {
      toast.success(`Successfully graded ${result.results.length} submissions!`);
      onSuccess();
      onClose();
      setGrades({});
      setSelectAll(false);
    } else {
      toast.error(`Failed to grade some submissions. Errors: ${result.errors.join(', ')}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border bg-card shadow-lg">
        <div className="sticky top-0 border-b bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Bulk Grade Submissions</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-accent"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedSubmissionIds.length} of {submissions.length} submissions selected
          </p>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                disabled={isLoading}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">Select All</span>
            </label>
          </div>

          <div className="space-y-4">
            {submissions.map((submission) => {
              const isSelected = selectedSubmissionIds.includes(submission.id);
              const grade = grades[submission.id];

              return (
                <div
                  key={submission.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setGrades((prev) => {
                              const next = { ...prev };
                              delete next[submission.id];
                              return next;
                            });
                          } else {
                            setGrades((prev) => ({
                              ...prev,
                              [submission.id]: { score: submission.maxScore, feedback: '' },
                            }));
                          }
                        }}
                        disabled={isLoading}
                        className="rounded border-input"
                      />
                      <div>
                        <div className="font-medium">{submission.studentName}</div>
                        <div className="text-sm text-muted-foreground">Max score: {submission.maxScore}</div>
                      </div>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={submission.maxScore}
                        value={grade?.score ?? submission.maxScore}
                        onChange={(e) => handleGradeChange(submission.id, Number(e.target.value))}
                        disabled={!isSelected || isLoading}
                        className="w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">/ {submission.maxScore}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4">
                      <textarea
                        value={grade?.feedback ?? ''}
                        onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                        placeholder="Add feedback (optional)..."
                        rows={2}
                        disabled={isLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 border-t bg-card p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedSubmissionIds.length === 0 || isLoading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Grading...' : `Grade ${selectedSubmissionIds.length} Submissions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}