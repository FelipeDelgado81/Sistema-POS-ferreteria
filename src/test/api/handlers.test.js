import { beforeEach, describe, expect, it, vi } from 'vitest';
import healthHandler from '../../../api/health.js';
import loginHandler from '../../../api/auth/login.js';

function createMockResponse() {
  const res = {
    statusCode: undefined,
    payload: undefined,
    headers: {},
    status: vi.fn((statusCode) => {
      res.statusCode = statusCode;
      return res;
    }),
    json: vi.fn((payload) => {
      res.payload = payload;
      return res;
    }),
    setHeader: vi.fn((name, value) => {
      res.headers[name] = value;
      return res;
    }),
  };

  return res;
}

describe('api handlers', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    delete process.env.APP_USERS_JSON;
  });

  it('GET /api/health responde OK', () => {
    const req = { method: 'GET' };
    const res = createMockResponse();

    healthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toMatchObject({
      ok: true,
      service: 'ferreteria-pos-api',
    });
    expect(res.payload.timestamp).toEqual(expect.any(String));
  });

  it('GET /api/health rechaza metodos no permitidos', () => {
    const req = { method: 'POST' };
    const res = createMockResponse();

    healthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.headers.Allow).toBe('GET');
  });

  it('POST /api/auth/login entrega token para credenciales validas', async () => {
    const req = {
      method: 'POST',
      body: {
        email: 'admin@ferresys.cl',
        password: 'admin123',
      },
    };
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload.user).toEqual({
      email: 'admin@ferresys.cl',
      name: 'Administrador',
      role: 'admin',
    });
    expect(res.payload.token).toEqual(expect.any(String));
  });

  it('POST /api/auth/login rechaza credenciales invalidas', async () => {
    const req = {
      method: 'POST',
      body: {
        email: 'admin@ferresys.cl',
        password: 'incorrecta',
      },
    };
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.payload.error).toBe('Credenciales invalidas');
  });
});
