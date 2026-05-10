import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIngreso } from '@/pages/inventario/hooks/useIngreso';
import { mockProductos } from '@/mock/productos';

function setup(productosOverride) {
  const productos = productosOverride ?? [...mockProductos];
  const setProductos = vi.fn((updater) => {
    if (typeof updater === 'function') updater(productos);
  });
  return renderHook(() => useIngreso(productos, setProductos));
}

describe('useIngreso', () => {
  it('inicializa con el primer producto y su precio de compra', () => {
    const { result } = setup();
    const primerProducto = mockProductos[0];

    expect(result.current.ingresoFormData.productId).toBe(primerProducto.id);
    expect(result.current.ingresoFormData.unitCost).toBe(primerProducto.priceBuy);
    expect(result.current.ingresoFormData.quantity).toBe(1);
    expect(result.current.ingresoFormData.invoiceNumber).toBe('');
    expect(result.current.ingresoFormData.notes).toBe('');
  });

  it('inicializa la fecha con el día de hoy', () => {
    const { result } = setup();
    const hoy = new Date();
    const esperado = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    expect(result.current.ingresoFormData.date).toBe(esperado);
  });

  it('el modal empieza cerrado y sin ingresos', () => {
    const { result } = setup();
    expect(result.current.isIngresoModalOpen).toBe(false);
    expect(result.current.ingresos).toHaveLength(0);
  });


  it('handleOpenIngresoModal abre el modal', () => {
    const { result } = setup();

    act(() => result.current.handleOpenIngresoModal());

    expect(result.current.isIngresoModalOpen).toBe(true);
  });

  it('handleOpenIngresoModal con producto pre-selecciona ese producto', () => {
    const { result } = setup();
    const producto = mockProductos[3];

    act(() => result.current.handleOpenIngresoModal(producto));

    expect(result.current.ingresoFormData.productId).toBe(producto.id);
    expect(result.current.ingresoFormData.unitCost).toBe(producto.priceBuy);
  });


  it('handleIngresoProductChange actualiza el producto y el costo unitario al precio de compra', () => {
    const { result } = setup();
    const producto = mockProductos[5];

    act(() => result.current.handleIngresoProductChange(producto.id));

    expect(result.current.ingresoFormData.productId).toBe(producto.id);
    expect(result.current.ingresoFormData.unitCost).toBe(producto.priceBuy);
  });


  it('projectedStock suma el stock actual más la cantidad ingresada', () => {
    const { result } = setup();
    const producto = mockProductos[0];

    act(() => result.current.handleOpenIngresoModal(producto));
    act(() => {
      result.current.setIngresoFormData({
        ...result.current.ingresoFormData,
        quantity: 10,
      });
    });

    expect(result.current.projectedStock).toBe(producto.stock + 10);
  });

  it('ingresoTotal es quantity × unitCost', () => {
    const { result } = setup();

    act(() => {
      result.current.setIngresoFormData({
        ...result.current.ingresoFormData,
        quantity: 5,
        unitCost: 2000,
      });
    });

    expect(result.current.ingresoTotal).toBe(10000);
  });

  it('ingresoTotal es 0 cuando quantity es 0', () => {
    const { result } = setup();

    act(() => {
      result.current.setIngresoFormData({
        ...result.current.ingresoFormData,
        quantity: 0,
        unitCost: 5000,
      });
    });

    expect(result.current.ingresoTotal).toBe(0);
  });


  it('handleSaveIngreso registra el ingreso y cierra el modal', () => {
    const productos = [...mockProductos];
    const setProductos = vi.fn();
    const { result } = renderHook(() => useIngreso(productos, setProductos));
    const producto = mockProductos[0];

    act(() => result.current.handleOpenIngresoModal(producto));
    act(() => {
      result.current.setIngresoFormData({
        ...result.current.ingresoFormData,
        quantity: 5,
        unitCost: 1000,
        invoiceNumber: 'F-001',
        notes: 'Reposición urgente',
      });
    });

    const fakeEvent = { preventDefault: () => {} };
    act(() => result.current.handleSaveIngreso(fakeEvent));

    // El modal debe cerrarse
    expect(result.current.isIngresoModalOpen).toBe(false);

    // setProductos debe haberse llamado para actualizar el stock
    expect(setProductos).toHaveBeenCalled();

    // El registro debe aparecer en el historial
    expect(result.current.ingresos).toHaveLength(1);
    expect(result.current.ingresos[0].quantity).toBe(5);
    expect(result.current.ingresos[0].totalCost).toBe(5000);
    expect(result.current.ingresos[0].invoiceNumber).toBe('F-001');
  });

  it('handleSaveIngreso no hace nada si quantity es 0', () => {
    const productos = [...mockProductos];
    const setProductos = vi.fn();
    const { result } = renderHook(() => useIngreso(productos, setProductos));

    act(() => {
      result.current.setIngresoFormData({
        ...result.current.ingresoFormData,
        quantity: 0,
      });
    });

    const fakeEvent = { preventDefault: () => {} };
    act(() => result.current.handleSaveIngreso(fakeEvent));

    expect(setProductos).not.toHaveBeenCalled();
    expect(result.current.ingresos).toHaveLength(0);
  });

  it('el historial no supera 6 registros', () => {
    const productos = [...mockProductos];
    const setProductos = vi.fn();
    const { result } = renderHook(() => useIngreso(productos, setProductos));
    const fakeEvent = { preventDefault: () => {} };

    // Registrar 7 ingresos
    for (let i = 0; i < 7; i++) {
      act(() => result.current.handleOpenIngresoModal(mockProductos[0]));
      act(() => result.current.handleSaveIngreso(fakeEvent));
    }

    expect(result.current.ingresos.length).toBeLessThanOrEqual(6);
  });
});