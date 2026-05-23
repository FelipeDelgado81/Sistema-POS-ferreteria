-- Migración: tabla de movimientos manuales de caja (ingresos / retiros).
-- Aplicar sobre una base ya inicializada con schema.sql.

create table if not exists movimientos_caja (
  id uuid primary key default gen_random_uuid(),
  caja_id uuid not null references caja_diaria(id) on delete cascade,
  tipo text not null check (tipo in ('ingreso', 'retiro')),
  monto numeric(12, 2) not null check (monto > 0),
  descripcion text,
  usuario text,
  created_at timestamptz not null default now()
);

create index if not exists idx_movimientos_caja_caja_id on movimientos_caja(caja_id);

alter table movimientos_caja enable row level security;
