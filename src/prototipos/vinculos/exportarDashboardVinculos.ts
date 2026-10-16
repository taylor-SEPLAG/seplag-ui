import ExcelJS from 'exceljs';
import type { Vinculo } from './VinculoV2Page';
import { resumoVinculos } from './dashboardVinculosModel';
import { filtrarVinculos, situacaoDoVinculo, type FiltrosVinculos } from './vinculosConsulta';

export function criarExcelVinculos(registros: Vinculo[], filtros: FiltrosVinculos, tipos: string[]) {
  const dados = [...new Map(filtrarVinculos(registros, filtros).map(v => [v.id, v])).values()];
  const resumo = resumoVinculos(dados, tipos);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIGEP';
  const contexto = [
    ['Tipo de Vínculo', filtros.tipo || 'Todos'], ['Órgão/Entidade', filtros.orgao || 'Todos'],
    ['Situação', filtros.situacao || 'Todas'], ['Forma de Encerramento', filtros.forma || 'Todas'],
    ['Período inicial', filtros.inicio || 'Não aplicado'], ['Período final', filtros.fim || 'Não aplicado'],
  ];
  function aba(nome: string, colunas: string[], linhas: (string | number)[][]) {
    const sheet = workbook.addWorksheet(nome);
    sheet.addRow([nome]).font = { bold: true, size: 16, color: { argb: 'FF173B63' } };
    contexto.forEach(linha => sheet.addRow(linha));
    sheet.addRow([]);
    const header = sheet.addRow(colunas);
    header.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF173B63' } };
    });
    linhas.forEach(linha => sheet.addRow(linha).eachCell(cell => { if (typeof cell.value === 'number') cell.numFmt = '0'; }));
    colunas.forEach((coluna, i) => { sheet.getColumn(i + 1).width = Math.min(60, linhas.reduce((max, linha) => Math.max(max, String(linha[i] ?? '').length + 2), Math.max(18, coluna.length + 2))); });
    sheet.autoFilter = { from: { row: header.number, column: 1 }, to: { row: header.number, column: colunas.length } };
    sheet.views = [{ state: 'frozen', ySplit: header.number }];
  }
  aba('Resumo Geral', ['Indicador', 'Quantidade'], [
    ['Tipos de Vínculo', tipos.length], ['Pessoas com vínculo ativo', resumo.pessoasVigentes],
    ['Pessoas com vínculo encerrado', resumo.pessoasEncerradas], ['Total de vínculos', resumo.total],
    ['Vínculos vigentes', resumo.vigentes], ['Vínculos encerrados', resumo.encerrados],
  ]);
  aba('Resumo por Tipo', ['Tipo de Vínculo', 'Ativos', 'Encerrados', 'Total', 'Principal Forma de Encerramento'], resumo.linhas.map(v => [v.tipo, v.vigentes, v.encerrados, v.total, v.principalForma]));
  aba('Forma de Encerramento', ['Forma de Encerramento', 'Quantidade'], resumo.formas.map(v => [v.nome, v.quantidade]));
  aba('Vínculos', ['Tipo de Vínculo', 'Órgão/Entidade', 'Cargo', 'Situação', 'Data de início', 'Data de Encerramento', 'Forma de Encerramento'], dados.map(v => [v.tipo, v.orgao, v.cargo, situacaoDoVinculo(v) === 'Ativo' ? 'Ativo' : 'Encerrado', v.inicio, v.vacanciaData || '', v.vacanciaForma || '']));
  return workbook;
}

export async function exportarDashboardVinculos(registros: Vinculo[], filtros: FiltrosVinculos, tipos: string[]) {
  const buffer = await criarExcelVinculos(registros, filtros, tipos).xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([new Uint8Array(buffer as ArrayBuffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  const data = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Cuiaba', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  link.href = url;
  link.download = `SIGEP_Dashboard_Vinculos_${data}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
