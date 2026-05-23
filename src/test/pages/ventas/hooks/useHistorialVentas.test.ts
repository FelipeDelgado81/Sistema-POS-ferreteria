import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useHistorialVentas } from '@/pages/ventas/hooks/useHistorialVentas';
import type { VentaDetalle, VentaListItem } from '@/types';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const ventas: VentaListItem[] = [
  {
    id: 'v1',
    fecha: '2026-05-23T10:00:00.000Z',
    clienteNombre: 'Juan Pérez',
    subtotal: 10000,
    descuentoMonto: 0,
    total: 10000,
    medioPago: 'efectivo',
    estado: 'completada',
    numeroDte: null,
  },
  {
    id: 'v2',
    fecha: '2026-05-23T11:00:00.000Z',
    clienteNombre: null,
    subtotal: 5000,
    descuentoMonto: 0,
    total: 5000,
    medioPago: 'tarjeta',
    estado: 'anulada',
    numeroDte: null,
  },
];

const detalle: VentaDetalle = {
  ...ventas[0],
  clienteRut: '11.111.111-1',
  descuentoTipo: 'none',
  descuentoValor: 0,
  montoRecibido: 10000,
  vuelto: 0,
  items: [
    {
      productoId: 'p1',
      productoNombre: 'Martillo',
      codigo: '123',
      cantidad: 1,
      precioUnitario: 10000,
      total: 10000,
    },
  ],
};

vi.mock('@/services/ventasService', () => ({
  getVentas: vi.fn(),
  getVenta: vi.fn(),
  anularVenta: vi.fn(),
}));

import { getVentas, getVenta, anularVenta } from '@/services/ventasService';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getVentas).mockResolvedValue(ventas);
  vi.mocked(getVenta).mockResolvedValue(detalle);
  vi.mocked(anularVenta).mockResolvedValue({ ...detalle, estado: 'anulada' });
});

describe('useHistorialVentas', () => {
  it('carga las ventas al montar', async () => {
    const { result } = renderHook(() => useHistorialVentas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ventas).toHaveLength(2);
  });

  it('totalPeriodo suma solo las ventas completadas', async () => {
    const { result } = renderHook(() => useHistorialVentas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalPeriodo).toBe(10000);
  });

  it('setFiltro actualiza los filtros y re-consulta', async () => {
    const { result } = renderHook(() => useHistorialVentas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFiltro('medioPago', 'tarjeta'));

    expect(result.current.filtros.medioPago).toBe('tarjeta');
    await waitFor(() =>
      expect(getVentas).toHaveBeenCalledWith(expect.objectContaining({ medioPago: 'tarjeta' })),
    );
  });

  it('limpiarFiltros restablece los filtros', async () => {
    const { result } = renderHook(() => useHistorialVentas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFiltro('estado', 'anulada'));
    act(() => result.current.limpiarFiltros());

    expect(result.current.filtros.estado).toBe('');
  });

  it('seleccionar una venta carga su detalle', async () => {
    const { result } = renderHook(() => useHistorialVentas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSelectedId('v1'));
    await waitFor(() => expect(result.current.detalle.data?.id).toBe('v1'));

    expect(getVenta).toHaveBeenCalledWith('v1');
    expect(result.current.detalle.data?.items).toHaveLength(1);
  });

  it('handleAnular llama al servicio y limpia la selección', async () => {
    const { result } = renderHook(() => useHistorialVentas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setVentaAAnular('v1'));
    await act(async () => result.current.handleAnular());

    expect(anularVenta).toHaveBeenCalledWith('v1', undefined);
    expect(result.current.ventaAAnular).toBeNull();
    expect(result.current.selectedId).toBeNull();
  });

  it('handleAnular no hace nada si no hay venta marcada', async () => {
    const { result } = renderHook(() => useHistorialVentas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.handleAnular());

    expect(anularVenta).not.toHaveBeenCalled();
  });
});
