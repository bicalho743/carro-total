import { create } from 'zustand';

interface CalculadoraState {
  valorCarro: number;
  anoModelo: number;
  kmMes: number;
  consumo: number;
  precoCombustivel: number;
  financiar: boolean;
  entrada: number;
  taxaMensal: number;
  prazo: number;
  seguroAnual: number;
  manutencaoAnual: number;
  estacionamentoMes: number;
  ipvaPercentual: number;
  selicAnual: number;
  setField: (key: string, value: any) => void;
  reset: () => void;
}

export const useCalculadoraStore = create<CalculadoraState>()((set) => ({
  valorCarro: 0,
  anoModelo: new Date().getFullYear(),
  kmMes: 0,
  consumo: 0,
  precoCombustivel: 0,
  financiar: false,
  entrada: 0,
  taxaMensal: 0,
  prazo: 0,
  seguroAnual: 0,
  manutencaoAnual: 0,
  estacionamentoMes: 0,
  ipvaPercentual: 0,
  selicAnual: 13.75,
  setField: (key, value) => set((state) => ({ ...state, [key]: value })),
  reset: () => set({
    valorCarro: 0, anoModelo: new Date().getFullYear(),
    kmMes: 0, consumo: 0, precoCombustivel: 0,
    financiar: false, entrada: 0, taxaMensal: 0, prazo: 0,
    seguroAnual: 0, manutencaoAnual: 0, estacionamentoMes: 0,
    ipvaPercentual: 0, selicAnual: 13.75,
  }),
}));
