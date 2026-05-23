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

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/categorias', categoriasRouter);
  app.use('/api/productos', productosRouter);
  app.use('/api/clientes', clientesRouter);
  app.use('/api/proveedores', proveedoresRouter);
  app.use('/api/ventas', ventasRouter);
  app.use('/api/caja', cajaRouter);
  app.use('/api/fiados', fiadosRouter);

  app.use(errorHandler);

  return app;
}
