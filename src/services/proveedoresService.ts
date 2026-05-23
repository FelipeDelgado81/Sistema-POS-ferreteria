import type { Proveedor, ProveedorForm } from '@/types';
import api from './api';

export const getProveedores = async (): Promise<Proveedor[]> => {
  const { data } = await api.get<Proveedor[]>('/proveedores');
  return data;
};

export const getProveedor = async (id: string): Promise<Proveedor> => {
  const { data } = await api.get<Proveedor>(`/proveedores/${id}`);
  return data;
};

export const createProveedor = async (payload: ProveedorForm): Promise<Proveedor> => {
  const { data } = await api.post<Proveedor>('/proveedores', payload);
  return data;
};

export const updateProveedor = async (id: string, payload: ProveedorForm): Promise<Proveedor> => {
  const { data } = await api.put<Proveedor>(`/proveedores/${id}`, payload);
  return data;
};

export const deleteProveedor = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/proveedores/${id}`);
  return data;
};
