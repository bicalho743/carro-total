import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import CarroScreen from '../screens/CarroScreen';
import FinanciamentoScreen from '../screens/FinanciamentoScreen';
import MensalScreen from '../screens/MensalScreen';
import ResultadoScreen from '../screens/ResultadoScreen';

const TABS = [
  { key: 'carro',  label: 'Carro',   icon: 'car-sport-outline',  cor: '#6366F1' },
  { key: 'financ', label: 'Financ.', icon: 'card-outline',       cor: '#EC4899' },
  { key: 'mensal', label: 'Mensal',  icon: 'calendar-outline',   cor: '#F59E0B' },
  { key: 'total',  label: 'Total',   icon: 'bar-chart-outline',  cor: '#10B981' },
];

export default function AppNavigator() {
  const [aba, setAba] = useState('carro');
  const insets = useSafeAreaInsets();

  function renderTela() {
    switch (aba) {
      case 'carro':  return <CarroScreen irPara={setAba} />;
      case 'financ': return <FinanciamentoScreen irPara={setAba} />;
      case 'mensal': return <MensalScreen irPara={setAba} />;
      case 'total':  return <ResultadoScreen irPara={setAba} />;
      default:       return <CarroScreen irPara={setAba} />;
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoBox}>
            <Ionicons name="car-sport" size={20} color="#fff" />
          </View>
          <View>
            <Text style={s.headerTitle}>CarroTotal</Text>
            <Text style={s.headerSub}>Calculadora realista do custo do carro</Text>
          </View>
        </View>
      </View>

      {/* ── ABAS ── */}
      <View style={s.tabBar}>
        {TABS.map((tab) => {
          const ativo = aba === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, ativo && { borderBottomColor: tab.cor, borderBottomWidth: 3 }]}
              onPress={() => setAba(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[s.tabIconWrap, ativo && { backgroundColor: tab.cor + '20' }]}>
                <Ionicons name={tab.icon as any} size={18} color={ativo ? tab.cor : '#94A3B8'} />
              </View>
              <Text style={[s.tabLabel, ativo && { color: tab.cor, fontWeight: '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── CONTEÚDO ── */}
      <View style={[s.content, { paddingBottom: insets.bottom }]}>
        {renderTela()}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 42, height: 42,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 4,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 10,
    gap: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabIconWrap: {
    width: 34, height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
