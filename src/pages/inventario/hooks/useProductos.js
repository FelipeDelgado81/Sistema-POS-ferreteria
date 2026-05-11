import { useEffect, useState } from 'react';
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
} from '@/services/productosService';

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
  const [productos, setProductos]             = useState([]);
  const [formData, setFormData]               = useState(emptyForm);
  const [currentProduct, setCurrentProduct]   = useState(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isConfirmOpen, setIsConfirmOpen]     = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState('');

  const loadProductos = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProductos();
      setProductos(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialProductos = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getProductos();
        if (isMounted) setProductos(data);
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || err.message || 'No se pudo cargar el inventario');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialProductos();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setFormData(product ?? emptyForm);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (currentProduct) {
        const updated = await updateProducto(currentProduct.id, formData);
        setProductos((prev) => prev.map((p) => (p.id === currentProduct.id ? updated : p)));
      } else {
        const created = await createProducto(formData);
        setProductos((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setSaving(true);
    setError('');

    try {
      await deleteProducto(productToDelete.id);
      setProductos((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setIsConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No se pudo eliminar el producto');
    } finally {
      setSaving(false);
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
    loading,
    saving,
    error,
    reloadProductos: loadProductos,

    handleOpenModal,
    handleSave,
    handleDeleteClick,
    handleConfirmDelete,

    DEFAULT_CATEGORIES,
  };
}
