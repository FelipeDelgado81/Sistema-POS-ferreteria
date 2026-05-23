import { useState } from 'react';
import type { MovimientoCajaTipo } from '@/types';
import {
  useCajaActual,
  useAbrirCaja,
  useRegistrarMovimiento,
  useCerrarCaja,
} from '@/hooks/queries/useCajaQuery';

type ModalActivo = 'abrir' | 'movimiento' | 'cerrar' | null;

export function useCaja() {
  const { data: caja, isLoading: loading, isError } = useCajaActual();
  const abrirMutation = useAbrirCaja();
  const movimientoMutation = useRegistrarMovimiento();
  const cerrarMutation = useCerrarCaja();

  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [movimientoTipo, setMovimientoTipo] = useState<MovimientoCajaTipo>('ingreso');

  const [fondoInicial, setFondoInicial] = useState('');
  const [montoMovimiento, setMontoMovimiento] = useState('');
  const [descripcionMovimiento, setDescripcionMovimiento] = useState('');
  const [efectivoFisico, setEfectivoFisico] = useState('');

  const cajaAbierta = caja?.estado === 'abierta';

  const efectivoEsperado = caja?.efectivoEsperado ?? 0;
  const diferencia = Number(efectivoFisico || 0) - efectivoEsperado;

  function cerrarModal() {
    setModalActivo(null);
  }

  function openAbrir() {
    setFondoInicial('');
    setModalActivo('abrir');
  }

  function openMovimiento(tipo: MovimientoCajaTipo) {
    setMovimientoTipo(tipo);
    setMontoMovimiento('');
    setDescripcionMovimiento('');
    setModalActivo('movimiento');
  }

  function openCerrar() {
    setEfectivoFisico('');
    setModalActivo('cerrar');
  }

  async function handleAbrir() {
    const monto = Number(fondoInicial);
    if (!Number.isFinite(monto) || monto < 0) return;
    await abrirMutation.mutateAsync({ fondoInicial: monto });
    cerrarModal();
  }

  async function handleMovimiento() {
    const monto = Number(montoMovimiento);
    if (!Number.isFinite(monto) || monto <= 0) return;
    await movimientoMutation.mutateAsync({
      tipo: movimientoTipo,
      monto,
      descripcion: descripcionMovimiento.trim(),
    });
    cerrarModal();
  }

  async function handleCerrar() {
    const monto = Number(efectivoFisico);
    if (!Number.isFinite(monto) || monto < 0) return;
    await cerrarMutation.mutateAsync({ efectivoFisico: monto });
    cerrarModal();
  }

  return {
    caja,
    loading,
    isError,
    cajaAbierta,
    modalActivo,
    movimientoTipo,
    fondoInicial,
    setFondoInicial,
    montoMovimiento,
    setMontoMovimiento,
    descripcionMovimiento,
    setDescripcionMovimiento,
    efectivoFisico,
    setEfectivoFisico,
    efectivoEsperado,
    diferencia,
    openAbrir,
    openMovimiento,
    openCerrar,
    cerrarModal,
    handleAbrir,
    handleMovimiento,
    handleCerrar,
    saving:
      abrirMutation.isPending ||
      movimientoMutation.isPending ||
      cerrarMutation.isPending,
  };
}
