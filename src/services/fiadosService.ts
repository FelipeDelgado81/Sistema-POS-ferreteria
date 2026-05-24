import type { Fiado, AbonoForm } from '@/types';
import api from './api';

export const getFiadosCliente = async (clienteId: string): Promise<Fiado[]> => {
  const { data } = await api.get<Fiado[]>('/fiados', { params: { clienteId } });
  return data;
};

export const registrarAbono = async (fiadoId: string, payload: AbonoForm): Promise<Fiado> => {
  const { data } = await api.post<Fiado>(`/fiados/${fiadoId}/abonos`, payload);
  return data;
};
