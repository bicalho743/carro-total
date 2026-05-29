import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculadoraStore } from '../store/calculadoraStore';
import {
  calcCustoMensal, calcFinanciamento,
  custoOportunidadeMes, custoOportunidadeAcumulado
} from '../utils/financeiro';
import { fmtMoeda } from '../utils/formatters';

function Linha({ label, valor, destaque = false }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <View style={s.linha}>
      <Text style={s.linhaLabel}>{label}</Text>
      <Text style={[s.linhaVal, destaque && { color: '#EF4444' }]}>{valor}</Text>
    </View>
  );
}

export default function ResultadoScreen({ irPara }: { irPara: (aba: string) => void }) {
  const store = useCalculadoraStore();

  const custo = useMemo(() => calcCustoMensal({
    valorCarro: store.valorCarro,
    anoModelo: store.anoModelo,
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
    ipvaPercentual: store.ipvaPercentual,
  }), [store]);

  const fin = useMemo(() => {
    if (!store.financiar || store.valorCarro <= 0 || store.prazo <= 0) return null;
    return calcFinanciamento(store.valorCarro, store.entrada, store.taxaMensal, store.prazo);
  }, [store]);

  const oppMes = custoOportunidadeMes(store.valorCarro, store.selicAnual);
  const opp5anos = custoOportunidadeAcumulado(store.valorCarro, store.selicAnual, 5);
  const total5anos = custo.total * 60;
  const saldoInvestindo = store.valorCarro + opp5anos;
  const diferenca = saldoInvestindo + total5anos;

  const itens = [
    { label: 'Financiamento', val: custo.parcela, cor: '#6366F1' },
    { label: 'Combustível', val: custo.combustivel, cor: '#3B82F6' },
    { label: 'Seguro', val: custo.seguro, cor: '#F59E0B' },
    { label: 'IPVA', val: custo.ipva, cor: '#10B981' },
    { label: 'Manutenção', val: custo.manutencao, cor: '#EC4899' },
    { label: 'Desvalorização', val: custo.desvalorizacao, cor: '#EF4444' },
    { label: 'Estacionamento', val: custo.estacionamento, cor: '#6B7280' },
  ].filter(i => i.val > 0);

  if (custo.total === 0) {
    return (
      <View style={s.vazio}>
        <Ionicons name="calculator-outline" size={52} color="#CBD5E1" />
        <Text style={s.vazioTxt}>Preencha os dados nas telas anteriores para ver o resultado</Text>
        <TouchableOpacity style={s.btnPrimary} onPress={() => irPara('carro')}>
          <Text style={s.btnPrimaryTxt}>Começar agora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* 4 métricas — cada uma numa linha separada para não cortar */}
      <View style={s.metricGrid}>
        <View style={s.metricRow}>
          <View style={[s.metricCard, { flex: 1 }]}>
            <Text style={s.metricLabel}>Custo total/mês</Text>
            <Text style={[s.metricVal, { color: '#EF4444' }]}>{fmtMoeda(custo.total)}</Text>
          </View>
          <View style={[s.metricCard, { flex: 1 }]}>
            <Text style={s.metricLabel}>Custo por km</Text>
            <Text style={[s.metricVal, { color: '#F59E0B' }]}>R$ {custo.custoPorKm.toFixed(2)}</Text>
          </View>
        </View>
        <View style={s.metricRow}>
          <View style={[s.metricCard, { flex: 1 }]}>
            <Text style={s.metricLabel}>Total em 5 anos</Text>
            <Text style={[s.metricVal, { color: '#EF4444' }]}>{fmtMoeda(total5anos)}</Text>
          </View>
          <View style={[s.metricCard, { flex: 1 }]}>
            <Text style={s.metricLabel}>Desvalorização 1º ano</Text>
            <Text style={[s.metricVal, { color: '#F59E0B' }]}>{fmtMoeda(custo.desvalorizacao * 12)}</Text>
          </View>
        </View>
      </View>

      {/* Detalhamento */}
      <View style={s.card}>
        <Text style={s.cardTitle}>DETALHAMENTO MENSAL</Text>
        {custo.parcela > 0 && <Linha label="Parcela financiamento" valor={fmtMoeda(custo.parcela)} destaque />}
        {custo.combustivel > 0 && <Linha label="Combustível" valor={fmtMoeda(custo.combustivel)} />}
        {custo.seguro > 0 && <Linha label="Seguro" valor={fmtMoeda(custo.seguro)} />}
        {custo.ipva > 0 && <Linha label={`IPVA (${store.ipvaPercentual}% a.a.)`} valor={fmtMoeda(custo.ipva)} />}
        {custo.manutencao > 0 && <Linha label="Manutenção" valor={fmtMoeda(custo.manutencao)} />}
        {custo.estacionamento > 0 && <Linha label="Estacionamento / pedágio" valor={fmtMoeda(custo.estacionamento)} />}
        {custo.desvalorizacao > 0 && <Linha label="Desvalorização estimada" valor={fmtMoeda(custo.desvalorizacao)} destaque />}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total mensal</Text>
          <Text style={s.totalVal}>{fmtMoeda(custo.total)}</Text>
        </View>
      </View>

      {/* Distribuição */}
      {itens.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>DISTRIBUIÇÃO DOS CUSTOS</Text>
          {itens.map((item) => {
            const pct = custo.total > 0 ? (item.val / custo.total) * 100 : 0;
            return (
              <View key={item.label} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
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
      )}

      {/* Financiamento */}
      {fin && (
        <View style={s.card}>
          <Text style={s.cardTitle}>RESUMO DO FINANCIAMENTO</Text>
          <Linha label="Valor financiado" valor={fmtMoeda(fin.financiado)} />
          <Linha label="Parcela mensal" valor={fmtMoeda(fin.parcela)} destaque />
          <Linha label={`Total em ${store.prazo} parcelas`} valor={fmtMoeda(fin.totalPago)} />
          <Linha label="Total em juros" valor={fmtMoeda(fin.juros)} destaque />
          <Linha label="Juros sobre o valor" valor={`${fin.pctJuros.toFixed(1)}%`} destaque />
          {fin.alertaCaro && (
            <View style={s.alerta}>
              <Ionicons name="warning-outline" size={15} color="#92400E" />
              <Text style={s.alertaTxt}>Taxa acima de 2,5% a.m. — considere negociar ou dar mais entrada</Text>
            </View>
          )}
        </View>
      )}

      {/* Custo de oportunidade */}
      {store.valorCarro > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>CUSTO DE OPORTUNIDADE</Text>
          <Text style={s.oppDesc}>
            Rendimento de {fmtMoeda(store.valorCarro)} aplicado na Selic ({store.selicAnual}% a.a.):
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={[s.oppBox, { flex: 1 }]}>
              <Text style={s.oppLabel}>Por mês</Text>
              <Text style={s.oppVal}>{fmtMoeda(oppMes)}</Text>
            </View>
            <View style={[s.oppBox, { flex: 1 }]}>
              <Text style={s.oppLabel}>Em 5 anos</Text>
              <Text style={s.oppVal}>{fmtMoeda(opp5anos)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* COMPARATIVO — layout em coluna, sem side-by-side */}
      {store.valorCarro > 0 && (
        <View style={s.compCard}>
          <Text style={s.cardTitle}>COMPRAR VS INVESTIR — 5 ANOS</Text>
          <Text style={s.compSub}>O que acontece com {fmtMoeda(store.valorCarro)}?</Text>

          {/* Comprar */}
          <View style={s.compBlocoRed}>
            <View style={s.compBlocoHeader}>
              <Ionicons name="car-sport" size={18} color="#EF4444" />
              <Text style={s.compBlocoTitleRed}>Comprando o carro</Text>
            </View>
            <View style={s.compLinha}>
              <Text style={s.compLinhaLabel}>Gastos em 5 anos</Text>
              <Text style={[s.compLinhaVal, { color: '#EF4444' }]}>- {fmtMoeda(total5anos)}</Text>
            </View>
            <View style={s.compLinha}>
              <Text style={s.compLinhaLabel}>Desvalorização total</Text>
              <Text style={[s.compLinhaVal, { color: '#EF4444' }]}>- {fmtMoeda(custo.desvalorizacao * 60)}</Text>
            </View>
            <View style={[s.compLinha, s.compLinhaTotal]}>
              <Text style={s.compLinhaTotalLabel}>Impacto total</Text>
              <Text style={[s.compLinhaTotalVal, { color: '#DC2626' }]}>- {fmtMoeda(total5anos)}</Text>
            </View>
          </View>

          {/* Investir */}
          <View style={s.compBlocoGreen}>
            <View style={s.compBlocoHeader}>
              <Ionicons name="trending-up" size={18} color="#10B981" />
              <Text style={s.compBlocoTitleGreen}>Investindo na Selic</Text>
            </View>
            <View style={s.compLinha}>
              <Text style={s.compLinhaLabel}>Capital inicial</Text>
              <Text style={[s.compLinhaVal, { color: '#059669' }]}>{fmtMoeda(store.valorCarro)}</Text>
            </View>
            <View style={s.compLinha}>
              <Text style={s.compLinhaLabel}>Rendimento em 5 anos</Text>
              <Text style={[s.compLinhaVal, { color: '#059669' }]}>+ {fmtMoeda(opp5anos)}</Text>
            </View>
            <View style={[s.compLinha, s.compLinhaTotal]}>
              <Text style={s.compLinhaTotalLabel}>Saldo final</Text>
              <Text style={[s.compLinhaTotalVal, { color: '#047857' }]}>+ {fmtMoeda(saldoInvestindo)}</Text>
            </View>
          </View>

          {/* Diferença */}
          <View style={s.diferencaBox}>
            <Text style={s.diferencaLabel}>Diferença em 5 anos</Text>
            <Text style={s.diferencaVal}>{fmtMoeda(diferenca)}</Text>
            <Text style={s.diferencaSub}>a mais no bolso investindo vs comprando</Text>
          </View>
        </View>
      )}

      {/* Explicação para leigos */}
      {custo.total > 0 && (
        <View style={s.explicacaoCard}>
          <View style={s.explicacaoHeader}>
            <Ionicons name="bulb-outline" size={18} color="#D97706" />
            <Text style={s.explicacaoTitulo}>Entendendo os números</Text>
          </View>

          <Text style={s.explicacaoTexto}>
            💡 <Text style={s.bold}>Custo por km:</Text> Para cada quilômetro que você rodar, o carro custa R$ {custo.custoPorKm.toFixed(2)}. Isso inclui tudo — não só gasolina.
          </Text>

          <Text style={s.explicacaoTexto}>
            📉 <Text style={s.bold}>Desvalorização:</Text> Todo carro perde valor com o tempo. No 1º ano, a queda é maior (cerca de 12%). É como se parte do dinheiro que você pagou "evaporasse" só por ter comprado o carro — mesmo sem bater ou estragar nada.
          </Text>

          <Text style={s.explicacaoTexto}>
            🏦 <Text style={s.bold}>Custo de oportunidade:</Text> Se você tivesse guardado esse dinheiro na poupança ou Tesouro Direto, ele renderia todo mês. Isso é o que você abre mão ao comprar o carro.
          </Text>

          <Text style={s.explicacaoTexto}>
            ⚠️ <Text style={s.bold}>Financiamento:</Text> Quando você financia, paga juros em cima do valor do carro. Quanto maior a taxa e o prazo, mais você paga no total — às vezes 30% a 40% a mais do que o preço original.
          </Text>

          <Text style={s.explicacaoTexto}>
            🧾 <Text style={s.bold}>IPVA:</Text> Imposto anual obrigatório. Varia por estado — em MG é 4% do valor do carro por ano. Um carro de R$ 100 mil = R$ 4.000 de IPVA todo janeiro.
          </Text>

          <Text style={[s.explicacaoTexto, { marginBottom: 0 }]}>
            ✅ <Text style={s.bold}>Resumo simples:</Text> O custo real do carro vai muito além da parcela. Some tudo e você terá o valor verdadeiro que sai do seu bolso todo mês.
          </Text>
        </View>
      )}

      <TouchableOpacity style={s.btnSecondary} onPress={() => irPara('carro')}>
        <Ionicons name="refresh-outline" size={16} color="#0F172A" />
        <Text style={s.btnSecondaryTxt}>Editar dados</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  vazioTxt: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  // Métricas em linhas de 2
  metricGrid: { gap: 8, marginBottom: 12 },
  metricRow: { flexDirection: 'row', gap: 8 },
  metricCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, elevation: 1,
  },
  metricLabel: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  metricVal: { fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16, marginBottom: 12, elevation: 1,
  },
  cardTitle: {
    fontSize: 11, color: '#6366F1', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  linha: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  linhaLabel: { fontSize: 13, color: '#475569', flex: 1, marginRight: 8 },
  linhaVal: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  totalVal: { fontSize: 18, fontWeight: '700', color: '#EF4444' },
  barLabel: { fontSize: 12, color: '#475569', flex: 1 },
  barPct: { fontSize: 12, color: '#94A3B8', minWidth: 36, textAlign: 'right' },
  barBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  alerta: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFFBEB', borderRadius: 8, padding: 10, marginTop: 8,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  alertaTxt: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  oppDesc: { fontSize: 13, color: '#475569', lineHeight: 20 },
  oppBox: { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, alignItems: 'center' },
  oppLabel: { fontSize: 11, color: '#059669', marginBottom: 4, fontWeight: '500' },
  oppVal: { fontSize: 17, fontWeight: '700', color: '#047857' },
  // Comparativo em coluna
  compCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 2, borderColor: '#6366F1',
    padding: 16, marginBottom: 12,
  },
  compSub: { fontSize: 13, color: '#64748B', marginBottom: 14 },
  compBlocoRed: {
    backgroundColor: '#FFF5F5', borderRadius: 12,
    borderWidth: 1, borderColor: '#FCA5A5',
    padding: 14, marginBottom: 10,
  },
  compBlocoGreen: {
    backgroundColor: '#F0FDF4', borderRadius: 12,
    borderWidth: 1, borderColor: '#6EE7B7',
    padding: 14, marginBottom: 14,
  },
  compBlocoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  compBlocoTitleRed: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  compBlocoTitleGreen: { fontSize: 14, fontWeight: '700', color: '#047857' },
  compLinha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  compLinhaLabel: { fontSize: 13, color: '#475569' },
  compLinhaVal: { fontSize: 13, fontWeight: '600' },
  compLinhaTotal: {
    borderBottomWidth: 0, paddingTop: 10, marginTop: 4,
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)',
  },
  compLinhaTotalLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  compLinhaTotalVal: { fontSize: 15, fontWeight: '800' },
  diferencaBox: {
    backgroundColor: '#1E1B4B', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  diferencaLabel: { fontSize: 12, color: '#A5B4FC', marginBottom: 4 },
  diferencaVal: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  diferencaSub: { fontSize: 11, color: '#818CF8', marginTop: 4, textAlign: 'center' },
  btnPrimary: {
    backgroundColor: '#6366F1', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 8,
  },
  btnPrimaryTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  explicacaoCard: {
    backgroundColor: '#FFFBEB', borderRadius: 16,
    borderWidth: 1, borderColor: '#FDE68A',
    padding: 16, marginBottom: 12,
  },
  explicacaoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  explicacaoTitulo: {
    fontSize: 14, fontWeight: '700', color: '#92400E',
  },
  explicacaoTexto: {
    fontSize: 13, color: '#44403C', lineHeight: 20, marginBottom: 12,
  },
  bold: { fontWeight: '700' },
  btnSecondary: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  btnSecondaryTxt: { color: '#0F172A', fontSize: 13, fontWeight: '500' },
});
