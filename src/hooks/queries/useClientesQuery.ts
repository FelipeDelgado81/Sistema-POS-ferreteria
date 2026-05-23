import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Cliente, ClienteForm } from '@/types';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from '@/services/clientesService';

export const CLIENTES_KEY = ['clientes'] as const;

export function useClientesQuery() {
  return useQuery<Cliente[]>({
    queryKey: CLIENTES_KEY,
    queryFn: getClientes,
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClienteForm) => createCliente(payload),
    onSuccess: (created) => {
      qc.setQueryData<Cliente[]>(CLIENTES_KEY, (prev = []) => [...prev, created]);
    },
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClienteForm }) =>
      updateCliente(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData<Cliente[]>(CLIENTES_KEY, (prev = []) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    },
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: (_result, id) => {
      qc.setQueryData<Cliente[]>(CLIENTES_KEY, (prev = []) =>
        prev.filter((c) => c.id !== id),
      );
    },
  });
}
