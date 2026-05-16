import { useState, useEffect } from 'react';
import { assignmentsApi } from '@/lib/assignments-api';
import type { Assignment, AssignmentFilters } from '@/types/assignments';

interface UseAssignmentsReturn {
  data: Assignment[];
  isLoading: boolean;
  error: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  refetch: () => void;
}

export function useAssignments(filters?: AssignmentFilters): UseAssignmentsReturn {
  const [data, setData] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<UseAssignmentsReturn['meta']>();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assignmentsApi.list(filters);
      if (response.success) {
        setData(response.data);
        setMeta(response.meta);
      } else {
        setError(response.error || 'Failed to fetch assignments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters?.lectureId, filters?.type, filters?.page, filters?.limit]);

  return { data, isLoading, error, meta, refetch: fetchData };
}

interface UseAssignmentReturn {
  data: Assignment | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAssignment(id: number | string): UseAssignmentReturn {
  const [data, setData] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assignmentsApi.getById(Number(id));
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch assignment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
}