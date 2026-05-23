-- Sistema POS Ferreteria - schema inicial MVP

create extension if not exists pgcrypto;

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  rut text,
  razon_social text not null,
  contacto text,
  telefono text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  codigo_barra text not null unique,
  nombre text not null,
  descripcion text,
  categoria_id uuid references categorias(id) on delete set null,
  proveedor_id uuid references proveedores(id) on delete set null,
  precio_compra numeric(12, 2) not null default 0 check (precio_compra >= 0),
  precio_venta_minorista numeric(12, 2) not null default 0 check (precio_venta_minorista >= 0),
  precio_venta_mayorista numeric(12, 2) not null default 0 check (precio_venta_mayorista >= 0),
  stock integer not null default 0 check (stock >= 0),
  stock_minimo integer not null default 0 check (stock_minimo >= 0),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists historial_precios_compra (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  proveedor_id uuid references proveedores(id) on delete set null,
  precio_compra numeric(12, 2) not null check (precio_compra >= 0),
  fecha timestamptz not null default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  razon_social text not null,
  rut text unique,
  direccion text,
  email text,
  telefono text,
  tipo text not null default 'persona' check (tipo in ('persona', 'empresa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  fecha timestamptz not null default now(),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  descuento_tipo text not null default 'none' check (descuento_tipo in ('none', 'percent', 'fixed')),
  descuento_valor numeric(12, 2) not null default 0 check (descuento_valor >= 0),
  descuento_monto numeric(12, 2) not null default 0 check (descuento_monto >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  medio_pago text not null check (medio_pago in ('efectivo', 'tarjeta', 'fiado')),
  estado text not null default 'completada' check (estado in ('completada', 'anulada')),
  monto_recibido numeric(12, 2),
  vuelto numeric(12, 2),
  tipo_documento text not null default 'comprobante_interno',
  numero_dte text,
  created_at timestamptz not null default now()
);

create table if not exists detalle_ventas (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  precio_compra_unitario numeric(12, 2) not null default 0 check (precio_compra_unitario >= 0),
  total numeric(12, 2) not null check (total >= 0)
);

create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid references proveedores(id) on delete set null,
  fecha timestamptz not null default now(),
  numero_documento text,
  total numeric(12, 2) not null default 0 check (total >= 0),
  notas text,
  created_at timestamptz not null default now()
);

create table if not exists detalle_compras (
  id uuid primary key default gen_random_uuid(),
  compra_id uuid not null references compras(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad integer not null check (cantidad > 0),
  costo_unitario numeric(12, 2) not null check (costo_unitario >= 0),
  total numeric(12, 2) not null check (total >= 0)
);

create table if not exists fiados (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid references ventas(id) on delete set null,
  cliente_id uuid not null references clientes(id) on delete cascade,
  saldo_pendiente numeric(12, 2) not null default 0 check (saldo_pendiente >= 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado', 'anulado')),
  fecha timestamptz not null default now()
);

create table if not exists abonos_fiados (
  id uuid primary key default gen_random_uuid(),
  fiado_id uuid not null references fiados(id) on delete cascade,
  monto numeric(12, 2) not null check (monto > 0),
  fecha timestamptz not null default now(),
  notas text
);

create table if not exists caja_diaria (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique default current_date,
  fondo_inicial numeric(12, 2) not null default 0 check (fondo_inicial >= 0),
  ventas_efectivo numeric(12, 2) not null default 0 check (ventas_efectivo >= 0),
  ventas_tarjeta numeric(12, 2) not null default 0 check (ventas_tarjeta >= 0),
  ingresos numeric(12, 2) not null default 0 check (ingresos >= 0),
  retiros numeric(12, 2) not null default 0 check (retiros >= 0),
  efectivo_esperado numeric(12, 2) not null default 0,
  efectivo_fisico numeric(12, 2),
  diferencia numeric(12, 2),
  estado text not null default 'abierta' check (estado in ('abierta', 'cerrada')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists movimientos_caja (
  id uuid primary key default gen_random_uuid(),
  caja_id uuid not null references caja_diaria(id) on delete cascade,
  tipo text not null check (tipo in ('ingreso', 'retiro')),
  monto numeric(12, 2) not null check (monto > 0),
  descripcion text,
  usuario text,
  created_at timestamptz not null default now()
);

create table if not exists devoluciones (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas(id) on delete cascade,
  motivo text,
  fecha timestamptz not null default now()
);

create index if not exists idx_productos_categoria_id on productos(categoria_id);
create index if not exists idx_productos_proveedor_id on productos(proveedor_id);
create index if not exists idx_productos_codigo_barra on productos(codigo_barra);
create index if not exists idx_ventas_fecha on ventas(fecha);
create index if not exists idx_ventas_estado on ventas(estado);
create index if not exists idx_detalle_ventas_venta_id on detalle_ventas(venta_id);
create index if not exists idx_detalle_ventas_producto_id on detalle_ventas(producto_id);
create index if not exists idx_compras_fecha on compras(fecha);
create index if not exists idx_compras_proveedor_id on compras(proveedor_id);
create index if not exists idx_detalle_compras_compra_id on detalle_compras(compra_id);
create index if not exists idx_detalle_compras_producto_id on detalle_compras(producto_id);
create index if not exists idx_fiados_cliente_id on fiados(cliente_id);
create index if not exists idx_fiados_venta_id on fiados(venta_id);
create index if not exists idx_abonos_fiados_fiado_id on abonos_fiados(fiado_id);
create index if not exists idx_devoluciones_venta_id on devoluciones(venta_id);
create index if not exists idx_historial_precios_compra_producto_id on historial_precios_compra(producto_id);
create index if not exists idx_historial_precios_compra_proveedor_id on historial_precios_compra(proveedor_id);
create index if not exists idx_ventas_cliente_id on ventas(cliente_id);
create index if not exists idx_caja_diaria_fecha on caja_diaria(fecha);
create index if not exists idx_movimientos_caja_caja_id on movimientos_caja(caja_id);

alter table categorias enable row level security;
alter table proveedores enable row level security;
alter table productos enable row level security;
alter table historial_precios_compra enable row level security;
alter table clientes enable row level security;
alter table ventas enable row level security;
alter table detalle_ventas enable row level security;
alter table compras enable row level security;
alter table detalle_compras enable row level security;
alter table fiados enable row level security;
alter table abonos_fiados enable row level security;
alter table caja_diaria enable row level security;
alter table movimientos_caja enable row level security;
alter table devoluciones enable row level security;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

alter function set_updated_at() set search_path = public;

drop trigger if exists set_proveedores_updated_at on proveedores;
create trigger set_proveedores_updated_at
before update on proveedores
for each row execute function set_updated_at();

drop trigger if exists set_productos_updated_at on productos;
create trigger set_productos_updated_at
before update on productos
for each row execute function set_updated_at();

drop trigger if exists set_clientes_updated_at on clientes;
create trigger set_clientes_updated_at
before update on clientes
for each row execute function set_updated_at();

create or replace function procesar_venta(
  p_items jsonb,
  p_medio_pago text,
  p_descuento_tipo text default 'none',
  p_descuento_valor numeric default 0,
  p_cliente_id uuid default null,
  p_monto_recibido numeric default null
)
returns uuid as $$
declare
  v_item jsonb;
  v_producto productos%rowtype;
  v_venta_id uuid;
  v_cantidad integer;
  v_precio_unitario numeric;
  v_subtotal numeric := 0;
  v_descuento_monto numeric := 0;
  v_total numeric := 0;
  v_vuelto numeric := null;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'La venta no contiene productos';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_cantidad := (v_item->>'cantidad')::integer;
    v_precio_unitario := (v_item->>'precio_unitario')::numeric;

    select * into v_producto
    from productos
    where id = (v_item->>'producto_id')::uuid
    and activo = true
    for update;

    if not found then
      raise exception 'Producto no encontrado: %', v_item->>'producto_id';
    end if;

    if v_cantidad <= 0 then
      raise exception 'La cantidad debe ser mayor a cero';
    end if;

    if v_producto.stock < v_cantidad then
      raise exception 'Stock insuficiente para %', v_producto.nombre;
    end if;

    v_subtotal := v_subtotal + (v_cantidad * v_precio_unitario);
  end loop;

  if p_descuento_tipo = 'percent' then
    v_descuento_monto := round(v_subtotal * least(p_descuento_valor, 100) / 100);
  elsif p_descuento_tipo = 'fixed' then
    v_descuento_monto := least(p_descuento_valor, v_subtotal);
  end if;

  v_total := greatest(v_subtotal - v_descuento_monto, 0);

  if p_medio_pago = 'efectivo' and p_monto_recibido is not null then
    v_vuelto := greatest(p_monto_recibido - v_total, 0);
  end if;

  insert into ventas (
    cliente_id,
    subtotal,
    descuento_tipo,
    descuento_valor,
    descuento_monto,
    total,
    medio_pago,
    monto_recibido,
    vuelto
  )
  values (
    p_cliente_id,
    v_subtotal,
    p_descuento_tipo,
    p_descuento_valor,
    v_descuento_monto,
    v_total,
    p_medio_pago,
    p_monto_recibido,
    v_vuelto
  )
  returning id into v_venta_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_cantidad := (v_item->>'cantidad')::integer;
    v_precio_unitario := (v_item->>'precio_unitario')::numeric;

    select * into v_producto
    from productos
    where id = (v_item->>'producto_id')::uuid
    for update;

    update productos
    set stock = stock - v_cantidad
    where id = v_producto.id;

    insert into detalle_ventas (
      venta_id,
      producto_id,
      cantidad,
      precio_unitario,
      precio_compra_unitario,
      total
    )
    values (
      v_venta_id,
      v_producto.id,
      v_cantidad,
      v_precio_unitario,
      v_producto.precio_compra,
      v_cantidad * v_precio_unitario
    );
  end loop;

  if p_medio_pago = 'fiado' and p_cliente_id is not null then
    insert into fiados (venta_id, cliente_id, saldo_pendiente)
    values (v_venta_id, p_cliente_id, v_total);
  end if;

  return v_venta_id;
end;
$$ language plpgsql;

alter function procesar_venta(jsonb, text, text, numeric, uuid, numeric) set search_path = public;

create or replace function anular_venta(p_venta_id uuid, p_motivo text default null)
returns void as $$
declare
  v_detalle record;
begin
  update ventas
  set estado = 'anulada'
  where id = p_venta_id
  and estado = 'completada';

  if not found then
    raise exception 'Venta no encontrada o ya anulada';
  end if;

  for v_detalle in
    select producto_id, cantidad
    from detalle_ventas
    where venta_id = p_venta_id
  loop
    update productos
    set stock = stock + v_detalle.cantidad
    where id = v_detalle.producto_id;
  end loop;

  insert into devoluciones (venta_id, motivo)
  values (p_venta_id, p_motivo);
end;
$$ language plpgsql;

alter function anular_venta(uuid, text) set search_path = public;

create or replace function registrar_abono(
  p_fiado_id uuid,
  p_monto numeric,
  p_notas text default null,
  p_usuario text default null
)
returns uuid as $$
declare
  v_fiado fiados%rowtype;
  v_caja_id uuid;
  v_abono_id uuid;
  v_nuevo_saldo numeric;
  v_cliente_nombre text;
begin
  if p_monto is null or p_monto <= 0 then
    raise exception 'El monto del abono debe ser mayor a cero';
  end if;

  select * into v_fiado
  from fiados
  where id = p_fiado_id
  for update;

  if not found then
    raise exception 'Fiado no encontrado';
  end if;

  if v_fiado.estado <> 'pendiente' then
    raise exception 'El fiado no está pendiente';
  end if;

  if p_monto > v_fiado.saldo_pendiente then
    raise exception 'El abono supera el saldo pendiente';
  end if;

  select id into v_caja_id
  from caja_diaria
  where fecha = current_date
  and estado = 'abierta'
  limit 1;

  if v_caja_id is null then
    raise exception 'No hay una caja abierta hoy para registrar el abono';
  end if;

  insert into abonos_fiados (fiado_id, monto, notas)
  values (p_fiado_id, p_monto, nullif(trim(p_notas), ''))
  returning id into v_abono_id;

  v_nuevo_saldo := v_fiado.saldo_pendiente - p_monto;

  update fiados
  set saldo_pendiente = v_nuevo_saldo,
      estado = case when v_nuevo_saldo = 0 then 'pagado' else estado end
  where id = p_fiado_id;

  select razon_social into v_cliente_nombre
  from clientes
  where id = v_fiado.cliente_id;

  insert into movimientos_caja (caja_id, tipo, monto, descripcion, usuario)
  values (
    v_caja_id,
    'ingreso',
    p_monto,
    'Abono fiado - ' || coalesce(v_cliente_nombre, 'Cliente'),
    p_usuario
  );

  return v_abono_id;
end;
$$ language plpgsql;

alter function registrar_abono(uuid, numeric, text, text) set search_path = public;

revoke execute on function procesar_venta(jsonb, text, text, numeric, uuid, numeric) from anon, authenticated;
revoke execute on function anular_venta(uuid, text) from anon, authenticated;
revoke execute on function registrar_abono(uuid, numeric, text, text) from anon, authenticated;

insert into categorias (nombre)
values
  ('Herramientas'),
  ('Construccion'),
  ('Pintura'),
  ('Electrico'),
  ('Plomeria')
on conflict (nombre) do nothing;
