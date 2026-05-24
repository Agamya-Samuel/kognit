import { useQuery } from '@tanstack/react-query';
import { quizService } from '@edutech/api-client';

export function useQuizQuestions(assignmentId: number) {
  return useQuery({
    queryKey: ['quiz', 'questions', assignmentId],
    queryFn: async () => {
      return quizService.getQuestions(assignmentId);
    },
    enabled: !!assignmentId,
  });
}