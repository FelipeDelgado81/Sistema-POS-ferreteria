import type { Cliente, ClienteForm } from '@/types';
import api from './api';

export const getClientes = async (): Promise<Cliente[]> => {
  const { data } = await api.get<Cliente[]>('/clientes');
  return data;
};

export const getCliente = async (id: string): Promise<Cliente> => {
  const { data } = await api.get<Cliente>(`/clientes/${id}`);
  return data;
};

export const createCliente = async (payload: ClienteForm): Promise<Cliente> => {
  const { data } = await api.post<Cliente>('/clientes', payload);
  return data;
};

export const updateCliente = async (id: string, payload: ClienteForm): Promise<Cliente> => {
  const { data } = await api.put<Cliente>(`/clientes/${id}`, payload);
  return data;
};

export const deleteCliente = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/clientes/${id}`);
  return data;
};
