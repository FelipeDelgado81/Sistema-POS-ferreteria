import { allowMethods, sendJson } from './_lib/http.js';

export default function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  sendJson(res, 200, {
    ok: true,
    service: 'ferreteria-pos-api',
    timestamp: new Date().toISOString(),
  });
}
