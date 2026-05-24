import express, { type Express } from 'express';
import cors from 'cors';
import { errorHandler } from './lib/http';
import healthRouter from './routes/health';
import categoriasRouter from './routes/categorias';
import productosRouter from './routes/productos';
import clientesRouter from './routes/clientes';
import proveedoresRouter from './routes/proveedores';
import ventasRouter from './routes/ventas';
import cajaRouter from './routes/caja';
import fiadosRouter from './routes/fiados';
import dashboardRouter from './routes/dashboard';
import reportesRouter from './routes/reportes';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/categorias', categoriasRouter);
  app.use('/api/productos', productosRouter);
  app.use('/api/clientes', clientesRouter);
  app.use('/api/proveedores', proveedoresRouter);
  app.use('/api/ventas', ventasRouter);
  app.use('/api/caja', cajaRouter);
  app.use('/api/fiados', fiadosRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/reportes', reportesRouter);

  app.use(errorHandler);

  return app;
}
