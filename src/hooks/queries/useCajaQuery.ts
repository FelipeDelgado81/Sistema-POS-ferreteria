import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CajaActual,
  AbrirCajaForm,
  MovimientoCajaForm,
  CerrarCajaForm,
} from '@/types';
import {
  getCajaActual,
  abrirCaja,
  registrarMovimiento,
  cerrarCaja,
} from '@/services/cajaService';

export const CAJA_KEY = ['caja', 'actual'] as const;

export function useCajaActual() {
  return useQuery<CajaActual | null>({
    queryKey: CAJA_KEY,
    queryFn: getCajaActual,
  });
}

export function useAbrirCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AbrirCajaForm) => abrirCaja(payload),
    onSuccess: (caja) => qc.setQueryData(CAJA_KEY, caja),
  });
}

export function useRegistrarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MovimientoCajaForm) => registrarMovimiento(payload),
    onSuccess: (caja) => qc.setQueryData(CAJA_KEY, caja),
  });
}

export function useCerrarCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CerrarCajaForm) => cerrarCaja(payload),
    onSuccess: (caja) => qc.setQueryData(CAJA_KEY, caja),
  });
}
