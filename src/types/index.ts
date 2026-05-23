// Domain types — shared across frontend and API layer

export interface Producto {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  categoryId: string | null;
  proveedorId: string | null;
  priceBuy: number;
  priceRetail: number;
  priceWholesale: number;
  stock: number;
  minStock: number;
  active: boolean;
}

export interface Categoria {
  id: string;
  name: string;
}

export interface Cliente {
  id: string;
  razonSocial: string;
  rut: string;
  direccion: string;
  email: string;
  telefono: string;
  tipo: 'Persona' | 'Empresa';
  deuda: number;
  createdAt: string;
}

export interface Proveedor {
  id: string;
  rut: string;
  razonSocial: string;
  contacto: string;
  telefono: string;
  email: string;
  createdAt: string;
}

export type MedioPago = 'efectivo' | 'tarjeta' | 'fiado';
export type DescuentoTipo = 'none' | 'percent' | 'fixed';

export interface VentaItem {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CreateVentaPayload {
  items: VentaItem[];
  medioPago: MedioPago;
  descuentoTipo: DescuentoTipo;
  descuentoValor: number;
  clienteId?: string;
  montoRecibido?: number;
}

export interface VentaResult {
  id: string;
}

export interface CartItem extends Producto {
  quantity: number;
}

export interface AuthUser {
  email: string;
  name: string;
  role: 'admin' | 'seller';
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Form types
export interface ProductoForm {
  code: string;
  name: string;
  description?: string;
  category: string;
  categoryId?: string | null;
  proveedorId?: string | null;
  priceBuy: number;
  priceRetail: number;
  priceWholesale: number;
  stock: number;
  minStock: number;
  active?: boolean;
}

export interface ClienteForm {
  razonSocial: string;
  rut: string;
  tipo: 'persona' | 'empresa';
  telefono: string;
  email: string;
  direccion: string;
}

export interface ProveedorForm {
  razonSocial: string;
  rut: string;
  contacto: string;
  telefono: string;
  email: string;
}

export interface IngresoRecord {
  id: number;
  proveedorId: number | string;
  proveedorNombre: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  invoiceNumber: string;
  date: string;
  notes: string;
}

export interface IngresoForm {
  proveedorId: number | string;
  productId: string;
  quantity: number;
  unitCost: number;
  invoiceNumber: string;
  date: string;
  notes: string;
}
