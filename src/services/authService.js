export const loginRequest = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@ferresys.cl' && password === 'admin123') {
        resolve({ 
          token: 'mock-jwt-token-7a8b9c', 
          user: { name: 'Administrador', role: 'admin', email } 
        });
      } else {
        reject(new Error('Credenciales inválidas. Usa admin@ferresys.cl / admin123'));
      }
    }, 500);
  });
};
