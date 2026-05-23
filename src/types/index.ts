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

export type FiadoEstado = 'pendiente' | 'pagado' | 'anulado';

export interface AbonoFiado {
  id: string;
  monto: number;
  fecha: string;
  notas: string | null;
}

export interface Fiado {
  id: string;
  ventaId: string | null;
  clienteId: string;
  montoOriginal: number | null;
  saldoPendiente: number;
  estado: FiadoEstado;
  fecha: string;
  abonos: AbonoFiado[];
}

export interface AbonoForm {
  monto: number;
  notas?: string;
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

export type VentaEstado = 'completada' | 'anulada';

export interface VentaListItem {
  id: string;
  fecha: string;
  clienteNombre: string | null;
  subtotal: number;
  descuentoMonto: number;
  total: number;
  medioPago: MedioPago;
  estado: VentaEstado;
  numeroDte: string | null;
}

export interface VentaDetalleItem {
  productoId: string;
  productoNombre: string;
  codigo: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface VentaDetalle extends VentaListItem {
  clienteRut: string | null;
  descuentoTipo: DescuentoTipo;
  descuentoValor: number;
  montoRecibido: number | null;
  vuelto: number | null;
  items: VentaDetalleItem[];
}

export interface VentasFiltros {
  desde?: string;
  hasta?: string;
  medioPago?: MedioPago | '';
  estado?: VentaEstado | '';
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

// Caja
export type CajaEstado = 'abierta' | 'cerrada';
export type MovimientoCajaTipo = 'ingreso' | 'retiro';
export type CajaLineaTipo =
  | 'apertura'
  | 'venta_efectivo'
  | 'venta_tarjeta'
  | 'venta_fiado'
  | 'ingreso'
  | 'retiro';

export interface CajaLinea {
  hora: string;
  tipo: CajaLineaTipo;
  descripcion: string;
  monto: number;
  usuario: string;
}

export interface CajaActual {
  id: string;
  fecha: string;
  estado: CajaEstado;
  fondoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasFiado: number;
  ingresos: number;
  retiros: number;
  efectivoEsperado: number;
  efectivoFisico: number | null;
  diferencia: number | null;
  abiertaAt: string;
  cerradaAt: string | null;
  lineas: CajaLinea[];
}

export interface AbrirCajaForm {
  fondoInicial: number;
}

export interface MovimientoCajaForm {
  tipo: MovimientoCajaTipo;
  monto: number;
  descripcion: string;
}

export interface CerrarCajaForm {
  efectivoFisico: number;
}
