import { useQuery } from '@tanstack/react-query';
import type { DashboardData } from '@/types';
import { getDashboard } from '@/services/dashboardService';

export const DASHBOARD_KEY = ['dashboard'] as const;

export function useDashboardQuery() {
  return useQuery<DashboardData>({
    queryKey: DASHBOARD_KEY,
    queryFn: getDashboard,
  });
}
