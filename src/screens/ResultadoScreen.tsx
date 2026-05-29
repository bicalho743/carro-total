import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculadoraStore } from '../store/calculadoraStore';
import {
  calcCustoMensal, calcFinanciamento,
  custoOportunidadeMes, custoOportunidadeAcumulado, calcIPVA
} from '../utils/financeiro';
import { fmtMoeda, fmtPct, fmtKm } from '../utils/formatters';

function MetricCard({ label, valor, cor = '#1a1a2e' }: { label: string; valor: string; cor?: string }) {
  return (
    <View style={s.metricCard}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={[s.metricVal, { color: cor }]}>{valor}</Text>
    </View>
  );
}

function LinhaDetalhe({ label, valor, destaque = false }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <View style={s.linhaDetalhe}>
      <Text style={s.linhaLabel}>{label}</Text>
      <Text style={[s.linhaVal, destaque && { color: '#A32D2D' }]}>{valor}</Text>
    </View>
  );
}

export default function ResultadoScreen({ navigation }: any) {
  const store = useCalculadoraStore();

  const custo = useMemo(() => {
    const ipvaAnual = store.ipvaManual
      ? store.ipvaValorAnual
      : calcIPVA(store.valorCarro, store.estado);

    return calcCustoMensal({
      valorCarro: store.valorCarro,
      anoModelo: store.anoModelo,
      estado: store.estado,
      kmMes: store.kmMes,
      consumo: store.consumo,
      precoCombustivel: store.precoCombustivel,
      financiar: store.financiar,
      entrada: store.entrada,
      taxaMensal: store.taxaMensal,
      prazo: store.prazo,
      seguroAnual: store.seguroAnual,
      manutencaoAnual: store.manutencaoAnual,
      estacionamentoMes: store.estacionamentoMes,
      ipvaManual: ipvaAnual,
    });
  }, [store]);

  const financResult = useMemo(() => {
    if (!store.financiar) return null;
    return calcFinanciamento(store.valorCarro, store.entrada, store.taxaMensal, store.prazo);
  }, [store]);

  const oppMes = custoOportunidadeMes(store.valorCarro, store.selicAnual);
  const opp5anos = custoOportunidadeAcumulado(store.valorCarro, store.selicAnual, 5);
  const total5anos = custo.total * 60;

  // Barras de proporção
  const itens = [
    { label: 'Financiamento', val: custo.parcela, cor: '#e94560' },
    { label: 'Combustível', val: custo.combustivel, cor: '#378ADD' },
    { label: 'Seguro', val: custo.seguro, cor: '#BA7517' },
    { label: 'IPVA', val: custo.ipva, cor: '#3B6D11' },
    { label: 'Manutenção', val: custo.manutencao, cor: '#993556' },
    { label: 'Desvalorização', val: custo.desvalorizacao, cor: '#A32D2D' },
    { label: 'Estacion./pedágio', val: custo.estacionamento, cor: '#5F5E5A' },
  ].filter(i => i.val > 0);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Métricas principais */}
      <View style={s.metricGrid}>
        <MetricCard label="Custo total/mês" valor={fmtMoeda(custo.total)} cor="#A32D2D" />
        <MetricCard label="Custo por km" valor={`R$ ${custo.custoPorKm.toFixed(2)}`} cor="#854F0B" />
        <MetricCard label="Em 5 anos" valor={fmtMoeda(total5anos)} cor="#A32D2D" />
        <MetricCard label="Desvalor. 1º ano" valor={fmtMoeda(custo.desvalorizacao * 12)} cor="#854F0B" />
      </View>

      {/* Detalhamento */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Detalhamento mensal</Text>
        <LinhaDetalhe label="Parcela financiamento" valor={fmtMoeda(custo.parcela)} destaque />
        <LinhaDetalhe label="Combustível" valor={fmtMoeda(custo.combustivel)} />
        <LinhaDetalhe label="Seguro" valor={fmtMoeda(custo.seguro)} />
        <LinhaDetalhe label="IPVA" valor={fmtMoeda(custo.ipva)} />
        <LinhaDetalhe label="Manutenção" valor={fmtMoeda(custo.manutencao)} />
        <LinhaDetalhe label="Estacion. / pedágio" valor={fmtMoeda(custo.estacionamento)} />
        <LinhaDetalhe label="Desvalorização (est.)" valor={fmtMoeda(custo.desvalorizacao)} destaque />
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total mensal</Text>
          <Text style={s.totalVal}>{fmtMoeda(custo.total)}</Text>
        </View>
      </View>

      {/* Barras de proporção */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Distribuição dos custos</Text>
        {itens.map((item) => {
          const pct = custo.total > 0 ? (item.val / custo.total) * 100 : 0;
          return (
            <View key={item.label} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={s.barLabel}>{item.label}</Text>
                <Text style={s.barPct}>{pct.toFixed(0)}%</Text>
              </View>
              <View style={s.barBg}>
                <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: item.cor }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Financiamento resumo */}
      {financResult && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Resumo do financiamento</Text>
          <LinhaDetalhe label="Valor financiado" valor={fmtMoeda(store.valorCarro - store.entrada)} />
          <LinhaDetalhe label="Parcela mensal" valor={fmtMoeda(financResult.parcela)} destaque />
          <LinhaDetalhe label="Total pago no prazo" valor={fmtMoeda(financResult.totalPago)} />
          <LinhaDetalhe label="Juros pagos" valor={fmtMoeda(financResult.juros)} destaque />
          <LinhaDetalhe label="Juros sobre o carro" valor={fmtPct(financResult.pctJuros)} destaque />
          {financResult.alertaCaro && (
            <View style={s.alertaBox}>
              <Ionicons name="warning-outline" size={16} color="#854F0B" />
              <Text style={s.alertaTxt}>Taxa acima de 2,5% a.m. — considere negociar ou dar mais entrada</Text>
            </View>
          )}
        </View>
      )}

      {/* Custo de oportunidade */}
      <View style={[s.card, { borderColor: '#9FE1CB', borderWidth: 1 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Ionicons name="leaf-outline" size={16} color="#3B6D11" />
          <Text style={[s.cardTitle, { marginBottom: 0, color: '#27500A' }]}>Custo de oportunidade (Selic {store.selicAnual}% a.a.)</Text>
        </View>
        <Text style={s.oppDesc}>
          Se aplicar {fmtMoeda(store.valorCarro)} no Tesouro Selic em vez de comprar o carro:
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <View style={[s.oppBox, { flex: 1 }]}>
            <Text style={s.oppLabel}>Rendimento/mês</Text>
            <Text style={s.oppVal}>{fmtMoeda(oppMes)}</Text>
          </View>
          <View style={[s.oppBox, { flex: 1 }]}>
            <Text style={s.oppLabel}>Acumulado em 5 anos</Text>
            <Text style={s.oppVal}>{fmtMoeda(opp5anos)}</Text>
          </View>
        </View>
      </View>

      {/* Botões ação */}
      <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('Comparativo')}>
        <Ionicons name="git-compare-outline" size={18} color="#fff" />
        <Text style={s.btnPrimaryTxt}>Comparar com Uber/99</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('Veiculo')}>
        <Ionicons name="refresh-outline" size={16} color="#1a1a2e" />
        <Text style={s.btnSecondaryTxt}>Editar dados</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metricCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#dee2e6',
    padding: 12, alignItems: 'center',
  },
  metricLabel: { fontSize: 11, color: '#6c757d', marginBottom: 4, textAlign: 'center' },
  metricVal: { fontSize: 17, fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 0.5, borderColor: '#dee2e6',
    padding: 16, marginBottom: 12,
  },
  cardTitle: { fontSize: 13, color: '#6c757d', fontWeight: '500', marginBottom: 12 },
  linhaDetalhe: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f1f3f5',
  },
  linhaLabel: { fontSize: 13, color: '#495057' },
  linhaVal: { fontSize: 13, fontWeight: '500', color: '#1a1a2e' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 12, marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  totalVal: { fontSize: 16, fontWeight: '700', color: '#A32D2D' },
  barLabel: { fontSize: 12, color: '#495057' },
  barPct: { fontSize: 12, color: '#6c757d' },
  barBg: { height: 8, backgroundColor: '#f1f3f5', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  alertaBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FAEEDA', borderRadius: 8, padding: 10, marginTop: 8,
  },
  alertaTxt: { flex: 1, fontSize: 12, color: '#633806', lineHeight: 18 },
  oppDesc: { fontSize: 12, color: '#495057', lineHeight: 18 },
  oppBox: {
    backgroundColor: '#EAF3DE', borderRadius: 8, padding: 12, alignItems: 'center',
  },
  oppLabel: { fontSize: 11, color: '#3B6D11', marginBottom: 4 },
  oppVal: { fontSize: 16, fontWeight: '600', color: '#27500A' },
  btnPrimary: {
    backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, marginBottom: 8,
  },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnSecondary: {
    borderWidth: 0.5, borderColor: '#dee2e6', borderRadius: 10, padding: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  btnSecondaryTxt: { color: '#1a1a2e', fontSize: 13 },
});
