import type { Dispatch, SetStateAction } from 'react';
import Modal from '@/components/shared/Modal';
import type { Producto, IngresoForm } from '@/types';

const formatCurrency = (v: number) => `$${Number(v || 0).toLocaleString('es-CL')}`;

interface MockProveedor {
  id: number | string;
  razonSocial: string;
}

interface IngresoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingresoFormData: IngresoForm;
  setIngresoFormData: Dispatch<SetStateAction<IngresoForm>>;
  productos: Producto[];
  mockProveedores: MockProveedor[];
  handleIngresoProductChange: (productId: string) => void;
  handleSaveIngreso: (e: { preventDefault(): void }) => void;
  selectedIngresoProduct: Producto | undefined;
  projectedStock: number;
  ingresoTotal: number;
}

export default function IngresoModal({
  isOpen,
  onClose,
  ingresoFormData,
  setIngresoFormData,
  productos,
  mockProveedores,
  handleIngresoProductChange,
  handleSaveIngreso,
  selectedIngresoProduct,
  projectedStock,
  ingresoTotal,
}: IngresoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ingreso de Mercadería">
      <form onSubmit={handleSaveIngreso} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
            <select
              required
              value={ingresoFormData.proveedorId}
              onChange={(e) =>
                setIngresoFormData({ ...ingresoFormData, proveedorId: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {mockProveedores.map((s) => (
                <option key={s.id} value={s.id}>{s.razonSocial}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Producto</label>
            <select
              required
              value={ingresoFormData.productId}
              onChange={(e) => handleIngresoProductChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad a ingresar</label>
            <input
              required
              type="number"
              min="1"
              value={ingresoFormData.quantity}
              onChange={(e) =>
                setIngresoFormData({ ...ingresoFormData, quantity: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Costo unitario ($)</label>
            <input
              required
              type="number"
              min="0"
              value={ingresoFormData.unitCost}
              onChange={(e) =>
                setIngresoFormData({ ...ingresoFormData, unitCost: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              N° Factura / OC{' '}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={ingresoFormData.invoiceNumber}
              onChange={(e) =>
                setIngresoFormData({ ...ingresoFormData, invoiceNumber: e.target.value })
              }
              placeholder="Ej: F-001234"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de ingreso</label>
            <input
              required
              type="date"
              value={ingresoFormData.date}
              onChange={(e) =>
                setIngresoFormData({ ...ingresoFormData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notas{' '}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <textarea
            rows={2}
            value={ingresoFormData.notes}
            onChange={(e) =>
              setIngresoFormData({ ...ingresoFormData, notes: e.target.value })
            }
            placeholder="Ej: Ingreso por rotura de stock..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          />
        </div>

        {/* Resumen readonly */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 divide-y divide-slate-200 text-sm">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500">Stock actual</span>
            <span className="font-medium text-slate-800">{selectedIngresoProduct?.stock ?? 0}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500">Stock proyectado</span>
            <span className="font-semibold text-emerald-700">{projectedStock}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500">Total compra</span>
            <span className="font-semibold text-slate-900">{formatCurrency(ingresoTotal)}</span>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Registrar Ingreso
          </button>
        </div>
      </form>
    </Modal>
  );
}