import jwt from 'jsonwebtoken';
import { getOptionalEnv, getRequiredEnv } from './env.js';
import { createHttpError } from './http.js';

const DEFAULT_USERS = [
  {
    email: 'admin@ferresys.cl',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
  },
  {
    email: 'ventas@ferresys.cl',
    password: 'venta123',
    name: 'Vendedor',
    role: 'seller',
  },
];

function getConfiguredUsers() {
  const rawUsers = getOptionalEnv('APP_USERS_JSON');

  if (!rawUsers) return DEFAULT_USERS;

  try {
    const users = JSON.parse(rawUsers);
    return Array.isArray(users) ? users : DEFAULT_USERS;
  } catch {
    throw createHttpError(500, 'APP_USERS_JSON no contiene un JSON valido');
  }
}

export function validateCredentials(email, password) {
  const user = getConfiguredUsers().find(
    (candidate) => candidate.email === email && candidate.password === password
  );

  if (!user) {
    throw createHttpError(401, 'Credenciales invalidas');
  }

  return {
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function signToken(user) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      role: user.role,
    },
    getRequiredEnv('JWT_SECRET'),
    { expiresIn: '8h' }
  );
}

export function requireAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw createHttpError(401, 'Token requerido');
  }

  try {
    return jwt.verify(token, getRequiredEnv('JWT_SECRET'));
  } catch {
    throw createHttpError(401, 'Token invalido o expirado');
  }
}
