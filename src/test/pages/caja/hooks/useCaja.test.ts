import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useCaja } from '@/pages/caja/hooks/useCaja';
import type { CajaActual } from '@/types';

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

const cajaAbierta: CajaActual = {
  id: 'caja-1',
  fecha: '2026-05-23',
  estado: 'abierta',
  fondoInicial: 50000,
  ventasEfectivo: 145000,
  ventasTarjeta: 210000,
  ventasFiado: 0,
  ingresos: 0,
  retiros: 15000,
  efectivoEsperado: 180000,
  efectivoFisico: null,
  diferencia: null,
  abiertaAt: '2026-05-23T08:00:00.000Z',
  cerradaAt: null,
  lineas: [],
};

vi.mock('@/services/cajaService', () => ({
  getCajaActual: vi.fn(),
  abrirCaja: vi.fn(),
  registrarMovimiento: vi.fn(),
  cerrarCaja: vi.fn(),
}));

import {
  getCajaActual,
  abrirCaja,
  registrarMovimiento,
  cerrarCaja,
} from '@/services/cajaService';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCajaActual).mockResolvedValue(null);
  vi.mocked(abrirCaja).mockResolvedValue({ ...cajaAbierta });
  vi.mocked(registrarMovimiento).mockResolvedValue({ ...cajaAbierta });
  vi.mocked(cerrarCaja).mockResolvedValue({ ...cajaAbierta, estado: 'cerrada' });
});

describe('useCaja', () => {
  it('reporta caja cerrada/no abierta cuando la API devuelve null', async () => {
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.caja).toBeNull();
    expect(result.current.cajaAbierta).toBe(false);
  });

  it('reconoce una caja abierta', async () => {
    vi.mocked(getCajaActual).mockResolvedValue({ ...cajaAbierta });
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cajaAbierta).toBe(true);
    expect(result.current.efectivoEsperado).toBe(180000);
  });

  it('openAbrir limpia el fondo y abre el modal', async () => {
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openAbrir());
    expect(result.current.modalActivo).toBe('abrir');
    expect(result.current.fondoInicial).toBe('');
  });

  it('handleAbrir llama al servicio con el fondo y cierra el modal', async () => {
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openAbrir());
    act(() => result.current.setFondoInicial('50000'));
    await act(async () => result.current.handleAbrir());

    expect(abrirCaja).toHaveBeenCalledWith({ fondoInicial: 50000 });
    expect(result.current.modalActivo).toBeNull();
  });

  it('handleAbrir no llama al servicio con fondo inválido', async () => {
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openAbrir());
    act(() => result.current.setFondoInicial('-100'));
    await act(async () => result.current.handleAbrir());

    expect(abrirCaja).not.toHaveBeenCalled();
  });

  it('openMovimiento fija el tipo y abre el modal', async () => {
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openMovimiento('retiro'));
    expect(result.current.modalActivo).toBe('movimiento');
    expect(result.current.movimientoTipo).toBe('retiro');
  });

  it('handleMovimiento envía tipo, monto y descripción', async () => {
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openMovimiento('ingreso'));
    act(() => result.current.setMontoMovimiento('5000'));
    act(() => result.current.setDescripcionMovimiento('aporte'));
    await act(async () => result.current.handleMovimiento());

    expect(registrarMovimiento).toHaveBeenCalledWith({
      tipo: 'ingreso',
      monto: 5000,
      descripcion: 'aporte',
    });
    expect(result.current.modalActivo).toBeNull();
  });

  it('handleMovimiento no envía con monto cero', async () => {
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openMovimiento('ingreso'));
    act(() => result.current.setMontoMovimiento('0'));
    await act(async () => result.current.handleMovimiento());

    expect(registrarMovimiento).not.toHaveBeenCalled();
  });

  it('diferencia compara efectivo físico contra el esperado', async () => {
    vi.mocked(getCajaActual).mockResolvedValue({ ...cajaAbierta });
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openCerrar());
    act(() => result.current.setEfectivoFisico('180000'));
    expect(result.current.diferencia).toBe(0);

    act(() => result.current.setEfectivoFisico('175000'));
    expect(result.current.diferencia).toBe(-5000);
  });

  it('handleCerrar envía el efectivo físico contado', async () => {
    vi.mocked(getCajaActual).mockResolvedValue({ ...cajaAbierta });
    const { result } = renderHook(() => useCaja(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openCerrar());
    act(() => result.current.setEfectivoFisico('180000'));
    await act(async () => result.current.handleCerrar());

    expect(cerrarCaja).toHaveBeenCalledWith({ efectivoFisico: 180000 });
    expect(result.current.modalActivo).toBeNull();
  });
});
