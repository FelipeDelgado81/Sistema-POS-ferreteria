import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Fiado, AbonoForm } from '@/types';
import { getFiadosCliente, registrarAbono } from '@/services/fiadosService';
import { CLIENTES_KEY } from './useClientesQuery';
import { CAJA_KEY } from './useCajaQuery';

export const FIADOS_KEY = ['fiados'] as const;

export function useFiadosClienteQuery(clienteId: string | null) {
  return useQuery<Fiado[]>({
    queryKey: [...FIADOS_KEY, clienteId],
    queryFn: () => getFiadosCliente(clienteId as string),
    enabled: clienteId != null,
  });
}

export function useRegistrarAbono(clienteId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fiadoId, payload }: { fiadoId: string; payload: AbonoForm }) =>
      registrarAbono(fiadoId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...FIADOS_KEY, clienteId] });
      qc.invalidateQueries({ queryKey: CLIENTES_KEY });
      qc.invalidateQueries({ queryKey: CAJA_KEY });
    },
  });
}
