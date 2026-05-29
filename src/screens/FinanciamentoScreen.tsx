import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Switch, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculadoraStore } from '../store/calculadoraStore';
import { calcFinanciamento } from '../utils/financeiro';
import { fmtMoeda } from '../utils/formatters';

const PRAZOS = [12, 24, 36, 48, 60, 72];

export default function FinanciamentoScreen({ irPara }: { irPara: (aba: string) => void }) {
  const store = useCalculadoraStore();
  const [prazoOpen, setPrazoOpen] = useState(false);

  const fin = store.financiar && store.valorCarro > 0 && store.prazo > 0
    ? calcFinanciamento(store.valorCarro, store.entrada, store.taxaMensal, store.prazo)
    : null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <View style={s.card}>
          <View style={s.toggleRow}>
            <View>
              <Text style={s.toggleLabel}>Vai financiar?</Text>
              <Text style={s.toggleSub}>Ative para simular o financiamento</Text>
            </View>
            <Switch
              value={store.financiar}
              onValueChange={(v) => store.setField('financiar', v)}
              trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {store.financiar && (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>VALORES</Text>

              <Text style={s.label}>Valor do carro (R$)</Text>
              <TextInput
                style={s.input}
                keyboardType="numeric"
                placeholder="Ex: 80000"
                placeholderTextColor="#CBD5E1"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
                value={store.valorCarro > 0 ? String(store.valorCarro) : ''}
                onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('valorCarro', isNaN(n) ? 0 : n); }}
              />

              <Text style={[s.label, { marginTop: 12 }]}>Valor de entrada (R$)</Text>
              <TextInput
                style={s.input}
                keyboardType="numeric"
                placeholder="Ex: 20000"
                placeholderTextColor="#CBD5E1"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
                value={store.entrada > 0 ? String(store.entrada) : ''}
                onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('entrada', isNaN(n) ? 0 : n); }}
              />

              <Text style={[s.label, { marginTop: 12 }]}>Prazo</Text>
              <TouchableOpacity style={s.selectBtn} onPress={() => { Keyboard.dismiss(); setPrazoOpen(!prazoOpen); }}>
                <Text style={{ fontSize: 14, color: store.prazo > 0 ? '#0F172A' : '#CBD5E1' }}>
                  {store.prazo > 0 ? `${store.prazo} meses` : 'Selecione o prazo'}
                </Text>
                <Ionicons name={prazoOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
              </TouchableOpacity>
              {prazoOpen && (
                <View style={s.prazoGrid}>
                  {PRAZOS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[s.prazoChip, store.prazo === p && s.prazoChipAtivo]}
                      onPress={() => { store.setField('prazo', p); setPrazoOpen(false); }}
                    >
                      <Text style={[s.prazoChipTxt, store.prazo === p && s.prazoChipTxtAtivo]}>{p}x</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[s.label, { marginTop: 12 }]}>Taxa de juros mensal (%)</Text>
              <View style={s.inputRow}>
                <TextInput
                  style={s.inputFlex}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 1,89"
                  placeholderTextColor="#CBD5E1"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                  value={store.taxaMensal > 0 ? String(store.taxaMensal).replace('.', ',') : ''}
                  onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('taxaMensal', isNaN(n) ? 0 : n); }}
                />
                <Text style={s.sufixo}>% a.m.</Text>
              </View>
              <Text style={s.dica}>Taxa média CDC banco 2025: 1,8% a 2,1% a.m.</Text>
            </View>

            {fin && (
              <View style={s.resultCard}>
                <Text style={s.cardTitle}>SIMULAÇÃO</Text>
                <View style={s.resultRow}>
                  <Text style={s.resultLbl}>Valor financiado</Text>
                  <Text style={s.resultVal}>{fmtMoeda(fin.financiado)}</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultLbl}>Parcela mensal</Text>
                  <Text style={[s.resultVal, { color: '#EF4444', fontSize: 20 }]}>{fmtMoeda(fin.parcela)}</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultLbl}>Total em {store.prazo}x</Text>
                  <Text style={s.resultVal}>{fmtMoeda(fin.totalPago)}</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultLbl}>Total em juros</Text>
                  <Text style={[s.resultVal, { color: '#EF4444' }]}>{fmtMoeda(fin.juros)}</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultLbl}>Juros sobre o carro</Text>
                  <Text style={[s.resultVal, { color: '#EF4444' }]}>{fin.pctJuros.toFixed(1)}%</Text>
                </View>
                {fin.alertaCaro && (
                  <View style={s.alerta}>
                    <Ionicons name="warning-outline" size={15} color="#92400E" />
                    <Text style={s.alertaTxt}>Taxa acima de 2,5% a.m. — considere negociar ou dar mais entrada</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={s.btnPrimary} onPress={() => { Keyboard.dismiss(); irPara('mensal'); }}>
          <Text style={s.btnPrimaryTxt}>Próxima: Custos Mensais</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 11, color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  toggleSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', padding: 11, fontSize: 14, color: '#0F172A' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC' },
  inputFlex: { flex: 1, padding: 11, fontSize: 14, color: '#0F172A' },
  sufixo: { paddingRight: 12, color: '#94A3B8', fontSize: 13 },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', padding: 11 },
  prazoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  prazoChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0' },
  prazoChipAtivo: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  prazoChipTxt: { fontSize: 13, color: '#475569', fontWeight: '500' },
  prazoChipTxtAtivo: { color: '#FFFFFF', fontWeight: '700' },
  dica: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 2, borderColor: '#6366F1', padding: 16, marginBottom: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  resultLbl: { fontSize: 13, color: '#475569' },
  resultVal: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  alerta: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFFBEB', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#FDE68A' },
  alertaTxt: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  btnPrimary: { backgroundColor: '#6366F1', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 4 },
  btnPrimaryTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
