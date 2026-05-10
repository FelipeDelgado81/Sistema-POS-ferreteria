import { useState } from 'react';
import { mockProveedores } from '@/mock/proveedores';

const getCurrentDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

function buildIngresoForm(productos, productId = null) {
  const product =
    productos.find((p) => p.id === Number(productId)) ?? productos[0];

  return {
    proveedorId:   mockProveedores[0]?.id ?? '',
    productId:     product?.id ?? '',
    quantity:      1,
    unitCost:      product?.priceBuy ?? 0,
    invoiceNumber: '',
    date:          getCurrentDate(),
    notes:         '',
  };
}

export function useIngreso(productos, setProductos) {
  const [ingresos, setIngresos]                   = useState([]);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [ingresoFormData, setIngresoFormData]       = useState(() =>
    buildIngresoForm(productos)
  );

  const selectedIngresoProduct = productos.find(
    (p) => p.id === Number(ingresoFormData.productId)
  );
  const selectedIngresoSupplier = mockProveedores.find(
    (s) => s.id === Number(ingresoFormData.proveedorId)
  );
  const ingresoQuantity = Number(ingresoFormData.quantity) || 0;
  const ingresoUnitCost = Number(ingresoFormData.unitCost) || 0;
  const projectedStock  = (selectedIngresoProduct?.stock ?? 0) + ingresoQuantity;
  const ingresoTotal    = ingresoQuantity * ingresoUnitCost;

  const handleOpenIngresoModal = (product = null) => {
    setIngresoFormData(buildIngresoForm(productos, product?.id));
    setIsIngresoModalOpen(true);
  };

  const handleIngresoProductChange = (productId) => {
    const next = productos.find((p) => p.id === Number(productId));
    setIngresoFormData((prev) => ({
      ...prev,
      productId,
      unitCost: next?.priceBuy ?? 0,
    }));
  };

  const handleSaveIngreso = (e) => {
    e.preventDefault();
    if (!selectedIngresoProduct || !selectedIngresoSupplier || ingresoQuantity <= 0) return;

    const record = {
      id:              Date.now(),
      proveedorId:     selectedIngresoSupplier.id,
      proveedorNombre: selectedIngresoSupplier.razonSocial,
      productId:       selectedIngresoProduct.id,
      productName:     selectedIngresoProduct.name,
      quantity:        ingresoQuantity,
      unitCost:        ingresoUnitCost,
      totalCost:       ingresoTotal,
      invoiceNumber:   ingresoFormData.invoiceNumber.trim(),
      date:            ingresoFormData.date,
      notes:           ingresoFormData.notes.trim(),
    };

    // actualizar stock del producto y precio de compra
    setProductos((prev) =>
      prev.map((p) =>
        p.id === selectedIngresoProduct.id
          ? { ...p, stock: p.stock + ingresoQuantity, priceBuy: ingresoUnitCost || p.priceBuy }
          : p
      )
    );

    setIngresos((prev) => [record, ...prev].slice(0, 6));
    setIsIngresoModalOpen(false);
    setIngresoFormData(buildIngresoForm(productos, selectedIngresoProduct.id));
  };

  return {
    ingresos,
    ingresoFormData,
    setIngresoFormData,
    isIngresoModalOpen,
    setIsIngresoModalOpen,
    
    selectedIngresoProduct,
    projectedStock,
    ingresoTotal,
    
    handleOpenIngresoModal,
    handleIngresoProductChange,
    handleSaveIngreso,
    
    mockProveedores,
  };
}