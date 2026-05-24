import { useState } from 'react';
import type { Submission } from '@edutech/types';

interface GradingFormProps {
  submission: Submission;
  maxScore: number;
  onSubmit: (score: number, feedback: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GradingForm({ submission, maxScore, onSubmit, onCancel, isLoading = false }: GradingFormProps) {
  const [score, setScore] = useState(submission.score || 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(score, feedback);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Grade Submission</h3>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Score (out of {maxScore})
          </label>
          <input
            type="number"
            min="0"
            max={maxScore}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Provide feedback to the student..."
          />
        </div>

        <div className="rounded-md bg-muted p-4">
          <h4 className="mb-2 font-semibold text-sm">Student's Submission</h4>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{submission.content}</pre>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Grade'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}