// ============================================================
// financeiro.ts — Lógica financeira CarroTotal
// ============================================================

// ------------------------------------------------------------
// TAXAS BRASILEIRAS (atualizar a cada trimestre)
// ------------------------------------------------------------
export const TAXAS_BR = {
  ipva: {
    MG: 0.04, SP: 0.03, RJ: 0.035, PR: 0.035,
    RS: 0.03, SC: 0.03, BA: 0.04, GO: 0.035,
    DF: 0.035, CE: 0.035, PE: 0.035, MT: 0.03,
    MS: 0.03, ES: 0.04, PA: 0.03, AM: 0.035,
  } as Record<string, number>,

  selic: 13.75, // % a.a. — atualizar após COPOM

  gasolina: {
    mediaBrasil: 6.20,
    etanol: 4.30,
    diesel: 6.50,
  },

  financiamento: {
    cdcMedio: 1.89,       // % a.m. — CDC banco médio 2025
    fintechMin: 1.60,
    concessionariaMax: 2.40,
    alertaCET: 2.50,      // alerta acima disso
  },

  // Seguro médio por segmento (R$/ano)
  seguro: {
    hatch_popular: { min: 3000, max: 5000, medio: 4000 },
    sedan_medio:   { min: 4500, max: 7000, medio: 5500 },
    suv_compacto:  { min: 5000, max: 9000, medio: 7000 },
    pickup:        { min: 7000, max: 14000, medio: 10000 },
  },

  // CUB médio por m² (R$)
  cub: {
    simples:  1800,
    padrao:   2400,
    alto:     3200,
    luxo:     4500,
  },

  // Financiamento imóvel Caixa 2025 (% a.a.)
  imobiliario: {
    sfh_tr:    10.99,
    sfh_ipca:  4.21,
    sbpe:      13.50,
  },
};

