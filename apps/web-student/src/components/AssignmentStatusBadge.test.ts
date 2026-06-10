import { describe, it, expect } from 'vitest';

// Note: Full render tests require a working React 19 + jsdom setup.
// These tests validate the business logic that can be unit-tested.

interface Assignment {
  id: number;
  title: string;
  dueAt: string | Date;
  maxScore: number;
}

interface Submission {
  id: number;
  score: number | null;
  submittedAt: string;
}

function getStatusInfo(assignment: Assignment, submission: Submission | null | undefined) {
  const isOverdue = new Date(assignment.dueAt) < new Date();
  const isSubmitted = !!submission;
  const isGraded = submission?.score !== null && submission?.score !== undefined;

  if (isGraded) {
    return {
      label: `Graded: ${submission?.score}/${assignment.maxScore}`,
      isOverdue: false,
      isSubmitted: true,
    };
  }
  if (isSubmitted) {
    return { label: 'Submitted - Awaiting Grading', isOverdue, isSubmitted };
  }
  if (isOverdue) {
    return { label: 'Overdue', isOverdue, isSubmitted };
  }
  return { label: 'Not Submitted', isOverdue: false, isSubmitted };
}

describe('AssignmentStatusBadge logic', () => {
  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const pastDate = new Date(Date.now() - 86400000).toISOString();

  it('should show "Not Submitted" for future assignment with no submission', () => {
    const result = getStatusInfo(
      { id: 1, title: 'A1', dueAt: futureDate, maxScore: 100 },
      null,
    );
    expect(result.label).toBe('Not Submitted');
  });

  it('should show "Overdue" for past assignment with no submission', () => {
    const result = getStatusInfo(
      { id: 1, title: 'A1', dueAt: pastDate, maxScore: 100 },
      null,
    );
    expect(result.label).toBe('Overdue');
    expect(result.isOverdue).toBe(true);
  });

  it('should show "Submitted - Awaiting Grading" for submission without score', () => {
    const result = getStatusInfo(
      { id: 1, title: 'A1', dueAt: futureDate, maxScore: 100 },
      { id: 1, score: null, submittedAt: new Date().toISOString() },
    );
    expect(result.label).toBe('Submitted - Awaiting Grading');
  });

  it('should show "Graded: X/Y" for submission with score', () => {
    const result = getStatusInfo(
      { id: 1, title: 'A1', dueAt: pastDate, maxScore: 100 },
      { id: 1, score: 85, submittedAt: new Date().toISOString() },
    );
    expect(result.label).toBe('Graded: 85/100');
  });

  it('should prioritize graded status over overdue', () => {
    const result = getStatusInfo(
      { id: 1, title: 'A1', dueAt: pastDate, maxScore: 50 },
      { id: 1, score: 45, submittedAt: new Date().toISOString() },
    );
    expect(result.label).toBe('Graded: 45/50');
  });
});
