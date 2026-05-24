import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService, quizService } from '@edutech/api-client';
import type { UpdateAssignmentDto, QuizQuestionDto } from '@edutech/types';

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateAssignmentDto }) => {
      return assignmentsService.update(id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await assignmentsService.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useAddQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, dto }: { assignmentId: number; dto: QuizQuestionDto }) => {
      return quizService.addQuestion(assignmentId, dto);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', 'questions', variables.assignmentId] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, dto }: { questionId: number; dto: Partial<QuizQuestionDto> }) => {
      return quizService.updateQuestion(questionId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', 'questions'] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: number) => {
      await quizService.deleteQuestion(questionId);
      return questionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', 'questions'] });
    },
  });
}