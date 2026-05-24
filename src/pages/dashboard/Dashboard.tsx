import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Package, DollarSign, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardQuery } from '@/hooks/queries/useDashboardQuery';
import type { DashboardTopProducto } from '@/types';

type DashColor = 'blue' | 'orange' | 'green' | 'purple';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
  color: DashColor;
}

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('es-CL')}`;

const formatTrend = (percent: number | null, fallback: string): { label: string; up: boolean } => {
  if (percent == null) return { label: fallback, up: true };
  const sign = percent >= 0 ? '+' : '';
  return { label: `${sign}${percent}% vs ayer`, up: percent >= 0 };
};

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Cargando dashboard…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-rose-600">
        No se pudo cargar la información del dashboard.
      </div>
    );
  }

  const ventasHoy = formatTrend(data.ventasHoyTrend, 'Sin ventas ayer');
  const crecimiento = formatTrend(data.crecimientoSemanal, 'Sin datos previos');
  const crecimientoValue =
    data.crecimientoSemanal == null
      ? '—'
      : `${data.crecimientoSemanal >= 0 ? '+' : ''}${data.crecimientoSemanal}%`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Resumen de la actividad de tu ferretería</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ventas de Hoy"
          value={formatCurrency(data.ventasHoy)}
          icon={DollarSign}
          trend={ventasHoy.label}
          trendUp={ventasHoy.up}
          color="blue"
        />
        <StatCard
          title="Productos Bajo Stock"
          value={String(data.productosBajoStock)}
          icon={Package}
          trend={data.productosBajoStock > 0 ? 'Requiere atención' : 'Todo en orden'}
          trendUp={data.productosBajoStock === 0}
          color="orange"
        />
        <StatCard
          title="Nuevos Clientes"
          value={String(data.nuevosClientesMes)}
          icon={Users}
          trend="Este mes"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="Crecimiento Semanal"
          value={crecimientoValue}
          icon={TrendingUp}
          trend={crecimiento.label}
          trendUp={crecimiento.up}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Ventas de la Semana</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ventasSemana}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#64748b'}}
                  tickFormatter={(value) => `$${value/1000}k`}
                  dx={-10}
                />
                <Tooltip
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${Number(value).toLocaleString('es-CL')}`, 'Ventas']}
                />
                <Bar dataKey="total" fill="#0057B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Productos Más Vendidos</h2>
          <div className="flex-1 overflow-auto">
            {data.topProductos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10">
                <Package className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm">Aún no hay ventas registradas</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {data.topProductos.map((item: DashboardTopProducto, i: number) => (
                  <li key={item.nombre} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm truncate max-w-[150px]" title={item.nombre}>{item.nombre}</p>
                        <p className="text-xs text-slate-500">{item.cantidad} unidades</p>
                      </div>
                    </div>
                    <div className="font-semibold text-sm text-slate-700">
                      {formatCurrency(item.total)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="mt-4 w-full py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            Ver reporte completo
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  const colorMap: Record<DashColor, string> = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-auto flex items-center text-sm">
        <span className={cn("font-medium", trendUp ? "text-emerald-600" : "text-rose-600")}>
          {trend}
        </span>
      </div>
    </div>
  );
}
