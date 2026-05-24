import { describe, it, expect } from 'vitest';
import { parseCSV, parseNumero, procesarCSVProductos } from '@/lib/csv';

describe('parseCSV', () => {
  it('detecta el delimitador punto y coma (Excel en español)', () => {
    const rows = parseCSV('a;b;c\n1;2;3');
    expect(rows).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('detecta el delimitador coma', () => {
    const rows = parseCSV('a,b,c\n1,2,3');
    expect(rows).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('respeta campos entre comillas con el delimitador dentro', () => {
    const rows = parseCSV('nombre;precio\n"Martillo, grande";5990');
    expect(rows[1]).toEqual(['Martillo, grande', '5990']);
  });

  it('ignora filas completamente vacías', () => {
    const rows = parseCSV('a;b\n\n1;2\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('parseNumero', () => {
  it('parsea formato chileno 1.234,56', () => {
    expect(parseNumero('1.234,56')).toBe(1234.56);
  });

  it('parsea formato internacional 1,234.56', () => {
    expect(parseNumero('1,234.56')).toBe(1234.56);
  });

  it('parsea coma decimal simple', () => {
    expect(parseNumero('1234,5')).toBe(1234.5);
  });

  it('ignora símbolos de moneda', () => {
    expect(parseNumero('$ 5.990')).toBe(5990);
  });

  it('devuelve 0 para valores vacíos o inválidos', () => {
    expect(parseNumero('')).toBe(0);
    expect(parseNumero('abc')).toBe(0);
  });
});

describe('procesarCSVProductos', () => {
  it('mapea encabezados con acentos y mayúsculas', () => {
    const csv = 'Código;Nombre;Categoría;Precio Venta;Stock\n123;Taladro;Herramientas;49990;7';
    const { filas, headersFaltantes } = procesarCSVProductos(csv);
    expect(headersFaltantes).toEqual([]);
    expect(filas).toHaveLength(1);
    expect(filas[0].data).toMatchObject({
      code: '123',
      name: 'Taladro',
      category: 'Herramientas',
      priceRetail: 49990,
      stock: 7,
    });
    expect(filas[0].errores).toEqual([]);
  });

  it('reporta columnas obligatorias faltantes', () => {
    const { headersFaltantes, filas } = procesarCSVProductos('Nombre;Precio\nTaladro;1000');
    expect(headersFaltantes).toContain('Codigo');
    expect(headersFaltantes).toContain('Categoria');
    expect(filas).toHaveLength(0);
  });

  it('marca errores en filas con campos requeridos vacíos', () => {
    const csv = 'Codigo;Nombre;Categoria\n;Sin codigo;Herramientas';
    const { filas } = procesarCSVProductos(csv);
    expect(filas[0].errores).toContain('Falta el código');
  });

  it('numera las filas según su posición en el archivo (base 2)', () => {
    const csv = 'Codigo;Nombre;Categoria\nA1;Uno;Herramientas\nA2;Dos;Pintura';
    const { filas } = procesarCSVProductos(csv);
    expect(filas[0].fila).toBe(2);
    expect(filas[1].fila).toBe(3);
  });
});
