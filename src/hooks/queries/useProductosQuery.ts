import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Producto, ProductoForm } from '@/types';
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  bulkImportProductos,
} from '@/services/productosService';

export const PRODUCTOS_KEY = ['productos'] as const;

export function useProductosQuery() {
  return useQuery<Producto[]>({
    queryKey: PRODUCTOS_KEY,
    queryFn: getProductos,
  });
}

export function useCreateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductoForm) => createProducto(payload),
    onSuccess: (created) => {
      qc.setQueryData<Producto[]>(PRODUCTOS_KEY, (prev = []) => [...prev, created]);
    },
  });
}

export function useUpdateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductoForm }) =>
      updateProducto(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData<Producto[]>(PRODUCTOS_KEY, (prev = []) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
  });
}

export function useDeleteProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProducto(id),
    onSuccess: (_result, id) => {
      qc.setQueryData<Producto[]>(PRODUCTOS_KEY, (prev = []) =>
        prev.filter((p) => p.id !== id),
      );
    },
  });
}

export function useBulkImportProductos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productos: ProductoForm[]) => bulkImportProductos(productos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}
