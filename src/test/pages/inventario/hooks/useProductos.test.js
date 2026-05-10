import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProductos } from '@/pages/inventario/hooks/useProductos';

describe('useProductos', () => {
  it('carga el estado inicial con los productos del mock', () => {
    const { result } = renderHook(() => useProductos());
    expect(result.current.productos.length).toBe(20);
  });

  it('el formulario vacío tiene los campos correctos', () => {
    const { result } = renderHook(() => useProductos());
    const { formData } = result.current;
    expect(formData).toMatchObject({
      code: '',
      name: '',
      priceBuy: 0,
      priceRetail: 0,
      priceWholesale: 0,
      stock: 0,
      minStock: 0,
    });
  });


  it('handleOpenModal sin argumento abre modal en modo creación', () => {
    const { result } = renderHook(() => useProductos());

    act(() => result.current.handleOpenModal());

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.currentProduct).toBeNull();
    expect(result.current.formData.name).toBe('');
  });

  it('handleOpenModal con producto abre modal en modo edición con datos precargados', () => {
    const { result } = renderHook(() => useProductos());
    const producto = result.current.productos[0];

    act(() => result.current.handleOpenModal(producto));

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.currentProduct).toEqual(producto);
    expect(result.current.formData.name).toBe(producto.name);
    expect(result.current.formData.code).toBe(producto.code);
  });


  it('handleSave crea un producto nuevo y lo agrega a la lista', () => {
    const { result } = renderHook(() => useProductos());
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleOpenModal());
    act(() => {
      result.current.setFormData({
        code: '9999999',
        name: 'Producto Test',
        category: 'Herramientas',
        priceBuy: 1000,
        priceRetail: 1500,
        priceWholesale: 1300,
        stock: 10,
        minStock: 3,
      });
    });

    const fakeEvent = { preventDefault: () => {} };
    act(() => result.current.handleSave(fakeEvent));

    expect(result.current.productos.length).toBe(totalAntes + 1);
    expect(result.current.productos.at(-1).name).toBe('Producto Test');
    expect(result.current.isModalOpen).toBe(false);
  });


  it('handleSave edita un producto existente sin duplicarlo', () => {
    const { result } = renderHook(() => useProductos());
    const producto = result.current.productos[0];
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleOpenModal(producto));
    act(() => {
      result.current.setFormData({ ...producto, name: 'Nombre Editado' });
    });

    const fakeEvent = { preventDefault: () => {} };
    act(() => result.current.handleSave(fakeEvent));

    expect(result.current.productos.length).toBe(totalAntes);
    const editado = result.current.productos.find((p) => p.id === producto.id);
    expect(editado.name).toBe('Nombre Editado');
    expect(result.current.isModalOpen).toBe(false);
  });


  it('handleDeleteClick marca el producto a eliminar y abre el diálogo de confirmación', () => {
    const { result } = renderHook(() => useProductos());
    const producto = result.current.productos[0];

    act(() => result.current.handleDeleteClick(producto));

    expect(result.current.isConfirmOpen).toBe(true);
    expect(result.current.productToDelete).toEqual(producto);
  });


  it('handleConfirmDelete elimina el producto correcto de la lista', () => {
    const { result } = renderHook(() => useProductos());
    const producto = result.current.productos[0];
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleDeleteClick(producto));
    act(() => result.current.handleConfirmDelete());

    expect(result.current.productos.length).toBe(totalAntes - 1);
    expect(result.current.productos.find((p) => p.id === producto.id)).toBeUndefined();
    expect(result.current.isConfirmOpen).toBe(false);
    expect(result.current.productToDelete).toBeNull();
  });

  it('handleConfirmDelete no hace nada si no hay producto marcado', () => {
    const { result } = renderHook(() => useProductos());
    const totalAntes = result.current.productos.length;

    act(() => result.current.handleConfirmDelete());

    expect(result.current.productos.length).toBe(totalAntes);
  });

  it('DEFAULT_CATEGORIES incluye las 5 categorías base', () => {
    const { result } = renderHook(() => useProductos());
    const cats = result.current.DEFAULT_CATEGORIES;
    expect(cats).toContain('Herramientas');
    expect(cats).toContain('Construcción');
    expect(cats).toContain('Pintura');
    expect(cats).toContain('Eléctrico');
    expect(cats).toContain('Plomería');
  });
});