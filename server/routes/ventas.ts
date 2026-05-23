import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, createHttpError } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

type Payload = Record<string, any>;
type Row = Record<string, any>;

function validateVentaPayload(payload: Payload): void {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw createHttpError(400, 'La venta debe tener al menos un producto');
  }

  const mediosPago = ['efectivo', 'tarjeta', 'fiado'];
  if (!mediosPago.includes(payload.medioPago)) {
    throw createHttpError(400, `Medio de pago inválido. Use: ${mediosPago.join(', ')}`);
  }

  for (const item of payload.items) {
    if (!item.productoId) throw createHttpError(400, 'Cada item debe tener productoId');
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      throw createHttpError(400, 'La cantidad debe ser un entero positivo');
    }
    if (Number(item.precioUnitario) < 0) {
      throw createHttpError(400, 'El precio unitario no puede ser negativo');
    }
  }
}

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = req.body;
    validateVentaPayload(payload);

    const items = payload.items.map((item: Payload) => ({
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_unitario: Number(item.precioUnitario),
    }));

    const ventaId = unwrapSupabaseResult(
      await getSupabaseAdmin().rpc('procesar_venta', {
        p_items: items,
        p_medio_pago: payload.medioPago,
        p_descuento_tipo: payload.descuentoTipo || 'none',
        p_descuento_valor: Number(payload.descuentoValor || 0),
        p_cliente_id: payload.clienteId || null,
        p_monto_recibido: payload.montoRecibido != null ? Number(payload.montoRecibido) : null,
      }),
    );

    res.status(201).json({ id: ventaId });
  }),
);

const VENTA_LIST_SELECT = `
  id,
  fecha,
  subtotal,
  descuento_monto,
  total,
  medio_pago,
  estado,
  numero_dte,
  clientes(razon_social)
`;

const VENTA_DETALLE_SELECT = `
  id,
  fecha,
  subtotal,
  descuento_tipo,
  descuento_valor,
  descuento_monto,
  total,
  medio_pago,
  estado,
  monto_recibido,
  vuelto,
  numero_dte,
  clientes(razon_social, rut),
  detalle_ventas(
    producto_id,
    cantidad,
    precio_unitario,
    total,
    productos(nombre, codigo_barra)
  )
`;

function relacionUno(value: unknown): Row | null {
  if (Array.isArray(value)) return (value[0] as Row) ?? null;
  return (value as Row) ?? null;
}

function mapVentaListFromDb(row: Row) {
  const cliente = relacionUno(row.clientes);
  return {
    id: row.id,
    fecha: row.fecha,
    clienteNombre: cliente?.razon_social ?? null,
    subtotal: Number(row.subtotal),
    descuentoMonto: Number(row.descuento_monto),
    total: Number(row.total),
    medioPago: row.medio_pago,
    estado: row.estado,
    numeroDte: row.numero_dte ?? null,
  };
}

function mapVentaDetalleFromDb(row: Row) {
  const cliente = relacionUno(row.clientes);
  const items = (row.detalle_ventas || []).map((d: Row) => {
    const producto = relacionUno(d.productos);
    return {
      productoId: d.producto_id,
      productoNombre: producto?.nombre ?? 'Producto eliminado',
      codigo: producto?.codigo_barra ?? '',
      cantidad: d.cantidad,
      precioUnitario: Number(d.precio_unitario),
      total: Number(d.total),
    };
  });

  return {
    ...mapVentaListFromDb(row),
    clienteRut: cliente?.rut ?? null,
    descuentoTipo: row.descuento_tipo,
    descuentoValor: Number(row.descuento_valor),
    montoRecibido: row.monto_recibido != null ? Number(row.monto_recibido) : null,
    vuelto: row.vuelto != null ? Number(row.vuelto) : null,
    items,
  };
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { desde, hasta, medioPago, estado } = req.query as Record<string, string>;

    let query = getSupabaseAdmin()
      .from('ventas')
      .select(VENTA_LIST_SELECT)
      .order('fecha', { ascending: false })
      .limit(200);

    if (desde) query = query.gte('fecha', desde);
    if (hasta) query = query.lte('fecha', `${hasta}T23:59:59.999`);
    if (medioPago) query = query.eq('medio_pago', medioPago);
    if (estado) query = query.eq('estado', estado);

    const ventas = unwrapSupabaseResult(await query) as Row[];
    res.status(200).json(ventas.map(mapVentaListFromDb));
  }),
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const venta = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('ventas')
        .select(VENTA_DETALLE_SELECT)
        .eq('id', req.params.id)
        .single(),
    ) as Row;

    res.status(200).json(mapVentaDetalleFromDb(venta));
  }),
);

router.post(
  '/:id/anular',
  requireAuth,
  asyncHandler(async (req, res) => {
    const motivo = String(req.body?.motivo || '').trim() || null;

    unwrapSupabaseResult(
      await getSupabaseAdmin().rpc('anular_venta', {
        p_venta_id: req.params.id,
        p_motivo: motivo,
      }),
    );

    const venta = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('ventas')
        .select(VENTA_DETALLE_SELECT)
        .eq('id', req.params.id)
        .single(),
    ) as Row;

    res.status(200).json(mapVentaDetalleFromDb(venta));
  }),
);

export default router;
