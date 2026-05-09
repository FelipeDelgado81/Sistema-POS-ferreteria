import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const salesData = [
  { name: 'Lun', total: 450000 },
  { name: 'Mar', total: 320000 },
  { name: 'Mié', total: 550000 },
  { name: 'Jue', total: 280000 },
  { name: 'Vie', total: 690000 },
  { name: 'Sáb', total: 850000 },
  { name: 'Dom', total: 120000 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Resumen de la actividad de tu ferretería</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Ventas de Hoy" 
          value="$850.000" 
          icon={DollarSign} 
          trend="+12%" 
          trendUp={true} 
          color="blue"
        />
        <StatCard 
          title="Productos Bajo Stock" 
          value="14" 
          icon={Package} 
          trend="Requiere atención" 
          trendUp={false} 
          color="orange"
        />
        <StatCard 
          title="Nuevos Clientes" 
          value="24" 
          icon={Users} 
          trend="+4%" 
          trendUp={true} 
          color="green"
        />
        <StatCard 
          title="Crecimiento Semanal" 
          value="+18.2%" 
          icon={TrendingUp} 
          trend="vs semana anterior" 
          trendUp={true} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Ventas de la Semana</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
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
                  formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Ventas']}
                />
                <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Productos Más Vendidos</h2>
          <div className="flex-1 overflow-auto">
            <ul className="space-y-4">
              {[
                { name: 'Cemento Melón 25kg', qty: 145, price: 4200 },
                { name: 'Tornillo Yeso Cartón 1 5/8"', qty: 89, price: 15 },
                { name: 'Pintura Esmalte al Agua 1Gl', qty: 56, price: 18990 },
                { name: 'Cable THHN 2.5mm Rojo', qty: 42, price: 450 },
                { name: 'Siliocna Transparente 280ml', qty: 38, price: 2990 },
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm truncate max-w-[150px]" title={item.name}>{item.name}</p>
                      <p className="text-xs text-slate-500">{item.qty} unidades</p>
                    </div>
                  </div>
                  <div className="font-semibold text-sm text-slate-700">
                    ${(item.qty * item.price).toLocaleString('es-CL')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <button className="mt-4 w-full py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            Ver reporte completo
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }) {
  const colorMap = {
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

