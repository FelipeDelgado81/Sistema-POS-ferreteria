import type { CreateVentaPayload, VentaResult } from '@/types';
import api from './api';

export const createVenta = async (payload: CreateVentaPayload): Promise<VentaResult> => {
  const { data } = await api.post<VentaResult>('/ventas', payload);
  return data;
};
