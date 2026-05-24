-- Migración: RPC registrar_abono.
-- Registra un abono sobre un fiado pendiente, baja el saldo (y marca 'pagado'
-- al llegar a 0) y deja el monto como ingreso en la caja diaria abierta.
-- Aplicar sobre una base ya inicializada con schema.sql.

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

revoke execute on function registrar_abono(uuid, numeric, text, text) from anon, authenticated;
