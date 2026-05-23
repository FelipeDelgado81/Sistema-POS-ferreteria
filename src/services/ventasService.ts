import type {
  CreateVentaPayload,
  VentaResult,
  VentaListItem,
  VentaDetalle,
  VentasFiltros,
} from '@/types';
import api from './api';

export const createVenta = async (payload: CreateVentaPayload): Promise<VentaResult> => {
  const { data } = await api.post<VentaResult>('/ventas', payload);
  return data;
};

export const getVentas = async (filtros: VentasFiltros = {}): Promise<VentaListItem[]> => {
  const params: Record<string, string> = {};
  if (filtros.desde) params.desde = filtros.desde;
  if (filtros.hasta) params.hasta = filtros.hasta;
  if (filtros.medioPago) params.medioPago = filtros.medioPago;
  if (filtros.estado) params.estado = filtros.estado;

  const { data } = await api.get<VentaListItem[]>('/ventas', { params });
  return data;
};

export const getVenta = async (id: string): Promise<VentaDetalle> => {
  const { data } = await api.get<VentaDetalle>(`/ventas/${id}`);
  return data;
};

export const anularVenta = async (id: string, motivo?: string): Promise<VentaDetalle> => {
  const { data } = await api.post<VentaDetalle>(`/ventas/${id}/anular`, { motivo });
  return data;
};
