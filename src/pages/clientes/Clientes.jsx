import React, { useState } from 'react';
import { Search, UserPlus, CreditCard, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockClientes } from '@/mock/clientes';

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = mockClientes.filter(c => 
    c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.rut.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes y Fiados</h1>
          <p className="text-slate-500">Administra tus clientes, créditos y cuentas por cobrar</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
            <FileText className="w-4 h-4" />
            Reporte Deudas
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-orange-600/20">
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Clientes</p>
            <p className="text-2xl font-bold text-slate-800">142</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Créditos Activos (Fiados)</p>
            <p className="text-2xl font-bold text-slate-800">24</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total por Cobrar</p>
            <p className="text-2xl font-bold text-slate-800">$1.2M</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar por RUT o Razón Social..."
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
                <th className="px-6 py-4">Razón Social / Nombre</th>
                <th className="px-6 py-4">RUT</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Estado de Cuenta (Fiado)</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClientes.map((cliente) => {
                const porcentajeUso = (cliente.deuda / cliente.limiteCredito) * 100;
                const isOverLimit = cliente.deuda > cliente.limiteCredito;
                
                return (
                  <tr key={cliente.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{cliente.razonSocial}</td>
                    <td className="px-6 py-4 font-mono text-xs">{cliente.rut}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        cliente.tipo === 'Empresa' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      )}>
                        {cliente.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">{cliente.telefono}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-full max-w-[200px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={cn("font-bold", cliente.deuda > 0 ? (isOverLimit ? "text-rose-600" : "text-amber-600") : "text-emerald-600")}>
                            ${cliente.deuda.toLocaleString('es-CL')}
                          </span>
                          <span className="text-slate-400">/ ${cliente.limiteCredito.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={cn("h-1.5 rounded-full", isOverLimit ? "bg-rose-500" : (porcentajeUso > 75 ? "bg-amber-500" : "bg-emerald-500"))} 
                            style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
                          ></div>
                        </div>
                        {isOverLimit && <span className="text-[10px] text-rose-500 font-medium">Límite excedido</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors">
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
