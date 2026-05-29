// formatters.ts — utilitários de formatação para o Brasil

export function fmtMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function fmtMoedaDec(valor: number, casas = 2): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function fmtPct(valor: number, casas = 1): string {
  return `${valor.toFixed(casas).replace('.', ',')}%`;
}

export function fmtNum(valor: number, casas = 0): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function fmtKm(km: number): string {
  return `${Math.round(km).toLocaleString('pt-BR')} km`;
}
