import type {
  Assignment,
  Submission,
  AssignmentFilters,
  AssignmentType,
  CreateAssignmentDto,
  SubmissionFilters,
  QuizQuestion,
  SubmitAssignmentDto,
} from '@edutech/types';

export type {
  Assignment,
  Submission,
  AssignmentFilters,
  AssignmentType,
  CreateAssignmentDto,
  SubmissionFilters,
  QuizQuestion,
  SubmitAssignmentDto,
};

export type AssignmentSubmissionStatus = 'not_submitted' | 'submitted' | 'graded' | 'overdue';