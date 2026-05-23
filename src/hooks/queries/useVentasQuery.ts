import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { VentaListItem, VentaDetalle, VentasFiltros } from '@/types';
import { getVentas, getVenta, anularVenta } from '@/services/ventasService';

export const VENTAS_KEY = ['ventas'] as const;

export function useVentasQuery(filtros: VentasFiltros) {
  return useQuery<VentaListItem[]>({
    queryKey: [...VENTAS_KEY, filtros],
    queryFn: () => getVentas(filtros),
  });
}

export function useVentaDetalle(id: string | null) {
  return useQuery<VentaDetalle>({
    queryKey: [...VENTAS_KEY, 'detalle', id],
    queryFn: () => getVenta(id as string),
    enabled: id != null,
  });
}

export function useAnularVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) => anularVenta(id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTAS_KEY });
    },
  });
}
