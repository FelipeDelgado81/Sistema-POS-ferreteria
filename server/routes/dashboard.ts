import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

router.use(requireAuth);

type Row = Record<string, any>;

const TIME_ZONE = 'America/Santiago';
const DAY_MS = 24 * 60 * 60 * 1000;

// Fecha local (YYYY-MM-DD) en la zona horaria de la ferretería.
function localDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// Etiqueta corta del día (Lun, Mar, …) capitalizada y sin punto.
function localDayLabel(date: Date): string {
  const raw = new Intl.DateTimeFormat('es-CL', {
    timeZone: TIME_ZONE,
    weekday: 'short',
  }).format(date);
  const clean = raw.replace('.', '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function startOfMonthISO(now: Date): string {
  const year = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric' }).format(now),
  );
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, month: '2-digit' }).format(
    now,
  );
  return `${year}-${month}-01T00:00:00`;
}

// Porcentaje de variación entre dos periodos, redondeado a un decimal.
function trendPercent(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual > 0 ? 100 : null;
  return Math.round(((actual - anterior) / anterior) * 1000) / 10;
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const admin = getSupabaseAdmin();
    const now = new Date();

    // 14 días para cubrir la semana actual y la anterior.
    const desde = new Date(now.getTime() - 14 * DAY_MS);

    const [ventas, productos, clientesCount, detalles] = await Promise.all([
      admin
        .from('ventas')
        .select('fecha, total')
        .eq('estado', 'completada')
        .gte('fecha', desde.toISOString()),
      admin.from('productos').select('stock, stock_minimo').eq('activo', true),
      admin
        .from('clientes')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonthISO(now)),
      admin
        .from('detalle_ventas')
        .select('cantidad, total, productos(nombre), ventas!inner(estado, fecha)')
        .eq('ventas.estado', 'completada')
        .gte('ventas.fecha', new Date(now.getTime() - 30 * DAY_MS).toISOString()),
    ]);

    const ventasRows = unwrapSupabaseResult(ventas) as Row[];
    const productosRows = unwrapSupabaseResult(productos) as Row[];
    const detallesRows = unwrapSupabaseResult(detalles) as Row[];
    const nuevosClientesMes = (clientesCount as { count: number | null }).count ?? 0;

    // Total de ventas por día (clave local YYYY-MM-DD).
    const totalPorDia = new Map<string, number>();
    for (const v of ventasRows) {
      const key = localDateKey(new Date(v.fecha));
      totalPorDia.set(key, (totalPorDia.get(key) ?? 0) + Number(v.total));
    }

    // Buckets de los últimos 14 días, del más antiguo al más reciente.
    const dias = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(now.getTime() - (13 - i) * DAY_MS);
      const key = localDateKey(date);
      return { key, label: localDayLabel(date), total: totalPorDia.get(key) ?? 0 };
    });

    const ventasSemana = dias.slice(7).map((d) => ({ name: d.label, total: d.total }));
    const estaSemana = dias.slice(7).reduce((acc, d) => acc + d.total, 0);
    const semanaPasada = dias.slice(0, 7).reduce((acc, d) => acc + d.total, 0);

    const ventasHoy = dias[13].total;
    const ventasAyer = dias[12].total;

    const productosBajoStock = productosRows.filter(
      (p) => Number(p.stock) <= Number(p.stock_minimo),
    ).length;

    // Top 5 productos por cantidad vendida en los últimos 30 días.
    const agregadoProductos = new Map<string, { cantidad: number; total: number }>();
    for (const d of detallesRows) {
      const producto = Array.isArray(d.productos) ? d.productos[0] : d.productos;
      const nombre = producto?.nombre ?? 'Producto eliminado';
      const prev = agregadoProductos.get(nombre) ?? { cantidad: 0, total: 0 };
      prev.cantidad += Number(d.cantidad);
      prev.total += Number(d.total);
      agregadoProductos.set(nombre, prev);
    }

    const topProductos = Array.from(agregadoProductos.entries())
      .map(([nombre, datos]) => ({ nombre, cantidad: datos.cantidad, total: datos.total }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    res.status(200).json({
      ventasHoy,
      ventasHoyTrend: trendPercent(ventasHoy, ventasAyer),
      productosBajoStock,
      nuevosClientesMes,
      crecimientoSemanal: trendPercent(estaSemana, semanaPasada),
      ventasSemana,
      topProductos,
    });
  }),
);

export default router;
