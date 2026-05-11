import { mockProductos } from '@/mock/productos';

// Simulated delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const getProductos = async () => {
  await delay(300);
  return [...mockProductos];
};

export const createProducto = async (data) => {
  await delay(300);
  const newProduct = { ...data, id: Date.now() };
  return newProduct;
};

export const updateProducto = async (id, data) => {
  await delay(300);
  return { ...data, id };
};

export const deleteProducto = async (id) => {
  await delay(300);
  void id;
  return { success: true };
};
