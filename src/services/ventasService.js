// Simulated delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const createVenta = async (data) => {
  await delay(300);
  return { id: Date.now(), ...data, fecha: new Date().toISOString() };
};
