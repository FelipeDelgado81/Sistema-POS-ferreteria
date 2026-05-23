import React, { useState } from 'react';
import { Search, UserPlus, CreditCard, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClienteForm } from '@/types';
import type { Cliente } from '@/types';
import { useClientesQuery, useCreateCliente } from '@/hooks/queries/useClientesQuery';
import Modal from '@/components/shared/Modal';
import FiadoDetalleModal from './components/FiadoDetalleModal';

const emptyForm: ClienteForm = {
  razonSocial: '',
  rut: '',
  tipo: 'persona',
  telefono: '',
  email: '',
  direccion: '',
};

export default function Clientes() {
  const { data: clientes = [], isLoading, error } = useClientesQuery();
  const createMutation = useCreateCliente();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ClienteForm>(emptyForm);
  const [detalleCliente, setDetalleCliente] = useState<Cliente | null>(null);

  const filteredClientes = clientes.filter(
    (c) =>
      c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rut.includes(searchTerm),
  );

  const totalDeuda = clientes.reduce((sum, c) => sum + c.deuda, 0);
  const conDeuda = clientes.filter((c) => c.deuda > 0).length;

  const handleOpenModal = () => {
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-rose-600">
        <AlertCircle className="w-6 h-6" />
        <span className="font-medium">Error al cargar clientes</span>
      </div>
    );
  }

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
          <button
            onClick={handleOpenModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-orange-600/20"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Clientes</p>
            <p className="text-2xl font-bold text-slate-800">{isLoading ? '…' : clientes.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Créditos Activos (Fiados)</p>
            <p className="text-2xl font-bold text-slate-800">{isLoading ? '…' : conDeuda}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total por Cobrar</p>
            <p className="text-2xl font-bold text-slate-800">
              {isLoading ? '…' : `$${totalDeuda.toLocaleString('es-CL')}`}
            </p>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando clientes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Razón Social / Nombre</th>
                  <th className="px-6 py-4">RUT</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Deuda (Fiado)</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{cliente.razonSocial}</td>
                      <td className="px-6 py-4 font-mono text-xs">{cliente.rut || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            cliente.tipo === 'Empresa'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800',
                          )}
                        >
                          {cliente.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">{cliente.telefono || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'font-semibold',
                            cliente.deuda > 0 ? 'text-amber-600' : 'text-emerald-600',
                          )}
                        >
                          ${cliente.deuda.toLocaleString('es-CL')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDetalleCliente(cliente)}
                          className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Cliente">
        <form onSubmit={handleSave} className="space-y-4">
          {createMutation.error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              Error al crear cliente
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Razón Social / Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.razonSocial}
              onChange={(e) => setFormData((p) => ({ ...p, razonSocial: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={(e) => setFormData((p) => ({ ...p, rut: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, tipo: e.target.value as 'persona' | 'empresa' }))
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="persona">Persona</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData((p) => ({ ...p, telefono: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData((p) => ({ ...p, direccion: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {createMutation.isPending ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {detalleCliente && (
        <FiadoDetalleModal cliente={detalleCliente} onClose={() => setDetalleCliente(null)} />
      )}
    </div>
  );
}
