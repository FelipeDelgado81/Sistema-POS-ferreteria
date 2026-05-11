export function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    const error = new Error(`Variable de entorno requerida no configurada: ${name}`);
    error.statusCode = 500;
    throw error;
  }

  return value;
}

export function getOptionalEnv(name, fallback = '') {
  return process.env[name] || fallback;
}
