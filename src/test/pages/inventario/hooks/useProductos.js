import { useState } from 'react';
import { mockProductos } from '@/mock/productos';

const DEFAULT_CATEGORIES = ['Herramientas', 'Construcción', 'Pintura', 'Eléctrico', 'Plomería'];

const emptyForm = {
  code: '',
  name: '',
  category: DEFAULT_CATEGORIES[0],
  priceBuy: 0,
  priceRetail: 0,
  priceWholesale: 0,
  stock: 0,
  minStock: 0,
};

export function useProductos() {
  const [productos, setProductos]           = useState(mockProductos);
  const [formData, setFormData]             = useState(emptyForm);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [isConfirmOpen, setIsConfirmOpen]   = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setFormData(product ?? emptyForm);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentProduct) {
      setProductos((prev) =>
        prev.map((p) => (p.id === currentProduct.id ? { ...formData, id: currentProduct.id } : p))
      );
    } else {
      setProductos((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      setProductos((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setIsConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  return {
    
    productos,
    setProductos,
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