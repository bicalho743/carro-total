// financeiro.ts

export const TAXAS_BR = {
  selic: 13.75,
  gasolina: { mediaBrasil: 6.20, etanol: 4.30, diesel: 6.50 },
  financiamento: {
    cdcMedio: 1.89,
    fintechMin: 1.60,
    concessionariaMax: 2.40,
    alertaCET: 2.50,
  },
  // Desvalorização real por ano (sobre valor do ano anterior)
  // Fonte: análise FIPE média mercado brasileiro
  desvalorizacaoPorAno: [0.12, 0.08, 0.07, 0.06, 0.05],
};

export function calcParcela(pv: number, taxaMensal: number, n: number): number {
  if (n <= 0 || pv <= 0) return 0;
  if (taxaMensal === 0) return pv / n;
  const r = taxaMensal / 100;
  return (pv * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export interface ResultadoFinanciamento {
  financiado: number;
  parcela: number;
  totalPago: number;
  juros: number;
  pctJuros: number;
  alertaCaro: boolean;
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
    financiado,
    parcela,
    totalPago,
    juros,
    pctJuros: valorCarro > 0 ? (juros / valorCarro) * 100 : 0,
    alertaCaro: taxaMensal > TAXAS_BR.financiamento.alertaCET,
  };
}

export function custoOportunidadeMes(valor: number, selicAnual: number): number {
  return valor * (Math.pow(1 + selicAnual / 100, 1 / 12) - 1);
}

export function custoOportunidadeAcumulado(valor: number, selicAnual: number, anos: number): number {
  return valor * (Math.pow(1 + selicAnual / 100, anos) - 1);
}

// Desvalorização acumulada realista em N anos (máx 5)
// Aplica sobre o valor do ano anterior, não sobre o original
export function calcDesvalorizacaoAcumulada(valorInicial: number, anos: number): {
  valorAtual: number;
  perdaTotal: number;
  perdaMensal: number;
  pctTotal: number;
} {
  const taxas = TAXAS_BR.desvalorizacaoPorAno;
  let valor = valorInicial;
  const anosCalc = Math.min(anos, taxas.length);
  for (let i = 0; i < anosCalc; i++) {
    valor = valor * (1 - taxas[i]);
  }
  const perdaTotal = valorInicial - valor;
  return {
    valorAtual: valor,
    perdaTotal,
    perdaMensal: perdaTotal / (anosCalc * 12),
    pctTotal: (perdaTotal / valorInicial) * 100,
  };
}

// Desvalorização mensal no 1º ano (para usar no custo mensal)
export function desvalorizacaoMensalAno1(valorCarro: number): number {
  return (valorCarro * TAXAS_BR.desvalorizacaoPorAno[0]) / 12;
}

export function custoCombutivelMes(kmMes: number, consumoKmL: number, precoLitro: number): number {
  if (consumoKmL <= 0) return 0;
  return (kmMes / consumoKmL) * precoLitro;
}

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
}): CustoMensalDetalhado {
  const {
    valorCarro, kmMes, consumo, precoCombustivel,
    financiar, entrada, taxaMensal, prazo,
    seguroAnual, manutencaoAnual, estacionamentoMes, ipvaPercentual,
  } = params;

  const parcela = financiar ? calcParcela(valorCarro - entrada, taxaMensal, prazo) : 0;
  const combustivel = custoCombutivelMes(kmMes, consumo, precoCombustivel);
  const seguro = seguroAnual / 12;
  const ipva = (valorCarro * (ipvaPercentual / 100)) / 12;
  const manutencao = manutencaoAnual / 12;
  const desvalorizacao = desvalorizacaoMensalAno1(valorCarro);
  const total = parcela + combustivel + seguro + ipva + manutencao + estacionamentoMes + desvalorizacao;
  const custoPorKm = kmMes > 0 ? total / kmMes : 0;

  return { parcela, combustivel, seguro, ipva, manutencao, estacionamento: estacionamentoMes, desvalorizacao, total, custoPorKm };
}
