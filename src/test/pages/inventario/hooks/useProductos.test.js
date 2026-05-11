import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductos } from '@/pages/inventario/hooks/useProductos';
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
} from '@/services/productosService';

vi.mock('@/services/productosService', () => ({
  getProductos: vi.fn(),
  createProducto: vi.fn(),
  updateProducto: vi.fn(),
  deleteProducto: vi.fn(),
}));

const productosMock = [
  {
    id: 'producto-1',
    code: '111',
    name: 'Martillo',
    category: 'Herramientas',
    priceBuy: 1000,
    priceRetail: 1500,
    priceWholesale: 1300,
    stock: 10,
    minStock: 3,
  },
  {
    id: 'producto-2',
    code: '222',
    name: 'Pintura',
    category: 'Pintura',
    priceBuy: 5000,
    priceRetail: 8000,
    priceWholesale: 7000,
    stock: 2,
    minStock: 4,
  },
];

describe('useProductos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProductos.mockResolvedValue([...productosMock]);
  });

  it('carga productos desde la API', async () => {
    const { result } = renderHook(() => useProductos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getProductos).toHaveBeenCalledTimes(1);
    expect(result.current.productos).toEqual(productosMock);
  });

  it('el formulario vacio tiene los campos correctos', async () => {
    const { result } = renderHook(() => useProductos());
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

  it('handleOpenModal sin argumento abre modal en modo creacion', async () => {
    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.handleOpenModal());

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.currentProduct).toBeNull();
    expect(result.current.formData.name).toBe('');
  });

  it('handleOpenModal con producto abre modal en modo edicion con datos precargados', async () => {
    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const producto = result.current.productos[0];

    act(() => result.current.handleOpenModal(producto));

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.currentProduct).toEqual(producto);
    expect(result.current.formData.name).toBe(producto.name);
    expect(result.current.formData.code).toBe(producto.code);
  });

  it('handleSave crea un producto nuevo y lo agrega a la lista', async () => {
    const created = { ...productosMock[0], id: 'producto-3', code: '333', name: 'Producto Test' };
    createProducto.mockResolvedValue(created);

    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleOpenModal());
    act(() => {
      result.current.setFormData({
        code: '333',
        name: 'Producto Test',
        category: 'Herramientas',
        priceBuy: 1000,
        priceRetail: 1500,
        priceWholesale: 1300,
        stock: 10,
        minStock: 3,
      });
    });

    await act(async () => {
      await result.current.handleSave({ preventDefault: () => {} });
    });

    expect(createProducto).toHaveBeenCalledWith(expect.objectContaining({ code: '333' }));
    expect(result.current.productos.length).toBe(totalAntes + 1);
    expect(result.current.productos.some((p) => p.id === 'producto-3')).toBe(true);
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleSave edita un producto existente sin duplicarlo', async () => {
    const updated = { ...productosMock[0], name: 'Nombre Editado' };
    updateProducto.mockResolvedValue(updated);

    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const producto = result.current.productos[0];
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleOpenModal(producto));
    act(() => {
      result.current.setFormData({ ...producto, name: 'Nombre Editado' });
    });

    await act(async () => {
      await result.current.handleSave({ preventDefault: () => {} });
    });

    expect(updateProducto).toHaveBeenCalledWith(producto.id, expect.objectContaining({ name: 'Nombre Editado' }));
    expect(result.current.productos.length).toBe(totalAntes);
    expect(result.current.productos.find((p) => p.id === producto.id).name).toBe('Nombre Editado');
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleDeleteClick marca el producto a eliminar y abre el dialogo de confirmacion', async () => {
    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const producto = result.current.productos[0];

    act(() => result.current.handleDeleteClick(producto));

    expect(result.current.isConfirmOpen).toBe(true);
    expect(result.current.productToDelete).toEqual(producto);
  });

  it('handleConfirmDelete elimina el producto correcto de la lista', async () => {
    deleteProducto.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const producto = result.current.productos[0];
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleDeleteClick(producto));
    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(deleteProducto).toHaveBeenCalledWith(producto.id);
    expect(result.current.productos.length).toBe(totalAntes - 1);
    expect(result.current.productos.find((p) => p.id === producto.id)).toBeUndefined();
    expect(result.current.isConfirmOpen).toBe(false);
    expect(result.current.productToDelete).toBeNull();
  });

  it('handleConfirmDelete no hace nada si no hay producto marcado', async () => {
    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const totalAntes = result.current.productos.length;

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(deleteProducto).not.toHaveBeenCalled();
    expect(result.current.productos.length).toBe(totalAntes);
  });

  it('DEFAULT_CATEGORIES incluye las 5 categorias base', async () => {
    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.DEFAULT_CATEGORIES).toEqual([
      'Herramientas',
      'Construcción',
      'Pintura',
      'Eléctrico',
      'Plomería',
    ]);
  });
});
