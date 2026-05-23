import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'ferreteria-pos-api',
    timestamp: new Date().toISOString(),
  });
});

router.all('/', (req, res) => {
  res.setHeader('Allow', 'GET');
  res.status(405).json({
    error: `Metodo ${req.method} no permitido`,
    allowedMethods: ['GET'],
  });
});

export default router;
