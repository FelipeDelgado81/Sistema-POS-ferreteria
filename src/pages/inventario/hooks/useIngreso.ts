import { useState, type Dispatch, type SetStateAction } from 'react';
import { mockProveedores } from '@/mock/proveedores';
import type { Producto, IngresoForm, IngresoRecord } from '@/types';

const getCurrentDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

function buildIngresoForm(productos: Producto[], productId: string | number | null = null): IngresoForm {
  const product =
    productos.find((p) => p.id === String(productId)) ?? productos[0];

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

export function useIngreso(
  productos: Producto[],
  setProductos: Dispatch<SetStateAction<Producto[]>>,
) {
  const [ingresos, setIngresos]                     = useState<IngresoRecord[]>([]);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [ingresoFormData, setIngresoFormData]       = useState<IngresoForm>(() =>
    buildIngresoForm(productos)
  );

  const selectedIngresoProduct = productos.find(
    (p) => p.id === String(ingresoFormData.productId)
  );
  const selectedIngresoSupplier = mockProveedores.find(
    (s) => s.id === Number(ingresoFormData.proveedorId)
  );
  const ingresoQuantity = Number(ingresoFormData.quantity) || 0;
  const ingresoUnitCost = Number(ingresoFormData.unitCost) || 0;
  const projectedStock  = (selectedIngresoProduct?.stock ?? 0) + ingresoQuantity;
  const ingresoTotal    = ingresoQuantity * ingresoUnitCost;

  const handleOpenIngresoModal = (product: Producto | null = null) => {
    setIngresoFormData(buildIngresoForm(productos, product?.id ?? null));
    setIsIngresoModalOpen(true);
  };

  const handleIngresoProductChange = (productId: string) => {
    const next = productos.find((p) => p.id === productId);
    setIngresoFormData((prev) => ({
      ...prev,
      productId,
      unitCost: next?.priceBuy ?? 0,
    }));
  };

  const handleSaveIngreso = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!selectedIngresoProduct || !selectedIngresoSupplier || ingresoQuantity <= 0) return;

    const record: IngresoRecord = {
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
