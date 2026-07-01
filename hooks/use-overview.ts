'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/hooks/api-call-hook';
import type { OverviewResponse } from '@/libs/types';

export const overviewQueryKey = ['overview'] as const;

export function useOverview(enabled = true) {
  const query = useQuery({
    queryKey: overviewQueryKey,
    queryFn: async () => {
      const response = await apiCall<OverviewResponse>('GET', '/platform/overview');
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load account data.');
      }
      return response.data;
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return null;
    }

    const result = await query.refetch();
    return result.data ?? null;
  }, [enabled, query]);

  return {
    overview: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
  };
}
