import React, { useState } from 'react';
import { Search, Plus, Truck, AlertTriangle, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { ProveedorForm } from '@/types';
import { useProveedoresQuery, useCreateProveedor } from '@/hooks/queries/useProveedoresQuery';
import Modal from '@/components/shared/Modal';

const emptyForm: ProveedorForm = {
  razonSocial: '',
  rut: '',
  contacto: '',
  telefono: '',
  email: '',
};

export default function Proveedores() {
  const { data: proveedores = [], isLoading, error } = useProveedoresQuery();
  const createMutation = useCreateProveedor();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProveedorForm>(emptyForm);

  const filteredProveedores = proveedores.filter(
    (p) =>
      p.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rut.includes(searchTerm) ||
      p.contacto.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <span className="font-medium">Error al cargar proveedores</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-500">Gestiona tus distribuidores y órdenes de compra</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
            <FileText className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={handleOpenModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Proveedores</p>
            <p className="text-2xl font-bold text-slate-800">{isLoading ? '…' : proveedores.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Deuda Total</p>
            <p className="text-2xl font-bold text-slate-800">—</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Facturas Pagadas Este Mes</p>
            <p className="text-2xl font-bold text-slate-800">—</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por RUT, Nombre o Contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando proveedores...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Razón Social</th>
                  <th className="px-6 py-4">RUT</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProveedores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No se encontraron proveedores
                    </td>
                  </tr>
                ) : (
                  filteredProveedores.map((proveedor) => (
                    <tr key={proveedor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{proveedor.razonSocial}</td>
                      <td className="px-6 py-4 font-mono text-xs">{proveedor.rut || '—'}</td>
                      <td className="px-6 py-4">{proveedor.contacto || '—'}</td>
                      <td className="px-6 py-4">{proveedor.telefono || '—'}</td>
                      <td className="px-6 py-4">{proveedor.email || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors">
                          Ingresar Factura
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Proveedor">
        <form onSubmit={handleSave} className="space-y-4">
          {createMutation.error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              Error al crear proveedor
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Razón Social <span className="text-rose-500">*</span>
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
                placeholder="76.123.456-9"
                value={formData.rut}
                onChange={(e) => setFormData((p) => ({ ...p, rut: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contacto</label>
              <input
                type="text"
                value={formData.contacto}
                onChange={(e) => setFormData((p) => ({ ...p, contacto: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
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
              {createMutation.isPending ? 'Guardando...' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
