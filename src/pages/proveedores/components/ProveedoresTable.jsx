import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProveedoresTable({ proveedores, searchTerm, setSearchTerm }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por RUT, Nombre o Categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Razón Social</th>
              <th className="px-6 py-4">RUT</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Deuda Actual</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {proveedores.map((proveedor) => (
              <tr key={proveedor.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{proveedor.razonSocial}</td>
                <td className="px-6 py-4 font-mono text-xs">{proveedor.rut}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {proveedor.categoria}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span>{proveedor.contacto}</span>
                    <span className="text-xs text-slate-400">{proveedor.telefono}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  ${proveedor.deuda.toLocaleString('es-CL')}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    proveedor.estado === 'Al día' ? "bg-emerald-100 text-emerald-800" :
                    proveedor.estado === 'Por vencer' ? "bg-amber-100 text-amber-800" :
                    "bg-rose-100 text-rose-800"
                  )}>
                    {proveedor.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors">
                    Ingresar Factura
                  </button>
                </td>
              </tr>
            ))}
            {proveedores.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  No se encontraron proveedores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}