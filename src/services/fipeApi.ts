// fipeApi.ts — API FIPE pública (parallelum.com.br)
// Gratuita, sem autenticação, sem chave

const BASE = 'https://parallelum.com.br/fipe/api/v1';

export type TipoVeiculo = 'carros' | 'motos' | 'caminhoes';

export interface FipeMarca {
  codigo: string;
  nome: string;
}

export interface FipeModelo {
  codigo: number;
  nome: string;
}

export interface FipeAno {
  codigo: string;
  nome: string;
}

export interface FipePreco {
  Valor: string;          // "R$ 80.000,00"
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FIPE API erro: ${res.status}`);
  return res.json();
}

export async function getMarcas(tipo: TipoVeiculo = 'carros'): Promise<FipeMarca[]> {
  return get<FipeMarca[]>(`${BASE}/${tipo}/marcas`);
}

export async function getModelos(tipo: TipoVeiculo = 'carros', marcaId: string) {
  return get<{ modelos: FipeModelo[]; anos: FipeAno[] }>(
    `${BASE}/${tipo}/marcas/${marcaId}/modelos`
  );
}

export async function getAnos(tipo: TipoVeiculo = 'carros', marcaId: string, modeloId: string): Promise<FipeAno[]> {
  return get<FipeAno[]>(`${BASE}/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos`);
}

export async function getPreco(
  tipo: TipoVeiculo = 'carros',
  marcaId: string,
  modeloId: string,
  anoId: string
): Promise<FipePreco> {
  return get<FipePreco>(
    `${BASE}/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`
  );
}

// Converte "R$ 80.000,00" → 80000
export function parseFipeValor(valorStr: string): number {
  return parseFloat(
    valorStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
  );
}
