import type { Producto, ProductoForm, BulkImportResult } from '@/types';
import api from './api';

export const getProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get<Producto[]>('/productos');
  return data;
};

export const getProducto = async (id: string): Promise<Producto> => {
  const { data } = await api.get<Producto>(`/productos/${id}`);
  return data;
};

export const createProducto = async (payload: ProductoForm): Promise<Producto> => {
  const { data } = await api.post<Producto>('/productos', payload);
  return data;
};

export const updateProducto = async (id: string, payload: ProductoForm): Promise<Producto> => {
  const { data } = await api.put<Producto>(`/productos/${id}`, payload);
  return data;
};

export const deleteProducto = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/productos/${id}`);
  return data;
};

export const bulkImportProductos = async (
  productos: ProductoForm[],
): Promise<BulkImportResult> => {
  const { data } = await api.post<BulkImportResult>('/productos/bulk', { productos });
  return data;
};
