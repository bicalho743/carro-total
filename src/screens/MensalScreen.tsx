import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculadoraStore } from '../store/calculadoraStore';

export default function MensalScreen({ irPara }: { irPara: (aba: string) => void }) {
  const store = useCalculadoraStore();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">

        <View style={s.card}>
          <Text style={s.cardTitle}>SEGURO</Text>
          <Text style={s.label}>Seguro anual (R$)</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="numeric"
              placeholder="Ex: 4800"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.seguroAnual > 0 ? String(store.seguroAnual) : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('seguroAnual', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>R$/ano</Text>
          </View>
          <Text style={s.dica}>Hatch popular: R$3–5k · SUV: R$5–9k por ano</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>MANUTENÇÃO</Text>
          <Text style={s.label}>Manutenção anual (R$)</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="numeric"
              placeholder="Ex: 2400"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.manutencaoAnual > 0 ? String(store.manutencaoAnual) : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('manutencaoAnual', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>R$/ano</Text>
          </View>
          <Text style={s.dica}>Revisões + pneus + imprevistos: ~R$200/mês</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>IPVA</Text>
          <Text style={s.label}>Alíquota IPVA (%)</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="numeric"
              placeholder="Ex: 4"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.ipvaPercentual > 0 ? String(store.ipvaPercentual) : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('ipvaPercentual', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>%</Text>
          </View>
          <Text style={s.dica}>MG: 4% · SP: 3% · RJ: 3,5% · PR: 3,5% · RS: 3%</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>OUTROS</Text>
          <Text style={s.label}>Estacionamento + pedágio (R$/mês)</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="numeric"
              placeholder="Ex: 300"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.estacionamentoMes > 0 ? String(store.estacionamentoMes) : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('estacionamentoMes', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>R$/mês</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>CUSTO DE OPORTUNIDADE</Text>
          <Text style={s.label}>Taxa Selic anual (%)</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="decimal-pad"
              placeholder="Ex: 13,75"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.selicAnual > 0 ? String(store.selicAnual).replace('.', ',') : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('selicAnual', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>% a.a.</Text>
          </View>
          <Text style={s.dica}>Quanto você ganharia aplicando o valor do carro</Text>
        </View>

        <TouchableOpacity style={s.btnPrimary} onPress={() => { Keyboard.dismiss(); irPara('total'); }}>
          <Text style={s.btnPrimaryTxt}>Ver Resultado</Text>
          <Ionicons name="bar-chart-outline" size={18} color="#fff" />
        </TouchableOpacity>

      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 11, color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 5, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC' },
  inputFlex: { flex: 1, padding: 11, fontSize: 14, color: '#0F172A' },
  sufixo: { paddingRight: 12, color: '#94A3B8', fontSize: 13 },
  dica: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  btnPrimary: { backgroundColor: '#6366F1', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 4 },
  btnPrimaryTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