// ------------------------------------------------------------
// FINANCIAMENTO — Sistema Price (parcela fixa)
// ------------------------------------------------------------
export function calcParcela(pv: number, taxaMensal: number, n: number): number {
  if (n <= 0) return 0;
  if (taxaMensal === 0) return pv / n;
  const r = taxaMensal / 100;
  return (pv * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export interface ResultadoFinanciamento {
  parcela: number;
  totalPago: number;
  juros: number;
  pctJuros: number;       // juros / valor original
  alertaCaro: boolean;    // taxa > limite CET
}

export function calcFinanciamento(
  valorCarro: number,
  entrada: number,
  taxaMensal: number,
  prazo: number
): ResultadoFinanciamento {
  const financiado = valorCarro - entrada;
  const parcela = calcParcela(financiado, taxaMensal, prazo);
  const totalPago = parcela * prazo + entrada;
  const juros = totalPago - valorCarro;
  return {
    parcela,
    totalPago,
    juros,
    pctJuros: valorCarro > 0 ? (juros / valorCarro) * 100 : 0,
    alertaCaro: taxaMensal > TAXAS_BR.financiamento.alertaCET,
  };
}

// ------------------------------------------------------------
// CUSTO DE OPORTUNIDADE (Selic)
// ------------------------------------------------------------
export function selicMensal(selicAnual: number): number {
  return Math.pow(1 + selicAnual / 100, 1 / 12) - 1;
}

export function custoOportunidadeMes(valor: number, selicAnual: number): number {
  return valor * selicMensal(selicAnual);
}

export function custoOportunidadeAcumulado(valor: number, selicAnual: number, anos: number): number {
  return valor * (Math.pow(1 + selicAnual / 100, anos) - 1);
}

// ------------------------------------------------------------
// DESVALORIZAÇÃO FIPE estimada por idade do veículo
// ------------------------------------------------------------
export function taxaDesvalorizacaoAnual(anoVeiculo: number): number {
  const idade = new Date().getFullYear() - anoVeiculo;
  if (idade <= 0) return 0.15;   // novo: -15% no 1º ano
  if (idade <= 1) return 0.15;
  if (idade <= 3) return 0.12;
  if (idade <= 6) return 0.09;
  return 0.07;
}

export function desvalorizacaoMensal(valor: number, anoVeiculo: number): number {
  return (valor * taxaDesvalorizacaoAnual(anoVeiculo)) / 12;
}

// ------------------------------------------------------------
// COMBUSTÍVEL
// ------------------------------------------------------------
export function custoCombutivelMes(
  kmMes: number,
  consumoKmL: number,
  precoLitro: number
): number {
  if (consumoKmL <= 0) return 0;
  return (kmMes / consumoKmL) * precoLitro;
}

// ------------------------------------------------------------
// IPVA
// ------------------------------------------------------------
export function calcIPVA(valorCarro: number, estado: string): number {
  const aliq = TAXAS_BR.ipva[estado] ?? 0.04;
  return valorCarro * aliq;
}

// ------------------------------------------------------------
// CUSTO TOTAL MENSAL
// ------------------------------------------------------------
export interface CustoMensalDetalhado {
  parcela: number;
  combustivel: number;
  seguro: number;
  ipva: number;
  manutencao: number;
  estacionamento: number;
  desvalorizacao: number;
  total: number;
  custoPorKm: number;
}

export function calcCustoMensal(params: {
  valorCarro: number;
  anoModelo: number;
  estado: string;
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
  ipvaManual?: number;
}): CustoMensalDetalhado {
  const {
    valorCarro, anoModelo, estado, kmMes, consumo,
    precoCombustivel, financiar, entrada, taxaMensal, prazo,
    seguroAnual, manutencaoAnual, estacionamentoMes, ipvaManual,
  } = params;

  const parcela = financiar
    ? calcParcela(valorCarro - entrada, taxaMensal, prazo)
    : 0;

  const combustivel = custoCombutivelMes(kmMes, consumo, precoCombustivel);
  const seguro = seguroAnual / 12;
  const ipvaAnual = ipvaManual ?? calcIPVA(valorCarro, estado);
  const ipva = ipvaAnual / 12;
  const manutencao = manutencaoAnual / 12;
  const desvalorizacao = desvalorizacaoMensal(valorCarro, anoModelo);

  const total = parcela + combustivel + seguro + ipva + manutencao + estacionamentoMes + desvalorizacao;
  const custoPorKm = kmMes > 0 ? total / kmMes : 0;

  return {
    parcela,
    combustivel,
    seguro,
    ipva,
    manutencao,
    estacionamento: estacionamentoMes,
    desvalorizacao,
    total,
    custoPorKm,
  };
}

// ------------------------------------------------------------
// CALCULADORA DE VIAGEM
// ------------------------------------------------------------
export function calcViagem(params: {
  kmTotal: number;
  consumo: number;
  precoCombustivel: number;
  pedagios: number;
  hospedagemNoche: number;
  noites: number;
  alimentacaoDia: number;
  dias: number;
  pessoas: number;
}): { totalGeral: number; porPessoa: number; soCombustivel: number } {
  const combustivel = (params.kmTotal / (params.consumo || 1)) * params.precoCombustivel;
  const hospedagem = params.hospedagemNoche * params.noites;
  const alimentacao = params.alimentacaoDia * params.dias;
  const totalGeral = combustivel + params.pedagios + hospedagem + alimentacao;
  return {
    totalGeral,
    porPessoa: params.pessoas > 0 ? totalGeral / params.pessoas : totalGeral,
    soCombustivel: combustivel,
  };
}

// ------------------------------------------------------------
// CALCULADORA DE OBRA
// ------------------------------------------------------------
export function calcObra(params: {
  areaM2: number;
  tipoCub: keyof typeof TAXAS_BR.cub;
  contingencia: number;   // % ex: 20
  financiar: boolean;
  entrada: number;
  taxaMensal: number;
  prazo: number;
}): { custoBase: number; comContingencia: number; parcela: number; totalFinanciado: number } {
  const cubUnitario = TAXAS_BR.cub[params.tipoCub] ?? TAXAS_BR.cub.padrao;
  const custoBase = params.areaM2 * cubUnitario;
  const comContingencia = custoBase * (1 + params.contingencia / 100);

  const financiado = comContingencia - params.entrada;
  const parcela = params.financiar
    ? calcParcela(financiado, params.taxaMensal, params.prazo)
    : 0;
  const totalFinanciado = params.financiar ? parcela * params.prazo + params.entrada : comContingencia;

  return { custoBase, comContingencia, parcela, totalFinanciado };
}

// ------------------------------------------------------------
// COMPARATIVO: Carro vs Uber/99
// ------------------------------------------------------------
export function calcComparativo(params: {
  kmMes: number;
  custoTotalCarroMes: number;
  precoUberPorKm: number;
}): {
  custoUberMes: number;
  diferenca: number;
  maisBarato: 'carro' | 'uber';
  breakEvenKm: number;    // km/mês em que se igualam
} {
  const custoUberMes = params.kmMes * params.precoUberPorKm;
  const diferenca = Math.abs(params.custoTotalCarroMes - custoUberMes);
  const maisBarato = params.custoTotalCarroMes <= custoUberMes ? 'carro' : 'uber';

  // Custo fixo do carro (sem combustível) / (preço Uber/km - custo combustível/km)
  // Simplificado: custoFixo / (uberKm - combKm)
  const breakEvenKm = params.precoUberPorKm > 0
    ? Math.round(params.custoTotalCarroMes / params.precoUberPorKm)
    : 0;

  return { custoUberMes, diferenca, maisBarato, breakEvenKm };
}
