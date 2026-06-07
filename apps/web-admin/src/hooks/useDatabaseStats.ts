import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

export interface DatabaseStats {
  databaseSize: { bytes: number; pretty: string };
  tableCount: number;
  tables: { name: string; rowCount: number; sizeBytes: number; sizePretty: string }[];
  connectionPool: { active: number; idle: number; total: number; maxPool: number };
}

export function useDatabaseStats() {
  const { data, isLoading, error, refetch } = useQuery<DatabaseStats>({
    queryKey: ['admin', 'database-stats'],
    queryFn: () => adminService.getDatabaseStats(),
    refetchInterval: 30_000, // auto-refresh every 30s
    staleTime: 10_000,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
