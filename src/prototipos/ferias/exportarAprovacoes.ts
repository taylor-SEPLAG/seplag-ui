import ExcelJS from 'exceljs';
import type { FeriasRegistro } from './FeriasPages';
import { tipoAprovacao, dataBrAprovacao, diasAprovacao, periodoAprovacao, situacaoAprovacao } from './aprovacoesModel';
export function criarExcelAprovacoes(registros:FeriasRegistro[]) {
  const livro=new ExcelJS.Workbook(),aba=livro.addWorksheet('Aprovações');
  aba.addRow(['Servidor','Matrícula / Vínculo','Órgão / Entidade','Lotação','Período','Dias','Tipo','Situação atual','Validade da solicitação']);
  registros.forEach(r => aba.addRow([r.servidorNome,`${r.matricula} / ${r.numeroVinculo || 'não informado'}`,r.orgao,r.setor,periodoAprovacao(r),diasAprovacao(r),tipoAprovacao(r),situacaoAprovacao(r),dataBrAprovacao(r.dataLimiteValidacaoChefia)]));
  aba.getRow(1).eachCell(c => {c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF173B63'}};c.font={bold:true,color:{argb:'FFFFFFFF'}};});
  aba.columns.forEach(c => {let largura=12;c.eachCell?.({includeEmpty:false},celula => {largura=Math.max(largura,String(celula.value ?? '').length+2);});c.width=Math.min(65,largura);});
  aba.getColumn(6).numFmt='0';aba.autoFilter={from:'A1',to:'I1'};aba.views=[{state:'frozen',ySplit:1}];
  return livro;
}
export async function exportarAprovacoes(registros:FeriasRegistro[]) {
  const buffer=await criarExcelAprovacoes(registros).xlsx.writeBuffer();
  const url=URL.createObjectURL(new Blob([new Uint8Array(buffer as ArrayBuffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  const a=document.createElement('a');a.href=url;a.download=`SIGEP_Aprovacoes_Ferias_${new Date().toLocaleDateString('sv-SE',{timeZone:'America/Cuiaba'})}.xlsx`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(() => URL.revokeObjectURL(url),1000);
}
