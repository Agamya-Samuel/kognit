import type { Assignment } from '@/types/assignments';

interface AssignmentCardProps {
  assignment: Assignment;
  submissionStatus?: 'not_submitted' | 'submitted' | 'graded';
  score?: number;
  onClick?: () => void;
}

export function AssignmentCard({ assignment, submissionStatus, score, onClick }: AssignmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq':
        return '📝';
      case 'short':
        return '✍️';
      case 'code':
        return '💻';
      default:
        return '📄';
    }
  };

  const getStatusColor = () => {
    if (submissionStatus === 'graded') return 'bg-green-100 text-green-800 border-green-200';
    if (submissionStatus === 'submitted') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = () => {
    if (submissionStatus === 'graded') return `Graded: ${score}/${assignment.maxScore}`;
    if (submissionStatus === 'submitted') return 'Submitted';
    return 'Not Submitted';
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon(assignment.type)}</span>
          <div>
            <h3 className="font-semibold text-lg">{assignment.title}</h3>
            <p className="text-sm text-muted-foreground capitalize">{assignment.type} Assignment</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {assignment.description && (
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>📅</span>
            <span>Due: {formatDate(assignment.dueAt)}</span>
          </div>
          {assignment.lateWindowHours && assignment.lateWindowHours > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>⏰</span>
              <span>Late window: {assignment.lateWindowHours}h</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 font-medium">
          <span>⭐</span>
          <span>{assignment.maxScore} points</span>
        </div>
      </div>
    </div>
  );
}