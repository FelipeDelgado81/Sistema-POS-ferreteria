import { useState, type Dispatch, type SetStateAction } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { Producto, ProductoForm } from '@/types';
import {
  PRODUCTOS_KEY,
  useProductosQuery,
  useCreateProducto,
  useUpdateProducto,
  useDeleteProducto,
} from '@/hooks/queries/useProductosQuery';

const DEFAULT_CATEGORIES = ['Herramientas', 'Construcción', 'Pintura', 'Eléctrico', 'Plomería'] as const;

const emptyForm: ProductoForm = {
  code: '',
  name: '',
  category: DEFAULT_CATEGORIES[0],
  priceBuy: 0,
  priceRetail: 0,
  priceWholesale: 0,
  stock: 0,
  minStock: 0,
};

function extractError(err: unknown): string {
  if (isAxiosError(err)) return err.response?.data?.error ?? err.message;
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}

export function useProductos() {
  const qc = useQueryClient();
  const { data: productos = [], isLoading: loading, error: queryError } = useProductosQuery();
  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();

  const [error, setError]                     = useState<string | null>(null);
  const [formData, setFormData]               = useState<ProductoForm>(emptyForm);
  const [currentProduct, setCurrentProduct]   = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isConfirmOpen, setIsConfirmOpen]     = useState(false);
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null);

  const setProductos: Dispatch<SetStateAction<Producto[]>> = (update) => {
    qc.setQueryData<Producto[]>(PRODUCTOS_KEY, (prev = []) =>
      typeof update === 'function'
        ? (update as (p: Producto[]) => Producto[])(prev)
        : update,
    );
  };

  const handleOpenModal = (product: Producto | null = null) => {
    setCurrentProduct(product);
    setFormData(product ?? emptyForm);
    setIsModalOpen(true);
  };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    try {
      if (currentProduct) {
        await updateMutation.mutateAsync({ id: currentProduct.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(extractError(err));
    }
  };

  const handleDeleteClick = (product: Producto) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      setIsConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(extractError(err));
    }
  };

  return {
    productos,
    setProductos,
    loading,
    error: error ?? (queryError ? extractError(queryError) : null),
    formData,
    setFormData,
    currentProduct,
    isModalOpen,
    setIsModalOpen,
    isConfirmOpen,
    setIsConfirmOpen,
    productToDelete,

    handleOpenModal,
    handleSave,
    handleDeleteClick,
    handleConfirmDelete,

    DEFAULT_CATEGORIES,
  };
}
