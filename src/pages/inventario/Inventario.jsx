import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus, Filter, Edit, Trash, AlertTriangle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockProductos } from '@/mock/productos';
import { mockProveedores } from '@/mock/proveedores';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const defaultCategories = ['Herramientas', 'Construcción', 'Pintura', 'Eléctrico', 'Plomería'];

const getCurrentDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('es-CL')}`;

export default function Inventario() {
  const [productos, setProductos] = useState(mockProductos);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const categoryMenuRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [ingresos, setIngresos] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: defaultCategories[0],
    priceBuy: 0,
    priceRetail: 0,
    priceWholesale: 0,
    stock: 0,
    minStock: 0,
  });

  const buildIngresoFormData = (productId = null) => {
    const fallbackProduct = productos[0];
    const selectedProduct =
      productos.find((product) => product.id === Number(productId)) || fallbackProduct;

    return {
      proveedorId: mockProveedores[0]?.id ?? '',
      productId: selectedProduct?.id ?? '',
      quantity: 1,
      unitCost: selectedProduct?.priceBuy ?? 0,
      invoiceNumber: '',
      date: getCurrentDateInputValue(),
      notes: '',
    };
  };

  const [ingresoFormData, setIngresoFormData] = useState(() => buildIngresoFormData());

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableCategories = [
    'Todas',
    ...new Set([...defaultCategories, ...productos.map((product) => product.category)]),
  ];

  const filteredProducts = productos.filter((product) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch === '' ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.code.includes(searchTerm);
    const matchesCategory =
      selectedCategory === 'Todas' || product.category === selectedCategory;
    const matchesLowStock = !showOnlyLowStock || product.stock <= product.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockProducts = productos
    .filter((product) => product.stock <= product.minStock)
    .sort((a, b) => (a.stock - a.minStock) - (b.stock - b.minStock));

  const selectedIngresoProduct = productos.find(
    (product) => product.id === Number(ingresoFormData.productId)
  );
  const selectedIngresoSupplier = mockProveedores.find(
    (supplier) => supplier.id === Number(ingresoFormData.proveedorId)
  );
  const ingresoQuantity = Number(ingresoFormData.quantity) || 0;
  const ingresoUnitCost = Number(ingresoFormData.unitCost) || 0;
  const projectedStock = (selectedIngresoProduct?.stock ?? 0) + ingresoQuantity;
  const ingresoTotal = ingresoQuantity * ingresoUnitCost;

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData(product);
    } else {
      setCurrentProduct(null);
      setFormData({
        code: '',
        name: '',
        category: defaultCategories[0],
        priceBuy: 0,
        priceRetail: 0,
        priceWholesale: 0,
        stock: 0,
        minStock: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenIngresoModal = (product = null) => {
    setIngresoFormData(buildIngresoFormData(product?.id));
    setIsIngresoModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (currentProduct) {
      setProductos((prev) =>
        prev.map((product) =>
          product.id === currentProduct.id ? { ...formData, id: currentProduct.id } : product
        )
      );
    } else {
      setProductos((prev) => [...prev, { ...formData, id: Date.now() }]);
    }

    setIsModalOpen(false);
  };

  const handleIngresoProductChange = (productId) => {
    const nextProduct = productos.find((product) => product.id === Number(productId));

    setIngresoFormData((prev) => ({
      ...prev,
      productId,
      unitCost: nextProduct?.priceBuy ?? 0,
    }));
  };

  const handleSaveIngreso = (e) => {
    e.preventDefault();

    if (!selectedIngresoProduct || !selectedIngresoSupplier || ingresoQuantity <= 0) {
      return;
    }

    const ingresoRecord = {
      id: Date.now(),
      proveedorId: selectedIngresoSupplier.id,
      proveedorNombre: selectedIngresoSupplier.razonSocial,
      productId: selectedIngresoProduct.id,
      productName: selectedIngresoProduct.name,
      quantity: ingresoQuantity,
      unitCost: ingresoUnitCost,
      totalCost: ingresoTotal,
      invoiceNumber: ingresoFormData.invoiceNumber.trim(),
      date: ingresoFormData.date,
      notes: ingresoFormData.notes.trim(),
    };

    setProductos((prev) =>
      prev.map((product) =>
        product.id === selectedIngresoProduct.id
          ? {
              ...product,
              stock: product.stock + ingresoQuantity,
              priceBuy: ingresoUnitCost || product.priceBuy,
            }
          : product
      )
    );

    setIngresos((prev) => [ingresoRecord, ...prev].slice(0, 6));
    setIsIngresoModalOpen(false);
    setIngresoFormData(buildIngresoFormData(selectedIngresoProduct.id));
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      setProductos((prev) => prev.filter((product) => product.id !== productToDelete.id));
      setIsConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500">Gestiona los productos, precios y stock</p>
        </div>
        <div className="flex w-full lg:w-auto flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => handleOpenIngresoModal()}
            className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Truck className="w-4 h-4" />
            Ingresar Mercadería
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {product.stock <= product.minStock && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" title="Stock bajo" />
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
                  <td className="px-6 py-4">{formatCurrency(product.priceBuy)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{formatCurrency(product.priceRetail)}</span>
                      <span className="text-xs text-slate-400">
                        May: {formatCurrency(product.priceWholesale)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'font-semibold',
                        product.stock <= product.minStock ? 'text-amber-600' : 'text-emerald-600'
                      )}
                    >
                      {product.stock}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ {product.minStock} min</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenIngresoModal(product)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                        title="Ingresar mercadería"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(product)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        title="Editar producto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(product)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No se encontraron productos con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-50/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Alertas de stock bajo</h2>
              <p className="text-sm text-slate-600">
                Productos que ya alcanzaron o bajaron de su stock mínimo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-800 font-medium">
              {lowStockProducts.length} alertas activas
            </span>
            {lowStockProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOnlyLowStock((prev) => !prev)}
                className={cn(
                  'px-3 py-1 rounded-full border font-medium transition-colors',
                  showOnlyLowStock
                    ? 'border-amber-300 bg-amber-100 text-amber-900'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                {showOnlyLowStock ? 'Mostrar toda la tabla' : 'Ver solo alertas en tabla'}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {lowStockProducts.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No hay productos con stock bajo en este momento.
            </div>
          ) : (
            lowStockProducts.map((product) => {
              const faltante = Math.max(product.minStock - product.stock, 0);

              return (
                <div
                  key={product.id}
                  className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Código: {product.code} · Mínimo: {product.minStock} · Disponible: {product.stock}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                      Faltan {faltante} unidades
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenIngresoModal(product)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      Reponer stock
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Últimos ingresos</h2>
            <p className="text-sm text-slate-500">
              Compras registradas a proveedores y su impacto en stock.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenIngresoModal()}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            Registrar ingreso
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {ingresos.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Aún no hay ingresos registrados.
            </div>
          ) : (
            ingresos.map((ingreso) => (
              <div
                key={ingreso.id}
                className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{ingreso.productName}</p>
                  <p className="text-sm text-slate-500">
                    {ingreso.proveedorNombre}
                    {ingreso.invoiceNumber ? ` · Factura/OC ${ingreso.invoiceNumber}` : ''}
                  </p>
                  {ingreso.notes && (
                    <p className="text-xs text-slate-400 mt-1">{ingreso.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    +{ingreso.quantity} unidades
                  </span>
                  <span className="text-slate-500">{ingreso.date}</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(ingreso.totalCost)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isIngresoModalOpen}
        onClose={() => setIsIngresoModalOpen(false)}
        title="Ingreso de Mercadería"
      >
        <form onSubmit={handleSaveIngreso} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
              <select
                required
                value={ingresoFormData.proveedorId}
                onChange={(e) =>
                  setIngresoFormData({ ...ingresoFormData, proveedorId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                {mockProveedores.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.razonSocial}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Producto</label>
              <select
                required
                value={ingresoFormData.productId}
                onChange={(e) => handleIngresoProductChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                {productos.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span className="text-slate-500">Stock actual</span>
            <span className="font-medium text-slate-800">
              {selectedIngresoProduct?.stock ?? 0}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span className="text-slate-500">Stock proyectado</span>
            <span className="font-semibold text-emerald-700">{projectedStock}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span className="text-slate-500">Total compra</span>
            <span className="font-semibold text-slate-900">{formatCurrency(ingresoTotal)}</span>
          </div>
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsIngresoModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Registrar Ingreso
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código de barras</label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                {defaultCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Compra ($)</label>
              <input
                required
                type="number"
                min="0"
                value={formData.priceBuy}
                onChange={(e) => setFormData({ ...formData, priceBuy: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Margen Retail</label>
              <div className="px-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded-lg font-medium">
                {formatCurrency(Math.max(0, formData.priceRetail - formData.priceBuy))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta Retail ($)</label>
              <input
                required
                type="number"
                min="0"
                value={formData.priceRetail}
                onChange={(e) => setFormData({ ...formData, priceRetail: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta Mayorista ($)</label>
              <input
                required
                type="number"
                min="0"
                value={formData.priceWholesale}
                onChange={(e) => setFormData({ ...formData, priceWholesale: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
              <input
                required
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
              <input
                required
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="¿Eliminar producto?"
        description={`¿Estás seguro de que deseas eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
