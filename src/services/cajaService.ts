import type {
  CajaActual,
  AbrirCajaForm,
  MovimientoCajaForm,
  CerrarCajaForm,
} from '@/types';
import api from './api';

export const getCajaActual = async (): Promise<CajaActual | null> => {
  const { data } = await api.get<CajaActual | null>('/caja/actual');
  return data;
};

export const abrirCaja = async (payload: AbrirCajaForm): Promise<CajaActual> => {
  const { data } = await api.post<CajaActual>('/caja/abrir', payload);
  return data;
};

export const registrarMovimiento = async (
  payload: MovimientoCajaForm,
): Promise<CajaActual> => {
  const { data } = await api.post<CajaActual>('/caja/movimiento', payload);
  return data;
};

export const cerrarCaja = async (payload: CerrarCajaForm): Promise<CajaActual> => {
  const { data } = await api.post<CajaActual>('/caja/cerrar', payload);
  return data;
};
