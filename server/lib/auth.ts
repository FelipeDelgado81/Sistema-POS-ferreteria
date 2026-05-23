import type { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from './supabase';
import { createHttpError } from './http';

export interface AuthUser {
  id: string;
  email: string | undefined;
  role: string;
  name: string | undefined;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw createHttpError(401, 'Token requerido');
    }

    const { data, error } = await getSupabaseAdmin().auth.getUser(token);

    if (error || !data?.user) {
      throw createHttpError(401, 'Token invalido o expirado');
    }

    const { user } = data;
    req.user = {
      id: user.id,
      email: user.email,
      role: (user.app_metadata?.role as string) ?? 'seller',
      name: (user.user_metadata?.name as string) ?? user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}
