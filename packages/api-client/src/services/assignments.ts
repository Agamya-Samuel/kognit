import { getApiClient } from '../index';
import type {
  Assignment,
  Submission,
  QuizQuestion,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  QuizQuestionDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
  BulkGradeDto,
  AssignmentFilters,
  SubmissionFilters,
  PaginationQuery,
} from '@edutech/types';

export const assignmentsService = {
  async list(filters?: AssignmentFilters & PaginationQuery) {
    return getApiClient().get<Assignment[]>('/assignments', filters);
  },

  async getById(id: number) {
    return getApiClient().get<Assignment>(`/assignments/${id}`);
  },

  async create(dto: CreateAssignmentDto) {
    return getApiClient().post<Assignment>('/assignments', dto);
  },

  async update(id: number, dto: UpdateAssignmentDto) {
    return getApiClient().put<Assignment>(`/assignments/${id}`, dto);
  },

  async delete(id: number) {
    return getApiClient().delete<void>(`/assignments/${id}`);
  },

  async bulkCreate(dtos: CreateAssignmentDto[]) {
    return getApiClient().post<{ created: Assignment[]; errors: string[] }>('/assignments/bulk', { assignments: dtos });
  },
};

export const quizService = {
  async getQuestions(assignmentId: number) {
    return getApiClient().get<QuizQuestion[]>(`/assignments/${assignmentId}/questions`);
  },

  async addQuestion(assignmentId: number, dto: QuizQuestionDto) {
    return getApiClient().post<QuizQuestion>(`/assignments/${assignmentId}/questions`, dto);
  },

  async addQuestions(assignmentId: number, dtos: QuizQuestionDto[]) {
    return getApiClient().post<QuizQuestion[]>(`/assignments/${assignmentId}/questions/bulk`, dtos);
  },

  async updateQuestion(questionId: number, dto: Partial<QuizQuestionDto>) {
    return getApiClient().put<QuizQuestion>(`/assignments/questions/${questionId}`, dto);
  },

  async deleteQuestion(questionId: number) {
    return getApiClient().delete<void>(`/assignments/questions/${questionId}`);
  },
};

export const submissionsService = {
  async submit(assignmentId: number, dto: SubmitAssignmentDto) {
    return getApiClient().post<Submission>(`/assignments/${assignmentId}/submit`, dto);
  },

  async getMySubmissions(filters?: SubmissionFilters & PaginationQuery) {
    return getApiClient().get<Submission[]>('/students/me/submissions', filters);
  },

  async getMySubmission(assignmentId: number) {
    return getApiClient().get<Submission | null>(`/assignments/${assignmentId}/my-submission`);
  },

  async getByAssignment(assignmentId: number, filters?: PaginationQuery) {
    return getApiClient().get<Submission[]>(`/assignments/${assignmentId}/submissions`, filters);
  },

  async getById(id: number) {
    return getApiClient().get<Submission>(`/submissions/${id}`);
  },

  async grade(id: number, dto: GradeSubmissionDto) {
    return getApiClient().put<Submission>(`/submissions/${id}/grade`, dto);
  },

  async autoGrade(id: number) {
    return getApiClient().post<Submission>(`/submissions/${id}/auto-grade`);
  },

  async bulkGrade(dto: BulkGradeDto) {
    return getApiClient().post<any>('/submissions/bulk-grade', dto);
  },
};