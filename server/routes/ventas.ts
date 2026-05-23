import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, createHttpError } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

type Payload = Record<string, any>;

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

export default router;
