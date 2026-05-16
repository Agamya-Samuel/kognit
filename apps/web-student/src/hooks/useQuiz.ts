import { useState, useEffect } from 'react';
import { quizApi } from '@/lib/assignments-api';
import type { QuizQuestion } from '@/types/assignments';

interface UseQuizQuestionsReturn {
  data: QuizQuestion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuizQuestions(assignmentId: number): UseQuizQuestionsReturn {
  const [data, setData] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await quizApi.getQuestions(assignmentId);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch quiz questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

  return { data, isLoading, error, refetch: fetchData };
}