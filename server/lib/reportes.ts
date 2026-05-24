// Resolución de periodos y agrupamiento temporal para los reportes.
// Todos los cálculos de fecha usan la zona horaria de la ferretería para que
// "hoy", "este mes", etc. coincidan con el horario local aunque el servidor
// (Vercel) corra en UTC.

const TIME_ZONE = 'America/Santiago';
const DAY_MS = 24 * 60 * 60 * 1000;
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export type ReportePeriodo = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'anio';

const PERIODOS_VALIDOS: ReportePeriodo[] = ['hoy', 'semana', 'mes', 'trimestre', 'anio'];

export function parsePeriodo(value: unknown): ReportePeriodo {
  return PERIODOS_VALIDOS.includes(value as ReportePeriodo) ? (value as ReportePeriodo) : 'mes';
}

interface SantiagoParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  dateKey: string;
  monthKey: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function santiagoParts(date: Date): SantiagoParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  let hour = get('hour');
  if (hour === '24') hour = '00';

  return {
    year,
    month,
    day,
    hour,
    dateKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
  };
}

function weekdayLabel(date: Date): string {
  const raw = new Intl.DateTimeFormat('es-CL', { timeZone: TIME_ZONE, weekday: 'short' }).format(
    date,
  );
  const clean = raw.replace('.', '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export interface Bucket {
  key: string;
  label: string;
}

export interface PeriodoResuelto {
  // Límite inferior (UTC ISO) para acotar la consulta. Se sobre-consulta con
  // margen y luego se filtra por bucket, así no hay errores de borde por TZ.
  desdeIso: string;
  buckets: Bucket[];
  keyOf: (fecha: string) => string;
}

export function resolvePeriodo(periodo: ReportePeriodo, now: Date): PeriodoResuelto {
  const p = santiagoParts(now);

  switch (periodo) {
    case 'hoy': {
      const currentHour = Number(p.hour);
      const buckets: Bucket[] = [];
      for (let h = 0; h <= currentHour; h++) {
        buckets.push({ key: `${p.dateKey} ${pad(h)}`, label: `${h}h` });
      }
      return {
        desdeIso: new Date(now.getTime() - 2 * DAY_MS).toISOString(),
        buckets,
        keyOf: (fecha) => {
          const sp = santiagoParts(new Date(fecha));
          return `${sp.dateKey} ${sp.hour}`;
        },
      };
    }

    case 'semana': {
      const buckets: Bucket[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * DAY_MS);
        buckets.push({ key: santiagoParts(d).dateKey, label: weekdayLabel(d) });
      }
      return {
        desdeIso: new Date(now.getTime() - 9 * DAY_MS).toISOString(),
        buckets,
        keyOf: (fecha) => santiagoParts(new Date(fecha)).dateKey,
      };
    }

    case 'mes': {
      const today = Number(p.day);
      const buckets: Bucket[] = [];
      for (let d = 1; d <= today; d++) {
        buckets.push({ key: `${p.year}-${p.month}-${pad(d)}`, label: String(d) });
      }
      return {
        desdeIso: new Date(now.getTime() - 33 * DAY_MS).toISOString(),
        buckets,
        keyOf: (fecha) => santiagoParts(new Date(fecha)).dateKey,
      };
    }

    case 'trimestre': {
      const buckets: Bucket[] = [];
      const year = Number(p.year);
      const month = Number(p.month);
      for (let i = 2; i >= 0; i--) {
        let mm = month - i;
        let yy = year;
        while (mm <= 0) {
          mm += 12;
          yy -= 1;
        }
        buckets.push({ key: `${yy}-${pad(mm)}`, label: `${MESES[mm - 1]} ${yy}` });
      }
      return {
        desdeIso: new Date(now.getTime() - 95 * DAY_MS).toISOString(),
        buckets,
        keyOf: (fecha) => santiagoParts(new Date(fecha)).monthKey,
      };
    }

    case 'anio': {
      const buckets: Bucket[] = [];
      const currentMonth = Number(p.month);
      for (let m = 1; m <= currentMonth; m++) {
        buckets.push({ key: `${p.year}-${pad(m)}`, label: MESES[m - 1] });
      }
      return {
        desdeIso: new Date(now.getTime() - 370 * DAY_MS).toISOString(),
        buckets,
        keyOf: (fecha) => santiagoParts(new Date(fecha)).monthKey,
      };
    }
  }
}

// Normaliza una relación de Supabase que puede venir como objeto o como array.
export function relacionUno<T = Record<string, any>>(value: unknown): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null;
  return (value as T) ?? null;
}
