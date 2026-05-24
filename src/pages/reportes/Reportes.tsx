import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, TrendingUp, DollarSign, Package, Users, type LucideIcon } from 'lucide-react';
import type { ReportePeriodo } from '@/types';
import { useReportesQuery } from '@/hooks/queries/useReportesQuery';

type ReportColor = 'blue' | 'emerald' | 'rose' | 'purple';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: ReportColor;
}

const PERIODOS: { value: ReportePeriodo; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta Semana' },
  { value: 'mes', label: 'Este Mes' },
  { value: 'trimestre', label: 'Últimos 3 Meses' },
  { value: 'anio', label: 'Este Año' },
];

const COLORS = ['#0057B8', '#003B7A', '#E31B23', '#6B7280', '#F59E0B', '#10B981'];

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('es-CL')}`;

export default function Reportes() {
  const [periodo, setPeriodo] = useState<ReportePeriodo>('mes');
  const [exportando, setExportando] = useState(false);
  const { data, isLoading, isError } = useReportesQuery(periodo);

  const periodoLabel = PERIODOS.find((p) => p.value === periodo)?.label ?? 'Este Mes';

  const handleExportPDF = async () => {
    if (!data) return;
    setExportando(true);
    try {
      const { descargarReportePDF } = await import('./reportePdf');
      await descargarReportePDF(data, periodoLabel);
    } catch (err) {
      console.error('Error al generar el PDF', err);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes Financieros</h1>
          <p className="text-slate-500">Análisis de ventas, ganancias y movimientos</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as ReportePeriodo)}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button
            onClick={handleExportPDF}
            disabled={isLoading || isError || !data || exportando}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            {exportando ? 'Generando…' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-500">
          Cargando reporte…
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex items-center justify-center py-20 text-rose-600">
          No se pudo cargar el reporte.
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Ingresos Brutos" value={formatCurrency(data.ingresosBrutos)} icon={DollarSign} color="blue" />
            <StatCard title="Costo Mercadería" value={`-${formatCurrency(data.costoMercaderia)}`} icon={Package} color="rose" />
            <StatCard title="Margen Bruto (Utilidad)" value={formatCurrency(data.margenBruto)} icon={TrendingUp} color="emerald" />
            <StatCard title="Ventas Realizadas" value={String(data.clientesAtendidos)} icon={Users} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Evolución de Ventas</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.evolucionVentas}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: '#64748b'}}
                      tickFormatter={(value) => (value >= 1000000 ? `$${value / 1000000}M` : `$${value / 1000}k`)}
                      dx={-10}
                    />
                    <RechartsTooltip
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${Number(value).toLocaleString('es-CL')}`, 'Ingresos']}
                    />
                    <Bar dataKey="total" fill="#0057B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Ventas por Categoría</h2>
              {data.ventasPorCategoria.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 min-h-[250px]">
                  <Package className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-sm">Sin ventas en el periodo</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.ventasPorCategoria}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.ventasPorCategoria.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {data.ventasPorCategoria.map((category, index) => (
                      <div key={category.name} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="text-slate-600">{category.name} ({category.value}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorMap: Record<ReportColor, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
