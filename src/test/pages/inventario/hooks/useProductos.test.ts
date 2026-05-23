import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useProductos } from '@/pages/inventario/hooks/useProductos';
import type { Producto } from '@/types';

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

const mockProductos = [
  {
    id: 1,
    code: '7801234567890',
    name: 'Taladro Percutor Makita 710W',
    category: 'Herramientas',
    priceBuy: 45000,
    priceRetail: 65990,
    priceWholesale: 58000,
    stock: 12,
    minStock: 5,
    active: true,
  },
  {
    id: 2,
    code: '7801234567901',
    name: 'Destornillador Plano 6" Stanley',
    category: 'Herramientas',
    priceBuy: 1800,
    priceRetail: 2990,
    priceWholesale: 2500,
    stock: 2,
    minStock: 10,
    active: true,
  },
];

vi.mock('@/services/productosService', () => ({
  getProductos: vi.fn(),
  createProducto: vi.fn(),
  updateProducto: vi.fn(),
  deleteProducto: vi.fn(),
}));

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from '@/services/productosService';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getProductos).mockResolvedValue(mockProductos as unknown as Producto[]);
  vi.mocked(createProducto).mockImplementation(async (data) => ({ ...data, id: '99' } as Producto));
  vi.mocked(updateProducto).mockImplementation(async (id, data) => ({ ...data, id } as Producto));
  vi.mocked(deleteProducto).mockResolvedValue({ success: true });
});

describe('useProductos', () => {
  it('carga productos desde la API al montar', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.productos).toHaveLength(2);
    expect(result.current.productos[0].name).toBe('Taladro Percutor Makita 710W');
  });

  it('el formulario vacío tiene los campos correctos', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.formData).toMatchObject({
      code: '',
      name: '',
      priceBuy: 0,
      priceRetail: 0,
      priceWholesale: 0,
      stock: 0,
      minStock: 0,
    });
  });

  it('handleOpenModal sin argumento abre modal en modo creación', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.handleOpenModal());

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.currentProduct).toBeNull();
    expect(result.current.formData.name).toBe('');
  });

  it('handleOpenModal con producto abre modal en modo edición con datos precargados', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const producto = result.current.productos[0];
    act(() => result.current.handleOpenModal(producto));

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.currentProduct).toEqual(producto);
    expect(result.current.formData.name).toBe(producto.name);
    expect(result.current.formData.code).toBe(producto.code);
  });

  it('handleSave crea un producto nuevo y lo agrega a la lista', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const totalAntes = result.current.productos.length;
    const nuevoProducto = {
      code: '9999999',
      name: 'Producto Test',
      category: 'Herramientas',
      priceBuy: 1000,
      priceRetail: 1500,
      priceWholesale: 1300,
      stock: 10,
      minStock: 3,
    };

    act(() => result.current.handleOpenModal());
    act(() => result.current.setFormData(nuevoProducto));

    const fakeEvent = { preventDefault: () => {} };
    await act(async () => result.current.handleSave(fakeEvent));

    expect(createProducto).toHaveBeenCalledWith(nuevoProducto);
    expect(result.current.productos.length).toBe(totalAntes + 1);
    expect(result.current.productos.at(-1)!.name).toBe('Producto Test');
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleSave edita un producto existente sin duplicarlo', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const producto = result.current.productos[0];
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleOpenModal(producto));
    act(() => result.current.setFormData({ ...producto, name: 'Nombre Editado' }));

    const fakeEvent = { preventDefault: () => {} };
    await act(async () => result.current.handleSave(fakeEvent));

    expect(updateProducto).toHaveBeenCalledWith(producto.id, { ...producto, name: 'Nombre Editado' });
    expect(result.current.productos.length).toBe(totalAntes);
    const editado = result.current.productos.find((p) => p.id === producto.id);
    expect(editado!.name).toBe('Nombre Editado');
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleDeleteClick marca el producto a eliminar y abre el diálogo de confirmación', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const producto = result.current.productos[0];
    act(() => result.current.handleDeleteClick(producto));

    expect(result.current.isConfirmOpen).toBe(true);
    expect(result.current.productToDelete).toEqual(producto);
  });

  it('handleConfirmDelete elimina el producto correcto de la lista', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const producto = result.current.productos[0];
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleDeleteClick(producto));
    await act(async () => result.current.handleConfirmDelete());

    expect(deleteProducto).toHaveBeenCalledWith(producto.id);
    expect(result.current.productos.length).toBe(totalAntes - 1);
    expect(result.current.productos.find((p) => p.id === producto.id)).toBeUndefined();
    expect(result.current.isConfirmOpen).toBe(false);
    expect(result.current.productToDelete).toBeNull();
  });

  it('handleConfirmDelete no hace nada si no hay producto marcado', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const totalAntes = result.current.productos.length;
    await act(async () => result.current.handleConfirmDelete());

    expect(deleteProducto).not.toHaveBeenCalled();
    expect(result.current.productos.length).toBe(totalAntes);
  });

  it('DEFAULT_CATEGORIES incluye las 5 categorías base', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const cats = result.current.DEFAULT_CATEGORIES;
    expect(cats).toContain('Herramientas');
    expect(cats).toContain('Construcción');
    expect(cats).toContain('Pintura');
    expect(cats).toContain('Eléctrico');
    expect(cats).toContain('Plomería');
  });
});
