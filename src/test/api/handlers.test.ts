import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../server/app';

const app = createApp();

describe('api handlers', () => {
  it('GET /api/health responde OK', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      service: 'ferreteria-pos-api',
    });
    expect(res.body.timestamp).toEqual(expect.any(String));
  });

  it('GET /api/health rechaza metodos no permitidos', async () => {
    const res = await request(app).post('/api/health');

    expect(res.status).toBe(405);
    expect(res.headers.allow).toBe('GET');
  });

  it('rutas protegidas sin token responden 401', async () => {
    const res = await request(app).get('/api/productos');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token requerido');
  });

  it('GET /api/caja/actual sin token responde 401', async () => {
    const res = await request(app).get('/api/caja/actual');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token requerido');
  });

  it('GET /api/ventas sin token responde 401', async () => {
    const res = await request(app).get('/api/ventas');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token requerido');
  });
});
