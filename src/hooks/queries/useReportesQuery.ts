import { useQuery } from '@tanstack/react-query';
import type { ReporteData, ReportePeriodo } from '@/types';
import { getReporte } from '@/services/reportesService';

export const REPORTES_KEY = ['reportes'] as const;

export function useReportesQuery(periodo: ReportePeriodo) {
  return useQuery<ReporteData>({
    queryKey: [...REPORTES_KEY, periodo],
    queryFn: () => getReporte(periodo),
  });
}
