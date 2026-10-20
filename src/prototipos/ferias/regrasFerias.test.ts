import { expect, it } from 'vitest';
import { duracoesPermitidas, prazoFechamentoFolha, selecionarPeriodoMaisAntigo } from './regrasFerias';
import { validarSolicitacaoRecesso, type SolicitacaoRecessoInput } from './validarSolicitacaoRecesso';

it('seleciona o mais antigo com saldo sem alterar a ordem da fonte', () => {
  const periodos = [{inicio:'2025-01-01',fim:'2025-12-31',saldo:30},{inicio:'2023-01-01',fim:'2023-12-31',saldo:0},{inicio:'2024-01-01',fim:'2024-12-31',saldo:20}];
  expect(selecionarPeriodoMaisAntigo(periodos)?.inicio).toBe('2024-01-01');
  expect(periodos[0].inicio).toBe('2025-01-01');
  expect(selecionarPeriodoMaisAntigo([])).toBeUndefined();
});

it('restringe professor SEDUC e bloqueia sobra de cinco dias', () => {
  expect(duracoesPermitidas(30,'SEDUC/MT','Professor')).toEqual([30,15]);
  expect(duracoesPermitidas(30,'SEDUC/MT','Técnico Administrativo')).toEqual([30,20,15,10]);
  expect(duracoesPermitidas(20)).toEqual([20,10]);
  expect(duracoesPermitidas(20,'SEDUC','Professor')).toEqual([]);
});

it('usa calendário mensal da folha, inclusive virada de ano', () => {
  expect(prazoFechamentoFolha('2026-10-15')).toBe('2026-10-15');
  expect(prazoFechamentoFolha('2026-10-16')).toBe('2026-11-15');
  expect(prazoFechamentoFolha('2026-12-20')).toBe('2027-01-15');
  expect(prazoFechamentoFolha('2026-10-16',{'2026-10':'2026-10-20'})).toBe('2026-10-20');
});

const base: SolicitacaoRecessoInput = {tipo_vinculo:'ESTAGIARIO',data_inicio_contrato:'2026-01-10',data_fim_contrato:'2028-01-09',data_solicitacao:'2026-01-20',data_inicio_recesso:'2026-07-10',quantidade_dias_solicitados:15,numero_parcela:1,saldo_dias_disponivel:15};
it('exige seis meses completos para estagiário e doze para residente', () => {
  expect(validarSolicitacaoRecesso({...base,data_inicio_recesso:'2026-07-09'}).erro_codigo).toBe('CARENCIA_PERIODO_AQUISITIVO');
  expect(validarSolicitacaoRecesso(base).sucesso).toBe(true);
  expect(validarSolicitacaoRecesso({...base,tipo_vinculo:'RESIDENTE',data_inicio_recesso:'2027-01-09'}).erro_codigo).toBe('CARENCIA_PERIODO_AQUISITIVO');
  expect(validarSolicitacaoRecesso({...base,tipo_vinculo:'RESIDENTE',data_inicio_recesso:'2027-01-10'}).sucesso).toBe(true);
});
it('rejeita durações arbitrárias e sobra de cinco dias no recesso', () => {
  expect(validarSolicitacaoRecesso({...base,quantidade_dias_solicitados:12}).sucesso).toBe(false);
  expect(validarSolicitacaoRecesso({...base,saldo_dias_disponivel:20}).sucesso).toBe(false);
});
