import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Proveedor, ProveedorForm } from '@/types';
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from '@/services/proveedoresService';

export const PROVEEDORES_KEY = ['proveedores'] as const;

export function useProveedoresQuery() {
  return useQuery<Proveedor[]>({
    queryKey: PROVEEDORES_KEY,
    queryFn: getProveedores,
  });
}

export function useCreateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProveedorForm) => createProveedor(payload),
    onSuccess: (created) => {
      qc.setQueryData<Proveedor[]>(PROVEEDORES_KEY, (prev = []) => [...prev, created]);
    },
  });
}

export function useUpdateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProveedorForm }) =>
      updateProveedor(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData<Proveedor[]>(PROVEEDORES_KEY, (prev = []) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
  });
}

export function useDeleteProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProveedor(id),
    onSuccess: (_result, id) => {
      qc.setQueryData<Proveedor[]>(PROVEEDORES_KEY, (prev = []) =>
        prev.filter((p) => p.id !== id),
      );
    },
  });
}
