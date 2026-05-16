import type { Assignment, Submission } from '@/types/assignments';

interface AssignmentStatusBadgeProps {
  assignment: Assignment;
  submission?: Submission | null;
}

export function AssignmentStatusBadge({ assignment, submission }: AssignmentStatusBadgeProps) {
  const isOverdue = new Date(assignment.dueAt) < new Date();
  const isSubmitted = !!submission;
  const isGraded = submission?.score !== null;

  const getStatusInfo = () => {
    if (isGraded) {
      return {
        label: `Graded: ${submission?.score}/${assignment.maxScore}`,
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: '✓',
      };
    }

    if (isSubmitted) {
      return {
        label: 'Submitted - Awaiting Grading',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '⏳',
      };
    }

    if (isOverdue) {
      return {
        label: 'Overdue',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: '⚠️',
      };
    }

    return {
      label: 'Not Submitted',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '📝',
    };
  };

  const status = getStatusInfo();

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
      <span>{status.icon}</span>
      <span>{status.label}</span>
    </span>
  );
}