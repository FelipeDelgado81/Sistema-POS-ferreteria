import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import type { ReporteData } from '@/types';

const ASR_BLUE = '#0057B8';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#1e293b', fontFamily: 'Helvetica' },
  header: { marginBottom: 24, borderBottom: `2 solid ${ASR_BLUE}`, paddingBottom: 12 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: ASR_BLUE },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 20, marginBottom: 8 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    width: '47%',
    border: '1 solid #e2e8f0',
    borderRadius: 6,
    padding: 12,
  },
  metricLabel: { fontSize: 9, color: '#64748b' },
  metricValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottom: '1 solid #f1f5f9',
  },
  cellLeft: { flex: 1 },
  cellRight: { width: 120, textAlign: 'right' },
  cellMid: { width: 60, textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 8,
  },
});

const formatCLP = (value: number) => `$${Math.round(value).toLocaleString('es-CL')}`;

interface ReporteDocProps {
  data: ReporteData;
  periodoLabel: string;
  generadoEl: string;
}

function ReporteDoc({ data, periodoLabel, generadoEl }: ReporteDocProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte Financiero — Ferretería ASR</Text>
          <Text style={styles.subtitle}>
            Periodo: {periodoLabel}  ·  Generado el {generadoEl}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ingresos Brutos</Text>
            <Text style={styles.metricValue}>{formatCLP(data.ingresosBrutos)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Costo Mercadería</Text>
            <Text style={styles.metricValue}>-{formatCLP(data.costoMercaderia)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Margen Bruto (Utilidad)</Text>
            <Text style={styles.metricValue}>{formatCLP(data.margenBruto)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ventas (transacciones)</Text>
            <Text style={styles.metricValue}>{data.clientesAtendidos}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Evolución de Ventas</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.cellLeft}>Periodo</Text>
          <Text style={styles.cellRight}>Ventas</Text>
        </View>
        {data.evolucionVentas.map((e) => (
          <View key={e.name} style={styles.tableRow}>
            <Text style={styles.cellLeft}>{e.name}</Text>
            <Text style={styles.cellRight}>{formatCLP(e.total)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Ventas por Categoría</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.cellLeft}>Categoría</Text>
          <Text style={styles.cellMid}>%</Text>
          <Text style={styles.cellRight}>Total</Text>
        </View>
        {data.ventasPorCategoria.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={styles.cellLeft}>Sin ventas en el periodo</Text>
          </View>
        ) : (
          data.ventasPorCategoria.map((c) => (
            <View key={c.name} style={styles.tableRow}>
              <Text style={styles.cellLeft}>{c.name}</Text>
              <Text style={styles.cellMid}>{c.value}%</Text>
              <Text style={styles.cellRight}>{formatCLP(c.total)}</Text>
            </View>
          ))
        )}

        <Text style={styles.footer} fixed>
          Sistema POS — Ferretería ASR · Documento generado automáticamente
        </Text>
      </Page>
    </Document>
  );
}

export async function descargarReportePDF(data: ReporteData, periodoLabel: string): Promise<void> {
  const generadoEl = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const blob = await pdf(
    <ReporteDoc data={data} periodoLabel={periodoLabel} generadoEl={generadoEl} />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-${periodoLabel.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
