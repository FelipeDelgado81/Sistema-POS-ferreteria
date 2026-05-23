import type { SupabaseClient } from '@supabase/supabase-js';
import { createHttpError } from './http';
import { unwrapSupabaseResult } from './supabase';

type Row = Record<string, any>;
type Payload = Record<string, any>;

export const PRODUCTOS_SELECT = `
  id,
  codigo_barra,
  nombre,
  descripcion,
  categoria_id,
  proveedor_id,
  precio_compra,
  precio_venta_minorista,
  precio_venta_mayorista,
  stock,
  stock_minimo,
  activo,
  categorias(nombre)
`;

export function mapProductoFromDb(row: Row) {
  return {
    id: row.id,
    code: row.codigo_barra,
    name: row.nombre,
    description: row.descripcion || '',
    categoryId: row.categoria_id || null,
    category: row.categorias?.nombre || '',
    proveedorId: row.proveedor_id || null,
    priceBuy: Number(row.precio_compra || 0),
    priceRetail: Number(row.precio_venta_minorista || 0),
    priceWholesale: Number(row.precio_venta_mayorista || 0),
    stock: Number(row.stock || 0),
    minStock: Number(row.stock_minimo || 0),
    active: row.activo,
  };
}

export function validateProductoPayload(payload: Payload): void {
  const requiredFields: [string, string][] = [
    ['code', 'codigo de barras'],
    ['name', 'nombre'],
  ];

  for (const [field, label] of requiredFields) {
    if (!String(payload[field] || '').trim()) {
      throw createHttpError(400, `El campo ${label} es obligatorio`);
    }
  }

  if (!payload.categoryId && !String(payload.category || '').trim()) {
    throw createHttpError(400, 'La categoria es obligatoria');
  }

  const numericFields = ['priceBuy', 'priceRetail', 'priceWholesale', 'stock', 'minStock'];

  for (const field of numericFields) {
    if (Number(payload[field] || 0) < 0) {
      throw createHttpError(400, `El campo ${field} no puede ser negativo`);
    }
  }
}

async function resolveCategoriaId(supabase: SupabaseClient, payload: Payload): Promise<string> {
  if (payload.categoryId) return payload.categoryId;

  const categoryName = String(payload.category || '').trim();
  const existing = unwrapSupabaseResult(
    await supabase.from('categorias').select('id').eq('nombre', categoryName).maybeSingle(),
  ) as Row | null;

  if (existing?.id) return existing.id;

  const created = unwrapSupabaseResult(
    await supabase.from('categorias').insert({ nombre: categoryName }).select('id').single(),
  ) as Row;

  return created.id;
}

export async function mapProductoToDb(supabase: SupabaseClient, payload: Payload) {
  validateProductoPayload(payload);

  return {
    codigo_barra: String(payload.code).trim(),
    nombre: String(payload.name).trim(),
    descripcion: String(payload.description || '').trim() || null,
    categoria_id: await resolveCategoriaId(supabase, payload),
    proveedor_id: payload.proveedorId || null,
    precio_compra: Number(payload.priceBuy || 0),
    precio_venta_minorista: Number(payload.priceRetail || 0),
    precio_venta_mayorista: Number(payload.priceWholesale || 0),
    stock: Number(payload.stock || 0),
    stock_minimo: Number(payload.minStock || 0),
    activo: payload.active ?? true,
  };
}
