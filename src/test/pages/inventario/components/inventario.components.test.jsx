import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StockAlertPanel from '@/pages/inventario/components/StockAlertPanel';
import ProductosTable  from '@/pages/inventario/components/ProductosTable';
import { mockProductos } from '@/mock/productos';

//Datos de prueba

const sinStock    = mockProductos.filter((p) => p.stock === 0);
const stockBajo   = mockProductos.filter((p) => p.stock > 0 && p.stock <= p.minStock);
const todosAlerta = [...sinStock, ...stockBajo];

const estimatedRestockCost = todosAlerta.reduce(
  (t, p) => t + Math.max(p.minStock - p.stock, 0) * Number(p.priceBuy || 0), 0
);

// Props base para StockAlertPanel
function alertPanelProps(overrides = {}) {
  return {
    lowStockProducts:         todosAlerta,
    criticalLowStockProducts: sinStock,
    warningLowStockProducts:  stockBajo,
    estimatedRestockCost,
    showOnlyLowStock:         false,
    setShowOnlyLowStock:      vi.fn(),
    ...overrides,
  };
}

// Props base para ProductosTable
function tableProps(overrides = {}) {
  return {
    productos:             mockProductos,
    searchTerm:            '',
    setSearchTerm:         vi.fn(),
    selectedCategory:      'Todas',
    setSelectedCategory:   vi.fn(),
    availableCategories:   ['Todas', 'Herramientas', 'Construcción', 'Pintura', 'Eléctrico', 'Plomería'],
    showOnlyLowStock:      false,
    isCategoryMenuOpen:    false,
    setIsCategoryMenuOpen: vi.fn(),
    categoryMenuRef:       { current: null },
    onEdit:                vi.fn(),
    onDelete:              vi.fn(),
    onIngreso:             vi.fn(),
    ...overrides,
  };
}

// StockAlertPanel

