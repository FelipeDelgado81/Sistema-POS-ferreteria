import { useState } from 'react';
import { mockProveedores } from '@/mock/proveedores';

export const CATEGORIAS_PROVEEDOR = [
  'Herramientas', 'Construcción', 'Pintura', 'Eléctrico',
  'Plomería', 'Seguridad', 'Jardín', 'Limpieza', 'Otros',
];

export function useProveedores() {
  const [proveedores, setProveedores] = useState(mockProveedores);

  const totalDeuda = proveedores.reduce((sum, p) => sum + (p.deuda || 0), 0);
  const proveedoresVencidos = proveedores.filter((p) => p.estado === 'Vencida').length;

  return {
    proveedores,
    setProveedores,
    totalDeuda,
    proveedoresVencidos,
  };
}