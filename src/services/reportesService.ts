import type { ReporteData, ReportePeriodo } from '@/types';
import api from './api';

export const getReporte = async (periodo: ReportePeriodo): Promise<ReporteData> => {
  const { data } = await api.get<ReporteData>('/reportes', { params: { periodo } });
  return data;
};
