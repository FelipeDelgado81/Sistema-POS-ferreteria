export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

export function createHttpError(statusCode, message, details = undefined) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;

  res.setHeader('Allow', methods.join(', '));
  sendJson(res, 405, {
    error: `Metodo ${req.method} no permitido`,
    allowedMethods: methods,
  });

  return false;
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  if (typeof req.body === 'string') {
    return req.body.trim() ? JSON.parse(req.body) : {};
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody.trim() ? JSON.parse(rawBody) : {};
}

export function handleApiError(res, error) {
  const statusCode = error.statusCode || 500;

  sendJson(res, statusCode, {
    error: error.message || 'Error interno del servidor',
    details: error.details,
  });
}
