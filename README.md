# Sistema POS Ferreteria

Aplicacion web para gestion de una ferreteria familiar: inventario, punto de venta, clientes y fiados, proveedores, caja, reportes y dashboard.

## Estado actual

El proyecto esta en fase de MVP frontend. La navegacion principal, layout y pantallas base ya existen, pero varios modulos aun trabajan con datos simulados desde `src/mock`.

Modulos disponibles:

- Login con credenciales mock.
- Dashboard con metricas y graficos simulados.
- Inventario con CRUD local, filtros, alertas de stock e ingreso de mercaderia.
- POS con carrito, busqueda, precio minorista/mayorista, pago efectivo/tarjeta simulado y calculo de vuelto.
- Clientes y fiados con vista de consulta simulada.
- Proveedores con vista de consulta simulada.
- Caja con cierre y cuadre simulado.
- Reportes con graficos simulados.

## Stack

- React 19
- Vite 8
- React Router DOM 7
- TailwindCSS 4
- Axios
- Recharts
- Lucide React
- Vitest + Testing Library
- Supabase SDK instalado para futuras integraciones
- `@react-pdf/renderer` instalado para comprobantes PDF

## Requisitos

- Node.js compatible con Vite 8.
- npm.

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app se ejecuta en el puerto que indique Vite en consola.

Credenciales temporales:

```txt
Email: admin@ferresys.cl
Password: admin123
```

Estas credenciales son mock y deben reemplazarse por autenticacion real antes de produccion.

## Scripts

```bash
npm run lint
npm run test:run
npm run build
npm run preview
```

Antes de cerrar un commit funcional se deben ejecutar:

```bash
npm run lint
npm run test:run
npm run build
```

## Estructura principal

```txt
src/
  components/
    layout/
    shared/
  hooks/
  mock/
  pages/
    auth/
    caja/
    clientes/
    dashboard/
    inventario/
    proveedores/
    reportes/
    ventas/
  services/
  test/
```

## Proximos hitos

1. Mantener lint, tests y build en verde.
2. Documentar variables de entorno futuras en `.env.example`.
3. Crear schema inicial de Supabase.
4. Agregar Vercel Functions para autenticacion y productos.
5. Conectar inventario a datos reales.
6. Conectar POS a ventas reales con descuento de stock atomico.

## Alcance del MVP

Incluido:

- Una ferreteria.
- Inventario.
- POS.
- Clientes y fiados.
- Proveedores.
- Caja.
- Reportes.
- Comprobante interno no tributario.

Excluido por ahora:

- Facturacion electronica SII.
- Multi-sucursal.
- App movil nativa.
- E-commerce.
- SaaS multi-tenant.
