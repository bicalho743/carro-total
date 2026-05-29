import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, FlatList, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculadoraStore } from '../store/calculadoraStore';
import { fmtMoeda } from '../utils/formatters';

const ESTADOS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function CarroScreen({ irPara }: { irPara: (aba: string) => void }) {
  const store = useCalculadoraStore();
  const [estadoModal, setEstadoModal] = useState(false);

  const combMes = store.kmMes > 0 && store.consumo > 0
    ? (store.kmMes / store.consumo) * store.precoCombustivel : 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">

        <View style={s.card}>
          <Text style={s.cardTitle}>VEÍCULO</Text>

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

          <Text style={[s.label, { marginTop: 12 }]}>Ano do modelo</Text>
          <TextInput
            style={s.input}
            keyboardType="numeric"
            placeholder="Ex: 2024"
            placeholderTextColor="#CBD5E1"
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
            value={store.anoModelo > 0 ? String(store.anoModelo) : ''}
            onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('anoModelo', isNaN(n) ? 0 : n); }}
          />

          <Text style={[s.label, { marginTop: 12 }]}>Estado</Text>
          <TouchableOpacity style={s.selectBtn} onPress={() => { Keyboard.dismiss(); setEstadoModal(true); }}>
            <Text style={[{ fontSize: 14, color: store.estado ? '#0F172A' : '#CBD5E1' }]}>
              {store.estado || 'Selecione o estado'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>USO E CONSUMO</Text>

          <Text style={s.label}>Km por mês</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="numeric"
              placeholder="Ex: 1500"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.kmMes > 0 ? String(store.kmMes) : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('kmMes', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>km/mês</Text>
          </View>

          <Text style={[s.label, { marginTop: 12 }]}>Consumo médio</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="numeric"
              placeholder="Ex: 12"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.consumo > 0 ? String(store.consumo) : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('consumo', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>km/L</Text>
          </View>

          <Text style={[s.label, { marginTop: 12 }]}>Preço do combustível</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.inputFlex}
              keyboardType="decimal-pad"
              placeholder="Ex: 6,20"
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={store.precoCombustivel > 0 ? String(store.precoCombustivel).replace('.', ',') : ''}
              onChangeText={(v) => { const n = parseFloat(v.replace(',','.')); store.setField('precoCombustivel', isNaN(n) ? 0 : n); }}
            />
            <Text style={s.sufixo}>R$/L</Text>
          </View>

          {combMes > 0 && (
            <View style={s.previewBox}>
              <Ionicons name="flame-outline" size={14} color="#6366F1" />
              <Text style={s.previewTxt}>
                Combustível: <Text style={{ fontWeight: '700', color: '#4338CA' }}>{fmtMoeda(combMes)}/mês</Text>
                {' · '}{(store.kmMes / store.consumo).toFixed(0)} litros
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={s.btnPrimary} onPress={() => { Keyboard.dismiss(); irPara('financ'); }}>
          <Text style={s.btnPrimaryTxt}>Próxima: Financiamento</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <Modal visible={estadoModal} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setEstadoModal(false)}>
            <View style={s.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={s.modalSheet}>
                  <Text style={s.modalTitle}>Selecione o estado</Text>
                  <FlatList
                    data={ESTADOS}
                    keyExtractor={(i) => i}
                    numColumns={4}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[s.chip, store.estado === item && s.chipActive]}
                        onPress={() => { store.setField('estado', item); setEstadoModal(false); }}
                      >
                        <Text style={[s.chipTxt, store.estado === item && s.chipTxtActive]}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 11, color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', padding: 11, fontSize: 14, color: '#0F172A' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC' },
  inputFlex: { flex: 1, padding: 11, fontSize: 14, color: '#0F172A' },
  sufixo: { paddingRight: 12, color: '#94A3B8', fontSize: 13 },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', padding: 11 },
  previewBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', borderRadius: 8, padding: 10, marginTop: 12 },
  previewTxt: { fontSize: 12, color: '#4338CA', flex: 1 },
  btnPrimary: { backgroundColor: '#6366F1', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 4 },
  btnPrimaryTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16, textAlign: 'center' },
  chip: { flex: 1, margin: 4, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipTxt: { fontSize: 13, color: '#475569', fontWeight: '500' },
  chipTxtActive: { color: '#FFFFFF', fontWeight: '700' },
});
