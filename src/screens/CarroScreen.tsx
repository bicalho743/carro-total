import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculadoraStore } from '../store/calculadoraStore';
import { TAXAS_BR } from '../utils/financeiro';
import { fmtMoeda } from '../utils/formatters';

const ESTADOS = Object.keys(TAXAS_BR.ipva).sort();

export default function CarroScreen({ navigation }: any) {
  const store = useCalculadoraStore();
  const [estadoOpen, setEstadoOpen] = useState(false);

  function campo(label: string, key: keyof typeof store, teclado = 'numeric', prefixo = '') {
    return (
      <View style={s.campo}>
        <Text style={s.label}>{label}</Text>
        <View style={s.inputRow}>
          {prefixo ? <Text style={s.prefixo}>{prefixo}</Text> : null}
          <TextInput
            style={[s.input, prefixo ? { paddingLeft: 4 } : null]}
            keyboardType={teclado as any}
            value={String(store[key] ?? '')}
            onChangeText={(v) => {
              const num = parseFloat(v.replace(',', '.'));
              store.setField(key as any, isNaN(num) ? 0 : num);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>

      {/* FIPE Banner */}
      {store.fipeModeloNome ? (
        <TouchableOpacity style={s.fipeBanner} onPress={() => navigation.navigate('FipeSearch')}>
          <Ionicons name="checkmark-circle" size={18} color="#27500A" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={s.fipeBannerNome}>{store.fipeMarcaNome} {store.fipeModeloNome}</Text>
            <Text style={s.fipeBannerVal}>FIPE: {fmtMoeda(store.fipeValor)} · Cód. {store.fipeCodigoFipe}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#3B6D11" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.fipeBannerEmpty} onPress={() => Alert.alert('Em breve', 'Busca FIPE disponível na próxima versão')}>
          <Ionicons name="search-outline" size={18} color="#185FA5" />
          <Text style={s.fipeBannerEmptyTxt}>Buscar modelo na tabela FIPE</Text>
          <Ionicons name="chevron-forward" size={16} color="#185FA5" />
        </TouchableOpacity>
      )}

      {/* Card dados */}
      <View style={s.card}>
        <Text style={s.cardTitle}>
          <Ionicons name="car-outline" size={15} /> Dados do veículo
        </Text>

        {campo('Valor do carro', 'valorCarro', 'numeric', 'R$')}
        {campo('Ano do modelo', 'anoModelo', 'number-pad')}

        {/* Estado / IPVA */}
        <View style={s.campo}>
          <Text style={s.label}>Estado — IPVA: {((TAXAS_BR.ipva[store.estado] ?? 0.04) * 100).toFixed(0)}%</Text>
          <TouchableOpacity style={s.input} onPress={() => setEstadoOpen(!estadoOpen)}>
            <Text style={{ color: '#1a1a2e', fontSize: 14 }}>{store.estado}</Text>
          </TouchableOpacity>
          {estadoOpen && (
            <View style={s.dropdown}>
              {ESTADOS.map((uf) => (
                <TouchableOpacity
                  key={uf}
                  style={s.dropItem}
                  onPress={() => { store.setField('estado', uf); setEstadoOpen(false); }}
                >
                  <Text style={s.dropItemTxt}>{uf} — {(TAXAS_BR.ipva[uf] * 100).toFixed(0)}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Card consumo */}
      <View style={s.card}>
        <Text style={s.cardTitle}>
          <Ionicons name="speedometer-outline" size={15} /> Uso e consumo
        </Text>
        {campo('Km rodados por mês', 'kmMes', 'numeric')}
        {campo('Consumo médio (km/L)', 'consumo', 'numeric')}
        {campo('Preço gasolina (R$/L)', 'precoCombustivel', 'numeric', 'R$')}

        {/* Preview combustível */}
        {store.kmMes > 0 && store.consumo > 0 && (
          <View style={s.preview}>
            <Text style={s.previewTxt}>
              Combustível: {fmtMoeda((store.kmMes / store.consumo) * store.precoCombustivel)}/mês
              · {(store.kmMes / store.consumo).toFixed(0)} L
            </Text>
          </View>
        )}
      </View>

      {/* Botão próximo */}
      <TouchableOpacity style={s.btnNext} onPress={() => navigation.navigate('Financiamento')}>
        <Text style={s.btnNextTxt}>Financiamento</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={s.btnSkip} onPress={() => navigation.navigate('Resultado')}>
        <Text style={s.btnSkipTxt}>Ver resultado direto →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 0.5, borderColor: '#dee2e6',
    padding: 16, marginBottom: 12,
  },
  cardTitle: { fontSize: 13, color: '#6c757d', fontWeight: '500', marginBottom: 14 },
  campo: { marginBottom: 12 },
  label: { fontSize: 12, color: '#6c757d', marginBottom: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#ced4da', borderRadius: 8 },
  prefixo: { paddingLeft: 10, color: '#6c757d', fontSize: 14 },
  input: {
    flex: 1, padding: 10, fontSize: 14, color: '#1a1a2e',
    borderWidth: 0.5, borderColor: '#ced4da', borderRadius: 8,
  },
  dropdown: {
    borderWidth: 0.5, borderColor: '#ced4da', borderRadius: 8,
    backgroundColor: '#fff', marginTop: 4, maxHeight: 200,
  },
  dropItem: { padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f3f5' },
  dropItemTxt: { fontSize: 13, color: '#1a1a2e' },
  preview: {
    backgroundColor: '#f1f3f5', borderRadius: 8,
    padding: 10, marginTop: 4,
  },
  previewTxt: { fontSize: 12, color: '#495057' },
  fipeBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EAF3DE', borderRadius: 10,
    padding: 12, marginBottom: 12,
    borderWidth: 0.5, borderColor: '#9FE1CB',
  },
  fipeBannerNome: { fontSize: 13, fontWeight: '500', color: '#27500A' },
  fipeBannerVal: { fontSize: 11, color: '#3B6D11', marginTop: 2 },
  fipeBannerEmpty: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E6F1FB', borderRadius: 10,
    padding: 12, marginBottom: 12,
    borderWidth: 0.5, borderColor: '#B5D4F4', gap: 8,
  },
  fipeBannerEmptyTxt: { flex: 1, fontSize: 13, color: '#185FA5', fontWeight: '500' },
  btnNext: {
    backgroundColor: '#1a1a2e', borderRadius: 10,
    padding: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
    marginBottom: 8,
  },
  btnNextTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnSkip: { alignItems: 'center', padding: 12 },
  btnSkipTxt: { color: '#6c757d', fontSize: 13 },
});
