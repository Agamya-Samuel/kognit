import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService } from '@edutech/api-client';
import type { Assignment, AssignmentFilters, CreateAssignmentDto } from '@edutech/types';

export function useAssignments(filters?: AssignmentFilters) {
  return useQuery({
    queryKey: ['assignments', filters],
    queryFn: async (): Promise<Assignment[]> => {
      return assignmentsService.list(filters);
    },
  });
}

export function useAssignment(id: number | string) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async (): Promise<Assignment> => {
      return assignmentsService.getById(Number(id));
    },
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAssignmentDto): Promise<Assignment> => {
      return assignmentsService.create(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}