import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ObraScreen() {
  return (
    <View style={s.container}>
      <Text style={s.txt}>Calculadora de Obra</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' },
  txt: { fontSize: 18, color: '#1a1a2e' },
});
