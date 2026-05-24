import { useRef, useState } from 'react';
import { Upload, Download, FileText, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import type { BulkImportResult, Producto } from '@/types';
import { procesarCSVProductos, descargarPlantillaCSV, type FilaImport } from '@/lib/csv';
import { useBulkImportProductos } from '@/hooks/queries/useProductosQuery';

interface ImportProductosModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
}

type Paso = 'subir' | 'previsualizar' | 'resultado';

const formatCurrency = (v: number) => `$${Number(v || 0).toLocaleString('es-CL')}`;

export default function ImportProductosModal({ isOpen, onClose, productos }: ImportProductosModalProps) {
  const [paso, setPaso] = useState<Paso>('subir');
  const [fileName, setFileName] = useState('');
  const [filas, setFilas] = useState<FilaImport[]>([]);
  const [headersFaltantes, setHeadersFaltantes] = useState<string[]>([]);
  const [resultado, setResultado] = useState<BulkImportResult | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bulkImport = useBulkImportProductos();

  const codigosExistentes = new Set(productos.map((p) => p.code));
  const filasValidas = filas.filter((f) => f.errores.length === 0);
  const filasConError = filas.filter((f) => f.errores.length > 0);
  const nuevos = filasValidas.filter((f) => !codigosExistentes.has(f.data.code.trim())).length;
  const actualizan = filasValidas.length - nuevos;

  const reset = () => {
    setPaso('subir');
    setFileName('');
    setFilas([]);
    setHeadersFaltantes([]);
    setResultado(null);
    setErrorArchivo(null);
    bulkImport.reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setErrorArchivo(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const { filas: parsed, headersFaltantes: faltantes } = procesarCSVProductos(text);
      if (faltantes.length > 0) {
        setHeadersFaltantes(faltantes);
        setFilas([]);
        setPaso('previsualizar');
        return;
      }
      if (parsed.length === 0) {
        setErrorArchivo('El archivo no tiene filas de datos.');
        return;
      }
      setHeadersFaltantes([]);
      setFilas(parsed);
      setPaso('previsualizar');
    } catch {
      setErrorArchivo('No se pudo leer el archivo. Asegúrate de que sea un CSV válido.');
    }
  };

  const handleImport = async () => {
    try {
      const res = await bulkImport.mutateAsync(filasValidas.map((f) => f.data));
      setResultado(res);
      setPaso('resultado');
    } catch {
      setErrorArchivo('Ocurrió un error al importar. Intenta nuevamente.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar productos desde Excel/CSV">
      {paso === 'subir' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800 mb-1">¿Cómo importar?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Descarga la plantilla y completa tus productos.</li>
              <li>En Excel: <span className="font-medium">Guardar como → CSV</span>.</li>
              <li>Sube el archivo aquí y revisa la previsualización.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={descargarPlantillaCSV}
            className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            <Download className="w-4 h-4" />
            Descargar plantilla CSV
          </button>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center gap-2 text-slate-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            <Upload className="w-8 h-8" />
            <span className="font-medium">Haz clic para seleccionar un archivo CSV</span>
            <span className="text-xs">Columnas requeridas: Código, Nombre, Categoría</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />

          {errorArchivo && (
            <p className="text-sm text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {errorArchivo}
            </p>
          )}
        </div>
      )}

      {paso === 'previsualizar' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FileText className="w-4 h-4 text-slate-400" />
            {fileName}
          </div>

          {headersFaltantes.length > 0 ? (
            <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700">
              <p className="font-medium mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Faltan columnas obligatorias
              </p>
              <p>
                El archivo no tiene: <span className="font-medium">{headersFaltantes.join(', ')}</span>.
                Descarga la plantilla y revisa los encabezados.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Resumen label="Nuevos" value={nuevos} color="text-emerald-600" />
                <Resumen label="Se actualizan" value={actualizan} color="text-blue-600" />
                <Resumen label="Con error" value={filasConError.length} color="text-rose-600" />
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">#</th>
                        <th className="text-left px-3 py-2 font-medium">Código</th>
                        <th className="text-left px-3 py-2 font-medium">Nombre</th>
                        <th className="text-right px-3 py-2 font-medium">Precio venta</th>
                        <th className="text-right px-3 py-2 font-medium">Stock</th>
                        <th className="text-left px-3 py-2 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filas.slice(0, 100).map((f) => {
                        const conError = f.errores.length > 0;
                        const esNuevo = !codigosExistentes.has(f.data.code.trim());
                        return (
                          <tr key={f.fila} className={conError ? 'bg-rose-50/50' : ''}>
                            <td className="px-3 py-2 text-slate-400">{f.fila}</td>
                            <td className="px-3 py-2 font-mono text-xs">{f.data.code || '—'}</td>
                            <td className="px-3 py-2 truncate max-w-[160px]" title={f.data.name}>
                              {f.data.name || '—'}
                            </td>
                            <td className="px-3 py-2 text-right">{formatCurrency(f.data.priceRetail)}</td>
                            <td className="px-3 py-2 text-right">{f.data.stock}</td>
                            <td className="px-3 py-2">
                              {conError ? (
                                <span className="text-rose-600 text-xs" title={f.errores.join(', ')}>
                                  {f.errores[0]}
                                </span>
                              ) : esNuevo ? (
                                <span className="text-emerald-600 text-xs">Nuevo</span>
                              ) : (
                                <span className="text-blue-600 text-xs">Actualiza</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filas.length > 100 && (
                  <p className="text-xs text-slate-400 px-3 py-2 bg-slate-50 border-t border-slate-100">
                    Mostrando 100 de {filas.length} filas. Se importarán todas las válidas.
                  </p>
                )}
              </div>

              {filasConError.length > 0 && (
                <p className="text-xs text-slate-500">
                  Las {filasConError.length} filas con error se omitirán; el resto se importará.
                </p>
              )}
            </>
          )}

          {errorArchivo && (
            <p className="text-sm text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {errorArchivo}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Elegir otro archivo
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={filasValidas.length === 0 || bulkImport.isPending}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {bulkImport.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
              {bulkImport.isPending ? 'Importando…' : `Importar ${filasValidas.length} productos`}
            </button>
          </div>
        </div>
      )}

      {paso === 'resultado' && resultado && (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
            <h3 className="text-lg font-semibold text-slate-800">Importación completada</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Resumen label="Creados" value={resultado.creados} color="text-emerald-600" />
            <Resumen label="Actualizados" value={resultado.actualizados} color="text-blue-600" />
            <Resumen label="Omitidos" value={resultado.errores.length} color="text-rose-600" />
          </div>

          {resultado.errores.length > 0 && (
            <div className="border border-slate-200 rounded-lg max-h-40 overflow-auto p-3 text-xs text-slate-600 space-y-1">
              {resultado.errores.map((e) => (
                <p key={e.fila}>
                  <span className="font-medium text-rose-600">Fila {e.fila}:</span> {e.mensaje}
                </p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Listo
          </button>
        </div>
      )}
    </Modal>
  );
}

function Resumen({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
