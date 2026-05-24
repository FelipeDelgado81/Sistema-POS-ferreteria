import type { ProductoForm } from '@/types';

// Parser CSV sin dependencias. Detecta el delimitador (`,` o `;`, este último
// común en Excel en español), respeta campos entre comillas y quita el BOM.
export function parseCSV(text: string): string[][] {
  const clean = text.replace(/^﻿/, '');
  const delimiter = detectDelimiter(clean);
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.split(/\r?\n/)[0] ?? '';
  const semis = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semis > commas ? ';' : ',';
}

// Parsea un número aceptando formato chileno ("1.234,56") e internacional ("1,234.56").
export function parseNumero(raw: string): number {
  const s = String(raw ?? '').trim().replace(/[^0-9.,-]/g, '');
  if (!s) return 0;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  let normalized = s;

  if (hasComma && hasDot) {
    // El último separador es el decimal; el otro es de miles.
    normalized =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.')
        : s.replace(/,/g, '');
  } else if (hasComma) {
    // Coma sola: decimal (formato es-CL).
    normalized = s.replace(',', '.');
  } else if (hasDot) {
    // Punto solo: ambiguo. Si hay varios puntos, o el último grupo tiene 3
    // dígitos, es separador de miles (ej. "5.990" = 5990 en pesos chilenos);
    // de lo contrario es decimal (ej. "5.99").
    const puntos = (s.match(/\./g) || []).length;
    const ultimoGrupo = s.slice(s.lastIndexOf('.') + 1);
    if (puntos > 1 || ultimoGrupo.length === 3) {
      normalized = s.replace(/\./g, '');
    }
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function normHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Alias de encabezados aceptados -> campo del formulario de producto.
const HEADER_ALIASES: Record<string, keyof ProductoForm> = {
  codigo: 'code',
  codigodebarras: 'code',
  codigobarras: 'code',
  code: 'code',
  sku: 'code',
  nombre: 'name',
  name: 'name',
  producto: 'name',
  categoria: 'category',
  category: 'category',
  rubro: 'category',
  preciocompra: 'priceBuy',
  preciodecompra: 'priceBuy',
  costo: 'priceBuy',
  compra: 'priceBuy',
  precioventa: 'priceRetail',
  precioventaretail: 'priceRetail',
  precioventaminorista: 'priceRetail',
  preciominorista: 'priceRetail',
  precio: 'priceRetail',
  venta: 'priceRetail',
  preciomayorista: 'priceWholesale',
  precioventamayorista: 'priceWholesale',
  mayorista: 'priceWholesale',
  stock: 'stock',
  stockactual: 'stock',
  cantidad: 'stock',
  existencia: 'stock',
  stockminimo: 'minStock',
  stockmin: 'minStock',
  minimo: 'minStock',
  descripcion: 'description',
  detalle: 'description',
};

const NUMERIC_FIELDS: (keyof ProductoForm)[] = [
  'priceBuy',
  'priceRetail',
  'priceWholesale',
  'stock',
  'minStock',
];

export interface FilaImport {
  fila: number;
  data: ProductoForm;
  errores: string[];
}

export interface ResultadoCSV {
  filas: FilaImport[];
  headersFaltantes: string[];
}

export const PLANTILLA_HEADERS = [
  'Codigo',
  'Nombre',
  'Categoria',
  'Precio Compra',
  'Precio Venta',
  'Precio Mayorista',
  'Stock',
  'Stock Minimo',
  'Descripcion',
];

// Procesa el texto de un CSV en filas de producto validadas.
export function procesarCSVProductos(text: string): ResultadoCSV {
  const rows = parseCSV(text);
  if (rows.length === 0) {
    return { filas: [], headersFaltantes: ['Codigo', 'Nombre', 'Categoria'] };
  }

  const headerRow = rows[0];
  const colToField = headerRow.map((h) => HEADER_ALIASES[normHeader(h)] ?? null);

  const presentes = new Set(colToField.filter(Boolean) as (keyof ProductoForm)[]);
  const requeridos: (keyof ProductoForm)[] = ['code', 'name', 'category'];
  const etiqueta: Record<string, string> = { code: 'Codigo', name: 'Nombre', category: 'Categoria' };
  const headersFaltantes = requeridos.filter((f) => !presentes.has(f)).map((f) => etiqueta[f]);

  if (headersFaltantes.length > 0) {
    return { filas: [], headersFaltantes };
  }

  const filas: FilaImport[] = rows.slice(1).map((cols, idx) => {
    const data: ProductoForm = {
      code: '',
      name: '',
      category: '',
      priceBuy: 0,
      priceRetail: 0,
      priceWholesale: 0,
      stock: 0,
      minStock: 0,
      description: '',
    };

    colToField.forEach((field, c) => {
      if (!field) return;
      const value = (cols[c] ?? '').trim();
      if (NUMERIC_FIELDS.includes(field)) {
        (data[field] as number) = parseNumero(value);
      } else {
        (data[field] as string) = value;
      }
    });

    const errores: string[] = [];
    if (!data.code) errores.push('Falta el código');
    if (!data.name) errores.push('Falta el nombre');
    if (!data.category) errores.push('Falta la categoría');
    for (const f of NUMERIC_FIELDS) {
      if ((data[f] as number) < 0) errores.push(`${f} no puede ser negativo`);
    }

    return { fila: idx + 2, data, errores };
  });

  return { filas, headersFaltantes: [] };
}

// Genera el contenido CSV de la plantilla (delimitador `;`, con fila de ejemplo).
export function generarPlantillaCSV(): string {
  const ejemplo = [
    '7801234567890',
    'Martillo Carpintero 16oz',
    'Herramientas',
    '3500',
    '5990',
    '5200',
    '25',
    '5',
    'Mango de fibra de vidrio',
  ];
  return `${PLANTILLA_HEADERS.join(';')}\n${ejemplo.join(';')}`;
}

export function descargarPlantillaCSV(): void {
  const blob = new Blob([`﻿${generarPlantillaCSV()}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla-productos.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
