import ExcelJS from 'exceljs';
import { SITUACOES_CERTAME } from '../controlePss/certame/dominios';
import { descricaoCargoNomeados, resumoNomeados, type totaisNomeadosPorEdital, type FiltrosNomeados, type LinhaNomeados } from './dashboardNomeadosModel';

export function criarExcelNomeados(linhas: LinhaNomeados[], filtros: FiltrosNomeados, homologados: number, totais?: ReturnType<typeof totaisNomeadosPorEdital>) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIGEP';
  const resumo = resumoNomeados(totais || linhas);
  const vagasIncompletas = (totais || linhas).some(l => l.vagasInformadas === false);
  const disponibilidadeIncompleta = (totais || linhas).some(l => l.candidatosInformados === false);
  const reservaIncompleta = (totais || linhas).some(l => l.reservaInformada === false);
  const contexto = [
    ['Segmentação', filtros.tipo === 'Concurso' ? 'Concurso' : filtros.tipo || 'Todos'],
    ['Ano do edital', filtros.ano || 'Todos'], ['Órgão/Entidade', filtros.orgao || 'Todos'],
    ['Edital', linhas.find(l => l.certameId === filtros.edital)?.edital || filtros.edital || 'Todos'],
    ['Cargo/Função', filtros.cargo || 'Todos'], ['Situação do edital', SITUACOES_CERTAME.find(s => s.value === filtros.situacao)?.label || 'Todas'],
  ];
  function aba(nome: string, colunas: string[], dados: (string | number)[][]) {
    const sheet = workbook.addWorksheet(nome);
    sheet.addRow([nome]).font = { bold: true, size: 16, color: { argb: 'FF173B63' } };
    contexto.forEach(linha => sheet.addRow(linha));
    sheet.addRow([]);
    const header = sheet.addRow(colunas);
    header.height = 36;
    header.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF173B63' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    dados.forEach(linha => sheet.addRow(linha).eachCell(cell => { if (typeof cell.value === 'number') cell.numFmt = '0'; }));
    sheet.autoFilter = { from: { row: header.number, column: 1 }, to: { row: header.number, column: colunas.length } };
    sheet.views = [{ state: 'frozen', ySplit: header.number }];
    colunas.forEach((coluna,i) => { sheet.getColumn(i+1).width = Math.min(55, dados.reduce((max,linha) => Math.max(max,String(linha[i] ?? '').length+2),Math.max(18,coluna.length+2))); });
    return sheet;
  }
  aba('Visão Geral', ['Indicador', 'Quantidade'], [
    ['Editais em Homologação',homologados], ['Nomeados',resumo.nomeados], ['Ingressados',resumo.ingressados],
    ['Ingressos Pendentes',resumo.ingressosPendentes], ['A nomear',disponibilidadeIncompleta ? 'Vagas e cadastro de reserva não disponíveis' : resumo.aNomear],
  ]);
  const dadosLinha = (l: LinhaNomeados): (string | number)[] => [l.edital,l.orgao,descricaoCargoNomeados(l),l.vagasInformadas === false ? 'Não informado' : l.vagas,l.reservaInformada === false ? 'Não informado' : l.cadastroReserva || 0,l.nomeados,l.ingressados,l.ingressosPendentes,l.tipo === 'Concurso' ? l.tomaramPosse : '—',l.apresentaramServico,l.naoCompareceram,l.candidatosInformados === false ? 'Vagas e cadastro de reserva não disponíveis' : l.aNomear];
  const dados = totais ? totais.flatMap(t => [
    [t.edital,[...new Set(t.itens.map(l => l.orgao))].join(', '),'Total do edital',t.vagasInformadas ? t.vagas : 'Não informado',t.reservaInformada ? t.cadastroReserva : 'Não informado',t.nomeados,t.ingressados,t.ingressosPendentes,t.itens[0]?.tipo === 'Concurso' ? t.tomaramPosse : '—',t.apresentaramServico,t.naoCompareceram,t.candidatosInformados ? t.aNomear : 'Vagas e cadastro de reserva não disponíveis'],
    ...t.itens.map(dadosLinha),
  ]) : linhas.map(dadosLinha);
  const sheet = aba('Vagas e nomeações', ['Edital','Órgão/Entidade','Cargo/Função','Vagas','Cadastro de Reserva','Nomeados','Ingressados','Ingressos Pendentes','Tomaram Posse','Apresentaram-se para o serviço','Não compareceram','A nomear'],dados);
  const total = sheet.addRow(['Total filtrado','','',vagasIncompletas ? 'Não informado' : resumo.vagas,reservaIncompleta ? 'Não informado' : resumo.cadastroReserva,resumo.nomeados,resumo.ingressados,resumo.ingressosPendentes,resumo.tomaramPosse,resumo.apresentaramServico,resumo.naoCompareceram,disponibilidadeIncompleta ? 'Vagas e cadastro de reserva não disponíveis' : resumo.aNomear]);
  total.eachCell(cell => { cell.font = { bold: true }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDF3FA' } }; if (typeof cell.value === 'number') cell.numFmt = '0'; });
  return workbook;
}

export async function exportarExcelNomeados(linhas: LinhaNomeados[], filtros: FiltrosNomeados, homologados: number, totais?: ReturnType<typeof totaisNomeadosPorEdital>) {
  const buffer = await criarExcelNomeados(linhas,filtros,homologados,totais).xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([new Uint8Array(buffer as ArrayBuffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  const data = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Cuiaba',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  link.href = url; link.download = `SIGEP_Dashboard_Nomeados_${data}.xlsx`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
