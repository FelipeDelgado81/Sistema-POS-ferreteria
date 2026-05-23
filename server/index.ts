import { createApp } from './app';

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

createApp().listen(port, () => {
  console.log(`API de ferreteria escuchando en http://localhost:${port}`);
});
