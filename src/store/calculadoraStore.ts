import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------------------------------------------
// Tipos
// ------------------------------------------------------------
export interface CarroData {
  valorCarro: number;
  anoModelo: number;
  estado: string;
  kmMes: number;
  consumo: number;
  precoCombustivel: number;
  // FIPE
  fipeMarcaId: string;
  fipeMarcaNome: string;
  fipeModeloId: string;
  fipeModeloNome: string;
  fipeAnoId: string;
  fipeValor: number;
  fipeCodigoFipe: string;
}

export interface FinanciamentoData {
  financiar: boolean;
  entrada: number;
  taxaMensal: number;
  prazo: number;
}

export interface MensalData {
  seguroAnual: number;
  manutencaoAnual: number;
  estacionamentoMes: number;
  ipvaManual: boolean;
  ipvaValorAnual: number;
  selicAnual: number;
}

export interface CalculadoraState extends CarroData, FinanciamentoData, MensalData {
  setField: <K extends keyof CalculadoraState>(key: K, value: CalculadoraState[K]) => void;
  setFipe: (dados: Partial<CarroData>) => void;
  reset: () => void;
}

// ------------------------------------------------------------
// Defaults
// ------------------------------------------------------------
const DEFAULTS: Omit<CalculadoraState, 'setField' | 'setFipe' | 'reset'> = {
  // Carro
  valorCarro: 80000,
  anoModelo: new Date().getFullYear(),
  estado: 'MG',
  kmMes: 1500,
  consumo: 12,
  precoCombustivel: 6.20,
  fipeMarcaId: '',
  fipeMarcaNome: '',
  fipeModeloId: '',
  fipeModeloNome: '',
  fipeAnoId: '',
  fipeValor: 0,
  fipeCodigoFipe: '',
  // Financiamento
  financiar: true,
  entrada: 20000,
  taxaMensal: 1.89,
  prazo: 48,
  // Mensal
  seguroAnual: 4800,
  manutencaoAnual: 2400,
  estacionamentoMes: 300,
  ipvaManual: false,
  ipvaValorAnual: 0,
  selicAnual: 13.75,
};

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------
export const useCalculadoraStore = create<CalculadoraState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setField: (key, value) => set({ [key]: value } as Partial<CalculadoraState>),

      setFipe: (dados) => set((state) => ({ ...state, ...dados })),

      reset: () => set(DEFAULTS as Partial<CalculadoraState>),
    }),
    {
      name: 'carrototal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Não persistir campos transitórios se necessário
      partialize: (state) => ({
        valorCarro: state.valorCarro,
        anoModelo: state.anoModelo,
        estado: state.estado,
        kmMes: state.kmMes,
        consumo: state.consumo,
        precoCombustivel: state.precoCombustivel,
        financiar: state.financiar,
        entrada: state.entrada,
        taxaMensal: state.taxaMensal,
        prazo: state.prazo,
        seguroAnual: state.seguroAnual,
        manutencaoAnual: state.manutencaoAnual,
        estacionamentoMes: state.estacionamentoMes,
        ipvaManual: state.ipvaManual,
        ipvaValorAnual: state.ipvaValorAnual,
        selicAnual: state.selicAnual,
        fipeMarcaId: state.fipeMarcaId,
        fipeMarcaNome: state.fipeMarcaNome,
        fipeModeloId: state.fipeModeloId,
        fipeModeloNome: state.fipeModeloNome,
        fipeAnoId: state.fipeAnoId,
        fipeValor: state.fipeValor,
        fipeCodigoFipe: state.fipeCodigoFipe,
      }),
    }
  )
);
