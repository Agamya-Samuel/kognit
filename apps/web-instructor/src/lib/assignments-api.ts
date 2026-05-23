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
  AssignmentsResponse,
  SubmissionsResponse,
  QuizQuestionsResponse,
  SubmissionResponse,
  GradeResponse,
  BulkGradeResponse,
} from '@/types/assignments';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response;
}

// ─── Assignment API ─────────────────────────────────────────────────────────────

export const assignmentsApi = {
  async list(filters?: AssignmentFilters): Promise<AssignmentsResponse> {
    const params = new URLSearchParams();
    if (filters?.lectureId) params.append('lectureId', filters.lectureId.toString());
    if (filters?.type) params.append('type', filters.type);
    params.append('page', (filters?.page ?? 1).toString());
    params.append('limit', (filters?.limit ?? 20).toString());

    const response = await fetchWithAuth(`/api/v1/assignments?${params.toString()}`);
    return response.json();
  },

  async getById(id: number): Promise<{ success: boolean; data: Assignment; error: string | null }> {
    const response = await fetchWithAuth(`/api/v1/assignments/${id}`);
    return response.json();
  },

  async create(dto: CreateAssignmentDto): Promise<{ success: boolean; data: Assignment; error: string | null }> {
    const response = await fetchWithAuth('/api/v1/assignments', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  },

  async update(id: number, dto: UpdateAssignmentDto): Promise<{ success: boolean; data: Assignment; error: string | null }> {
    const response = await fetchWithAuth(`/api/v1/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.json();
  },

  async delete(id: number): Promise<{ success: boolean; data: { message: string }; error: string | null }> {
    const response = await fetchWithAuth(`/api/v1/assignments/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async bulkCreate(dtos: CreateAssignmentDto[]): Promise<{
    success: boolean;
    data: { created: Assignment[]; errors: string[] };
    error: string | null;
  }> {
    const response = await fetchWithAuth('/api/v1/assignments/bulk', {
      method: 'POST',
      body: JSON.stringify({ assignments: dtos }),
    });
    return response.json();
  },
};

// ─── Quiz Questions API ────────────────────────────────────────────────────────

export const quizApi = {
  async getQuestions(assignmentId: number): Promise<QuizQuestionsResponse> {
    const response = await fetchWithAuth(`/api/v1/assignments/${assignmentId}/questions`);
    return response.json();
  },

  async addQuestion(assignmentId: number, dto: QuizQuestionDto): Promise<{
    success: boolean;
    data: QuizQuestion;
    error: string | null;
  }> {
    const response = await fetchWithAuth(`/api/v1/assignments/${assignmentId}/questions`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  },

  async addQuestions(assignmentId: number, dtos: QuizQuestionDto[]): Promise<{
    success: boolean;
    data: QuizQuestion[];
    error: string | null;
  }> {
    const response = await fetchWithAuth(`/api/v1/assignments/${assignmentId}/questions/bulk`, {
      method: 'POST',
      body: JSON.stringify(dtos),
    });
    return response.json();
  },

  async updateQuestion(questionId: number, dto: Partial<QuizQuestionDto>): Promise<{
    success: boolean;
    data: QuizQuestion;
    error: string | null;
  }> {
    const response = await fetchWithAuth(`/api/v1/assignments/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.json();
  },

  async deleteQuestion(questionId: number): Promise<{
    success: boolean;
    data: { message: string };
    error: string | null;
  }> {
    const response = await fetchWithAuth(`/api/v1/assignments/questions/${questionId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ─── Submissions API ───────────────────────────────────────────────────────────

export const submissionsApi = {
  async submit(assignmentId: number, dto: SubmitAssignmentDto): Promise<SubmissionResponse> {
    const response = await fetchWithAuth(`/api/v1/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  },

  async getMySubmissions(filters?: SubmissionFilters): Promise<SubmissionsResponse> {
    const params = new URLSearchParams();
    if (filters?.assignmentId) params.append('assignmentId', filters.assignmentId.toString());
    params.append('page', (filters?.page ?? 1).toString());
    params.append('limit', (filters?.limit ?? 20).toString());

    const response = await fetchWithAuth(`/api/v1/students/me/submissions?${params.toString()}`);
    return response.json();
  },

  async getMySubmission(assignmentId: number): Promise<{
    success: boolean;
    data: Submission | null;
    error: string | null;
  }> {
    const response = await fetchWithAuth(`/api/v1/assignments/${assignmentId}/my-submission`);
    return response.json();
  },

  async getByAssignment(assignmentId: number, filters?: Omit<SubmissionFilters, 'assignmentId'>): Promise<SubmissionsResponse> {
    const params = new URLSearchParams();
    params.append('page', (filters?.page ?? 1).toString());
    params.append('limit', (filters?.limit ?? 20).toString());

    const response = await fetchWithAuth(`/api/v1/assignments/${assignmentId}/submissions?${params.toString()}`);
    return response.json();
  },

  async getById(id: number): Promise<{ success: boolean; data: Submission; error: string | null }> {
    const response = await fetchWithAuth(`/api/v1/submissions/${id}`);
    return response.json();
  },

  async grade(id: number, dto: GradeSubmissionDto): Promise<GradeResponse> {
    const response = await fetchWithAuth(`/api/v1/submissions/${id}/grade`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.json();
  },

  async autoGrade(id: number): Promise<GradeResponse> {
    const response = await fetchWithAuth(`/api/v1/submissions/${id}/auto-grade`, {
      method: 'POST',
    });
    return response.json();
  },

  async bulkGrade(dto: BulkGradeDto): Promise<BulkGradeResponse> {
    const response = await fetchWithAuth('/api/v1/submissions/bulk-grade', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  },
};