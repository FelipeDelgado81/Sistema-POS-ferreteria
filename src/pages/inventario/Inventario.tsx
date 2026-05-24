import { useRef, useEffect, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

import { useProductos } from './hooks/useProductos';
import { useIngreso }   from './hooks/useIngreso';

import ProductosTable  from './components/ProductosTable';
import StockAlertPanel from './components/StockAlertPanel';
import IngresosPanel   from './components/IngresosPanel';
import ProductoModal   from './components/ProductoModal';
import IngresoModal    from './components/IngresoModal';
import ImportProductosModal from './components/ImportProductosModal';

export default function Inventario() {
  const {
    productos, setProductos,
    formData, setFormData,
    currentProduct,
    isModalOpen, setIsModalOpen,
    isConfirmOpen, setIsConfirmOpen,
    productToDelete,
    handleOpenModal,
    handleSave,
    handleDeleteClick,
    handleConfirmDelete,
    DEFAULT_CATEGORIES,
  } = useProductos();

  const {
    ingresos,
    ingresoFormData, setIngresoFormData,
    isIngresoModalOpen, setIsIngresoModalOpen,
    selectedIngresoProduct,
    projectedStock,
    ingresoTotal,
    handleOpenIngresoModal,
    handleIngresoProductChange,
    handleSaveIngreso,
    mockProveedores,
  } = useIngreso(productos, setProductos);

  const [searchTerm, setSearchTerm]                 = useState('');
  const [selectedCategory, setSelectedCategory]     = useState('Todas');
  const [showOnlyLowStock, setShowOnlyLowStock]     = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isImportOpen, setIsImportOpen]             = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableCategories = [
    'Todas',
    ...new Set([...DEFAULT_CATEGORIES, ...productos.map((p) => p.category)]),
  ];

  const filteredProducts = productos.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch   = !term || p.name.toLowerCase().includes(term) || p.code.includes(searchTerm);
    const matchCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchStock    = !showOnlyLowStock || p.stock <= p.minStock;
    return matchSearch && matchCategory && matchStock;
  });

  const lowStockProducts         = productos.filter((p) => p.stock <= p.minStock);
  const criticalLowStockProducts = lowStockProducts.filter((p) => p.stock === 0);
  const warningLowStockProducts  = lowStockProducts.filter((p) => p.stock > 0);
  const estimatedRestockCost     = lowStockProducts.reduce(
    (t, p) => t + Math.max(p.minStock - p.stock, 0) * Number(p.priceBuy || 0), 0
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header — solo "Nuevo Producto", el ingreso va por el camión en cada fila */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500">Gestiona los productos, precios y stock</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Barra de alertas */}
      <StockAlertPanel
        lowStockProducts={lowStockProducts}
        criticalLowStockProducts={criticalLowStockProducts}
        warningLowStockProducts={warningLowStockProducts}
        estimatedRestockCost={estimatedRestockCost}
        showOnlyLowStock={showOnlyLowStock}
        setShowOnlyLowStock={setShowOnlyLowStock}
      />

      {/* Tabla */}
      <ProductosTable
        productos={filteredProducts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        availableCategories={availableCategories}
        showOnlyLowStock={showOnlyLowStock}
        isCategoryMenuOpen={isCategoryMenuOpen}
        setIsCategoryMenuOpen={setIsCategoryMenuOpen}
        categoryMenuRef={categoryMenuRef}
        onEdit={handleOpenModal}
        onDelete={handleDeleteClick}
        onIngreso={handleOpenIngresoModal}
      />

      {/* Últimos ingresos */}
      <IngresosPanel
        ingresos={ingresos}
        onOpenIngreso={handleOpenIngresoModal}
      />

      <ProductoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentProduct={currentProduct}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        categories={DEFAULT_CATEGORIES}
      />

      <IngresoModal
        isOpen={isIngresoModalOpen}
        onClose={() => setIsIngresoModalOpen(false)}
        ingresoFormData={ingresoFormData}
        setIngresoFormData={setIngresoFormData}
        productos={productos}
        mockProveedores={mockProveedores}
        handleIngresoProductChange={handleIngresoProductChange}
        handleSaveIngreso={handleSaveIngreso}
        selectedIngresoProduct={selectedIngresoProduct}
        projectedStock={projectedStock}
        ingresoTotal={ingresoTotal}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="¿Eliminar producto?"
        description={`¿Estás seguro de que deseas eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      <ImportProductosModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        productos={productos}
      />
    </div>
  );
}