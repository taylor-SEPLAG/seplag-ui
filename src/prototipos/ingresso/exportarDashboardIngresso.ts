import ExcelJS from 'exceljs';
import { SITUACOES, filtrarDados, pendente, resumirDados, type FiltrosDashboard, type RegistroDashboard } from './dashboardIngressoModel';

export function criarExcelDashboard(registros: RegistroDashboard[], filtros: FiltrosDashboard) {
  const dados = [...new Map(filtrarDados(registros, filtros).map(r => [r.id, r])).values()];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIGEP';
  const tipo = (valor: string) => valor === 'Concurso' ? 'Concurso Público' : valor || 'Todos';
  const descricaoFiltros = [
    ['Tipo de Ingresso', tipo(filtros.tipo)],
    ['Edital', registros.find(r => String(r.editalId) === filtros.edital)?.edital || filtros.edital || 'Todos'],
    ['Órgão/Entidade', filtros.orgao || 'Todos'], ['Cargo/Especialidade', filtros.cargo || 'Todos'],
    ['Período inicial', filtros.inicio || 'Não aplicado'], ['Período final', filtros.fim || 'Não aplicado'],
    ...(filtros.situacao ? [['Situação', SITUACOES.find(s => s.value === filtros.situacao)?.label || filtros.situacao]] : []),
    ...(filtros.pendentes ? [['Somente pendentes', 'Sim']] : []),
  ];
  function planilha(nome: string, cabecalhos: string[], linhas: (string | number)[][]) {
    const sheet = workbook.addWorksheet(nome);
    sheet.mergeCells(1, 1, 1, cabecalhos.length);
    sheet.getCell(1, 1).value = nome;
    sheet.getCell(1, 1).font = { bold: true, size: 16, color: { argb: 'FF083B66' } };
    sheet.addRow(['Filtros aplicados']);
    descricaoFiltros.forEach(f => sheet.addRow(f));
    sheet.addRow(['Período: conclusão para ingressados; nomeação/convocação para os demais.']);
    sheet.addRow([]);
    const header = sheet.addRow(cabecalhos);
    header.height = 30;
    header.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF083B66' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    linhas.forEach(linha => sheet.addRow(linha).eachCell(cell => { if (typeof cell.value === 'number') cell.numFmt = '0'; }));
    sheet.autoFilter = { from: { row: header.number, column: 1 }, to: { row: header.number, column: cabecalhos.length } };
    sheet.views = [{ state: 'frozen', ySplit: header.number }];
    cabecalhos.forEach((titulo, i) => {
      sheet.getColumn(i + 1).width = Math.min(60, Math.max(18, titulo.length + 2, ...linhas.map(linha => String(linha[i] ?? '').length + 2)));
    });
  }
  const resumo = resumirDados(dados);
  const indicadores = ['Concursos em andamento', 'Processos seletivos em andamento', 'Total de ingressados', 'Total de ingressos pendentes', 'Encerrados sem ingresso'];
  planilha('Resumo Geral', ['Indicador / Situação', 'Quantidade'], [
    ...indicadores.map((nome, i) => [nome, resumo[i]]),
    ...SITUACOES.filter(s => !s.tipo || !filtros.tipo || s.tipo === filtros.tipo).map(s => [s.label, dados.filter(r => r.situacao === s.value).length]),
  ] as (string | number)[][]);
  function agrupar(itens: RegistroDashboard[], dimensoes: (r: RegistroDashboard) => (string | number)[]) {
    const grupos = new Map<string, { valores: (string | number)[]; quantidade: number }>();
    itens.forEach(r => {
      const valores = dimensoes(r); const chave = JSON.stringify(valores);
      const grupo = grupos.get(chave);
      if (grupo) grupo.quantidade++; else grupos.set(chave, { valores, quantidade: 1 });
    });
    return [...grupos.values()].sort((a, b) => b.quantidade - a.quantidade).map(g => [...g.valores, g.quantidade]);
  }
  planilha('Ingressados', ['Edital', 'Órgão/Entidade', 'Cargo/Especialidade', 'Tipo de Ingresso', 'Ano de conclusão', 'Quantidade de ingressados'],
    agrupar(dados.filter(r => r.situacao === 'Ingresso Concluído'), r => [r.edital, r.orgao, r.cargo, tipo(r.tipo), r.conclusao ? Number(r.conclusao.slice(0, 4)) : 'Não informado']));
  planilha('Pendências por Edital', ['Edital', 'Órgão/Entidade', 'Cargo/Especialidade', 'Situação do Ingresso', 'Quantidade de ingressos pendentes'],
    agrupar(dados.filter(pendente), r => [r.edital, r.orgao, r.cargo, SITUACOES.find(s => s.value === r.situacao)?.label || r.situacao]));
  return workbook;
}

export async function exportarDashboardIngresso(registros: RegistroDashboard[], filtros: FiltrosDashboard) {
  const buffer = await criarExcelDashboard(registros, filtros).xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(buffer as ArrayBuffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const data = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Cuiaba', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  link.href = url;
  link.download = `SIGEP_Dashboard_Ingresso_${data}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
