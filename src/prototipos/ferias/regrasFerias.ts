export interface PeriodoComSaldo { inicio: string; fim: string; saldo: number }

export function selecionarPeriodoMaisAntigo(periodos: PeriodoComSaldo[]) {
  return [...periodos].filter(p => p.saldo > 0).sort((a, b) => a.inicio.localeCompare(b.inicio))[0];
}

export function duracoesPermitidas(saldo: number, orgao = '', cargo = '') {
  const professorSeduc = /SEDUC/i.test(orgao) && /professor|docente/i.test(cargo);
  return (professorSeduc ? [30, 15] : [30, 20, 15, 10])
    .filter(dias => dias <= saldo && saldo - dias !== 5);
}

// Calendário do protótipo. Em produção, estas datas vêm do calendário da folha.
// Regra geral de fechamento: dia 15; em dezembro, antecipado para o dia 5 (fechamento
// antecipado da folha de fim de ano) — ambos sobrepostos pelo calendário manual, se configurado.
function diaPadraoFechamento(mesChave: string) {
  return mesChave.endsWith('-12') ? '05' : '15';
}

export function prazoFechamentoFolha(hoje: string, calendario: Record<string, string> = {}) {
  const mes = hoje.slice(0, 7);
  const fechamento = calendario[mes] ?? `${mes}-${diaPadraoFechamento(mes)}`;
  if (hoje <= fechamento) return fechamento;
  const proximo = new Date(`${mes}-01T12:00:00Z`);
  proximo.setUTCMonth(proximo.getUTCMonth() + 1);
  const chave = proximo.toISOString().slice(0, 7);
  return calendario[chave] ?? `${chave}-${diaPadraoFechamento(chave)}`;
}
