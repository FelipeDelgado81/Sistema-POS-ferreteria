import { useState } from 'react';
import type { VentasFiltros } from '@/types';
import {
  useVentasQuery,
  useVentaDetalle,
  useAnularVenta,
} from '@/hooks/queries/useVentasQuery';

const FILTROS_INICIALES: VentasFiltros = {
  desde: '',
  hasta: '',
  medioPago: '',
  estado: '',
};

export function useHistorialVentas() {
  const [filtros, setFiltros] = useState<VentasFiltros>(FILTROS_INICIALES);
  const { data: ventas = [], isLoading: loading, isError } = useVentasQuery(filtros);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detalle = useVentaDetalle(selectedId);

  const anularMutation = useAnularVenta();
  const [ventaAAnular, setVentaAAnular] = useState<string | null>(null);

  function setFiltro<K extends keyof VentasFiltros>(key: K, value: VentasFiltros[K]) {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
  }

  const totalPeriodo = ventas
    .filter((v) => v.estado === 'completada')
    .reduce((sum, v) => sum + v.total, 0);

  async function handleAnular() {
    if (!ventaAAnular) return;
    await anularMutation.mutateAsync({ id: ventaAAnular });
    setVentaAAnular(null);
    setSelectedId(null);
  }

  return {
    ventas,
    loading,
    isError,
    filtros,
    setFiltro,
    limpiarFiltros,
    totalPeriodo,
    selectedId,
    setSelectedId,
    detalle,
    ventaAAnular,
    setVentaAAnular,
    handleAnular,
    anulando: anularMutation.isPending,
  };
}