describe('StockAlertPanel', () => {
  it('no renderiza nada si no hay productos con stock bajo', () => {
    const { container } = render(
      <StockAlertPanel
        lowStockProducts={[]}
        criticalLowStockProducts={[]}
        warningLowStockProducts={[]}
        estimatedRestockCost={0}
        showOnlyLowStock={false}
        setShowOnlyLowStock={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra el conteo correcto de sin stock', () => {
    render(<StockAlertPanel {...alertPanelProps()} />);
    expect(screen.getByText(String(sinStock.length))).toBeInTheDocument();
  });

  it('muestra el conteo correcto de stock bajo', () => {
    render(<StockAlertPanel {...alertPanelProps()} />);
    expect(screen.getByText(String(stockBajo.length))).toBeInTheDocument();
  });

  it('muestra el costo estimado de reposición formateado', () => {
    render(<StockAlertPanel {...alertPanelProps()} />);
    const costoFormateado = `$${estimatedRestockCost.toLocaleString('es-CL')}`;
    expect(screen.getByText(costoFormateado)).toBeInTheDocument();
  });

  it('el botón dice "Ver solo alertas" cuando el filtro está desactivado', () => {
    render(<StockAlertPanel {...alertPanelProps({ showOnlyLowStock: false })} />);
    expect(screen.getByRole('button', { name: /ver solo alertas/i })).toBeInTheDocument();
  });

  it('el botón dice "Ver todos los productos" cuando el filtro está activado', () => {
    render(<StockAlertPanel {...alertPanelProps({ showOnlyLowStock: true })} />);
    expect(screen.getByRole('button', { name: /ver todos los productos/i })).toBeInTheDocument();
  });

  it('llamar al botón invoca setShowOnlyLowStock', () => {
    const setShowOnlyLowStock = vi.fn();
    render(<StockAlertPanel {...alertPanelProps({ setShowOnlyLowStock })} />);
    fireEvent.click(screen.getByRole('button', { name: /ver solo alertas/i }));
    expect(setShowOnlyLowStock).toHaveBeenCalledTimes(1);
  });
});

// ─── ProductosTable ────────────────────────────────────────────────────────

describe('ProductosTable', () => {
  it('renderiza todos los productos del mock', () => {
    render(<ProductosTable {...tableProps()} />);
    mockProductos.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    });
  });

  it('muestra el mensaje vacío si no hay productos', () => {
    render(<ProductosTable {...tableProps({ productos: [] })} />);
    expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument();
  });

  it('muestra mensaje específico cuando el filtro de alertas está activo y no hay resultados', () => {
    render(
      <ProductosTable
        {...tableProps({ productos: [], showOnlyLowStock: true })}
      />
    );
    expect(screen.getByText(/no hay productos con stock bajo/i)).toBeInTheDocument();
  });

  it('muestra el banner informativo cuando showOnlyLowStock es true', () => {
    render(<ProductosTable {...tableProps({ showOnlyLowStock: true })} />);
    expect(screen.getByText(/mostrando solo productos con stock bajo/i)).toBeInTheDocument();
  });

  it('no muestra el banner cuando showOnlyLowStock es false', () => {
    render(<ProductosTable {...tableProps({ showOnlyLowStock: false })} />);
    expect(screen.queryByText(/mostrando solo productos con stock bajo/i)).toBeNull();
  });

  it('llama a onEdit con el producto correcto al hacer clic en editar', async () => {
    const onEdit = vi.fn();
    const { getAllByTitle } = render(
      <ProductosTable {...tableProps({ onEdit })} />
    );
    fireEvent.click(getAllByTitle('Editar producto')[0]);
    expect(onEdit).toHaveBeenCalledWith(mockProductos[0]);
  });

  it('llama a onDelete con el producto correcto al hacer clic en eliminar', () => {
    const onDelete = vi.fn();
    const { getAllByTitle } = render(
      <ProductosTable {...tableProps({ onDelete })} />
    );
    fireEvent.click(getAllByTitle('Eliminar producto')[0]);
    expect(onDelete).toHaveBeenCalledWith(mockProductos[0]);
  });

  it('llama a onIngreso con el producto correcto al hacer clic en el camión', () => {
    const onIngreso = vi.fn();
    const { getAllByTitle } = render(
      <ProductosTable {...tableProps({ onIngreso })} />
    );
    fireEvent.click(getAllByTitle('Ingresar mercadería')[0]);
    expect(onIngreso).toHaveBeenCalledWith(mockProductos[0]);
  });

  it('el input de búsqueda llama a setSearchTerm al escribir', () => {
    const setSearchTerm = vi.fn();
    render(<ProductosTable {...tableProps({ setSearchTerm })} />);
    fireEvent.change(screen.getByPlaceholderText(/escanear código/i), {
      target: { value: 'Taladro' },
    });
    expect(setSearchTerm).toHaveBeenCalledWith('Taladro');
  });

  it('las filas de productos sin stock tienen clase bg-rose-50', () => {
    const sinStockProducto = mockProductos.find((p) => p.stock === 0);
    const { container } = render(
      <ProductosTable
        {...tableProps({
          productos:       [sinStockProducto],
          showOnlyLowStock: true,
        })}
      />
    );
    const fila = container.querySelector('tbody tr');
    expect(fila.className).toMatch(/bg-rose-50/);
  });

  it('las filas de productos con stock bajo tienen clase bg-amber-50', () => {
    const stockBajoProducto = mockProductos.find(
      (p) => p.stock > 0 && p.stock <= p.minStock
    );
    const { container } = render(
      <ProductosTable
        {...tableProps({
          productos:        [stockBajoProducto],
          showOnlyLowStock: true,
        })}
      />
    );
    const fila = container.querySelector('tbody tr');
    expect(fila.className).toMatch(/bg-amber-50/);
  });

  it('las filas normales no tienen clases de alerta', () => {
    const normal = mockProductos.find((p) => p.stock > p.minStock);
    const { container } = render(
      <ProductosTable
        {...tableProps({ productos: [normal], showOnlyLowStock: false })}
      />
    );
    const fila = container.querySelector('tbody tr');
    expect(fila.className).not.toMatch(/bg-rose/);
    expect(fila.className).not.toMatch(/bg-amber/);
  });
});