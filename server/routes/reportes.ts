import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';
import { parsePeriodo, resolvePeriodo, relacionUno } from '../lib/reportes';

const router = Router();

router.use(requireAuth);

type Row = Record<string, any>;

const DETALLE_SELECT = `
  cantidad,
  total,
  precio_compra_unitario,
  productos(categorias(nombre)),
  ventas!inner(estado, fecha)
`;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const periodo = parsePeriodo(req.query.periodo);
    const { desdeIso, buckets, keyOf } = resolvePeriodo(periodo, new Date());
    const admin = getSupabaseAdmin();

    const [ventasRes, detallesRes] = await Promise.all([
      admin
        .from('ventas')
        .select('fecha, total')
        .eq('estado', 'completada')
        .gte('fecha', desdeIso),
      admin
        .from('detalle_ventas')
        .select(DETALLE_SELECT)
        .eq('ventas.estado', 'completada')
        .gte('ventas.fecha', desdeIso),
    ]);

    const ventas = unwrapSupabaseResult(ventasRes) as Row[];
    const detalles = unwrapSupabaseResult(detallesRes) as Row[];

    const bucketKeys = new Set(buckets.map((b) => b.key));
    const totalPorBucket = new Map<string, number>(buckets.map((b) => [b.key, 0]));

    let ingresosBrutos = 0;
    let clientesAtendidos = 0;
    for (const v of ventas) {
      const key = keyOf(v.fecha);
      if (!bucketKeys.has(key)) continue;
      const total = Number(v.total);
      ingresosBrutos += total;
      clientesAtendidos += 1;
      totalPorBucket.set(key, (totalPorBucket.get(key) ?? 0) + total);
    }

    let costoMercaderia = 0;
    const porCategoria = new Map<string, number>();
    for (const d of detalles) {
      const venta = relacionUno(d.ventas);
      if (!venta) continue;
      const key = keyOf(venta.fecha);
      if (!bucketKeys.has(key)) continue;

      costoMercaderia += Number(d.precio_compra_unitario) * Number(d.cantidad);

      const producto = relacionUno(d.productos);
      const categoria = relacionUno<{ nombre?: string }>(producto?.categorias);
      const nombreCategoria = categoria?.nombre ?? 'Sin categoría';
      porCategoria.set(nombreCategoria, (porCategoria.get(nombreCategoria) ?? 0) + Number(d.total));
    }

    const evolucionVentas = buckets.map((b) => ({
      name: b.label,
      total: totalPorBucket.get(b.key) ?? 0,
    }));

    const totalCategorias = Array.from(porCategoria.values()).reduce((acc, v) => acc + v, 0);
    const ventasPorCategoria = Array.from(porCategoria.entries())
      .map(([name, total]) => ({
        name,
        total,
        value: totalCategorias > 0 ? Math.round((total / totalCategorias) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    res.status(200).json({
      ingresosBrutos,
      costoMercaderia,
      margenBruto: ingresosBrutos - costoMercaderia,
      clientesAtendidos,
      evolucionVentas,
      ventasPorCategoria,
    });
  }),
);

export default router;
