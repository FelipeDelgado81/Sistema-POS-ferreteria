import React, { useRef, useEffect } from 'react';
import { Search, Filter, Edit, Trash, AlertTriangle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductosTable({
  productos,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  availableCategories,
  showOnlyLowStock,
  setShowOnlyLowStock,
  isCategoryMenuOpen,
  setIsCategoryMenuOpen,
  categoryMenuRef,
  onEdit,
  onDelete,
  onIngreso,
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Barra superior */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Escanear código de barras o buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
              className={cn(
                'flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg transition-colors font-medium text-sm',
                selectedCategory === 'Todas'
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
              )}
            >
              <Filter className="w-4 h-4" />
              {selectedCategory === 'Todas' ? 'Categorías' : selectedCategory}
            </button>

            {isCategoryMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-full min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      selectedCategory === category
                        ? 'bg-orange-50 text-orange-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showOnlyLowStock && (
        <div className="px-4 py-3 border-b border-slate-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">La tabla muestra solo productos con stock bajo.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowOnlyLowStock(false)}
            className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm font-medium text-amber-900 hover:bg-amber-50 transition-colors"
          >
            Quitar filtro
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">P. Costo</th>
              <th className="px-6 py-4">P. Retail / Mayor</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    {product.stock <= product.minStock && (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" title="Stock bajo" />
                    )}
                    {product.name}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs">{product.code}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">${Number(product.priceBuy).toLocaleString('es-CL')}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span>${Number(product.priceRetail).toLocaleString('es-CL')}</span>
                    <span className="text-xs text-slate-400">
                      May: ${Number(product.priceWholesale).toLocaleString('es-CL')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn('font-semibold', product.stock <= product.minStock ? 'text-amber-600' : 'text-emerald-600')}>
                    {product.stock}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ {product.minStock} min</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onIngreso(product)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                      title="Ingresar mercadería"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      title="Editar producto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  {showOnlyLowStock
                    ? 'No hay productos con stock bajo para este filtro.'
                    : 'No se encontraron productos con ese filtro.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
