import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService } from '@edutech/api-client';
import type { AssignmentFilters, CreateAssignmentDto } from '@edutech/types';

export function useAssignments(filters?: AssignmentFilters) {
  return useQuery({
    queryKey: ['assignments', filters],
    queryFn: async () => {
      return assignmentsService.list(filters);
    },
  });
}

export function useAssignment(id: number | string) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      return assignmentsService.getById(Number(id));
    },
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAssignmentDto) => {
      return assignmentsService.create(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<CreateAssignmentDto> }) => {
      return assignmentsService.update(id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
    },
  });
}