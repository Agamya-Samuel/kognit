export interface Assignment {
  id: number;
  lectureId: number;
  title: string;
  description: string | null;
  type: 'mcq' | 'short' | 'code';
  maxScore: number;
  dueAt: string;
  lateWindowHours: number | null;
  latePenaltyPercent: number;
  createdAt: string;
  lecture?: Lecture;
}

export interface Lecture {
  id: number;
  sectionId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  type: 'video' | 'live' | 'text' | 'assignment' | 'quiz';
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  durationSeconds: number;
  isFreePreview: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: number;
  assignmentId: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
  orderIndex: number;
  createdAt: string;
  correctOption?: string; // Only for instructors/admins
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  content: string;
  submittedAt: string;
  gradedAt: string | null;
  score: number | null;
  feedback: string | null;
  graderId: number | null;
  createdAt: string;
  assignment?: Assignment;
  student?: Student;
  grader?: User;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface LateSubmissionStatus {
  isLate: boolean;
  isAccepted: boolean;
  hoursLate: number;
  penaltyApplied: boolean;
  penaltyPercent: number;
  penaltyAmount: number;
}

export interface GradingResult {
  submission: Submission;
  originalScore: number;
  penaltyPercent: number;
  finalScore: number;
}

export interface AssignmentsResponse {
  success: boolean;
  data: Assignment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error: string | null;
}

export interface SubmissionsResponse {
  success: boolean;
  data: Submission[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error: string | null;
}

export interface QuizQuestionsResponse {
  success: boolean;
  data: QuizQuestion[];
  error: string | null;
}

export interface SubmissionResponse {
  success: boolean;
  data: {
    submission: Submission;
    lateStatus: LateSubmissionStatus;
  };
  error: string | null;
}

export interface GradeResponse {
  success: boolean;
  data: GradingResult;
  error: string | null;
}

export interface BulkGradeResponse {
  success: boolean;
  data: {
    graded: GradingResult[];
    errors: string[];
  };
  error: string | null;
}

export interface CreateAssignmentDto {
  lectureId: number;
  title: string;
  description?: string;
  type: 'mcq' | 'short' | 'code';
  maxScore: number;
  dueAt: string;
  lateWindowHours?: number;
  latePenaltyPercent?: number;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  type?: 'mcq' | 'short' | 'code';
  maxScore?: number;
  dueAt?: string;
  lateWindowHours?: number;
  latePenaltyPercent?: number;
}

export interface QuizQuestionDto {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points?: number;
  orderIndex?: number;
}

export interface SubmitAssignmentDto {
  content: string;
}

export interface GradeSubmissionDto {
  score: number;
  feedback?: string;
}

export interface BulkGradeItemDto {
  submissionId: number;
  score: number;
  feedback?: string;
}

export interface BulkGradeDto {
  grades: BulkGradeItemDto[];
}

export interface AssignmentFilters {
  lectureId?: number;
  type?: 'mcq' | 'short' | 'code';
  page?: number;
  limit?: number;
}

export interface SubmissionFilters {
  assignmentId?: number;
  page?: number;
  limit?: number;
}